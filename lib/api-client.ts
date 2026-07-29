import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, HttpStatusCode, RetryConfig } from '@/types/api';
import { getAccessToken, refreshAccessToken } from '@/lib/auth';

class ApiClient {
  private instance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(baseURL?: string) {
    this.instance = axios.create({
      baseURL: baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.company.com/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.retryConfig = {
      attempts: 3,
      delay: 1000,
      backoff: 'exponential',
      retryCondition: (error: any) => {
        return (
          error.response?.status >= 500 ||
          error.response?.status === HttpStatusCode.TOO_MANY_REQUESTS ||
          error.code === 'NETWORK_ERROR'
        );
      },
    };

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth token
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === HttpStatusCode.UNAUTHORIZED &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Redirect to login if refresh fails
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      return new ApiError(
        status,
        data.error || 'API_ERROR',
        data.message || 'An error occurred',
        data.details,
        data.requestId
      );
    } else if (error.request) {
      return new ApiError(
        0,
        'NETWORK_ERROR',
        'Network error occurred',
        'Unable to connect to the server'
      );
    } else {
      return new ApiError(
        0,
        'UNKNOWN_ERROR',
        error.message || 'Unknown error occurred'
      );
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempt = 1
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (attempt < this.retryConfig.attempts && this.retryConfig.retryCondition(error)) {
        const delay = this.retryConfig.backoff === 'exponential'
          ? this.retryConfig.delay * Math.pow(2, attempt - 1)
          : this.retryConfig.delay;

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.retryRequest(() => this.instance.get<T>(url, config));
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.retryRequest(() => this.instance.post<T>(url, data, config));
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.retryRequest(() => this.instance.put<T>(url, data, config));
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.retryRequest(() => this.instance.delete<T>(url, config));
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.retryRequest(() => this.instance.patch<T>(url, data, config));
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
