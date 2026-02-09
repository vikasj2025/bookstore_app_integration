import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, RequestConfig, ErrorResponse } from '@/types/api';
import { toast } from 'react-hot-toast';

// API Client Configuration
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private retryQueue: Map<string, number> = new Map();

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1',
      timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            requestId,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retries
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response] ${response.status} ${response.config.url}`, {
            requestId: response.config.headers['X-Request-ID'],
            data: response.data,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response) {
          const { status, data } = error.response;
          const requestId = originalRequest?.headers?.['X-Request-ID'];

          // Log error in development
          if (process.env.NODE_ENV === 'development') {
            console.error(`[API Error] ${status} ${originalRequest?.url}`, {
              requestId,
              error: data,
            });
          }

          // Handle specific error cases
          switch (status) {
            case 401:
              await this.handleUnauthorized(originalRequest);
              break;
            case 429:
              return this.handleRateLimit(error, originalRequest);
            case 500:
            case 502:
            case 503:
            case 504:
              return this.handleServerError(error, originalRequest);
            default:
              this.handleClientError(error);
          }
        } else if (error.request) {
          // Network error
          this.handleNetworkError(error, originalRequest);
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleUnauthorized(originalRequest?: AxiosRequestConfig): Promise<void> {
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const response = await this.refreshAuthToken(refreshToken);
          const { accessToken } = response.data;
          
          localStorage.setItem('auth_token', accessToken);
          
          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return this.client(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          this.clearAuthTokens();
          window.location.href = '/login';
        }
      } else {
        // No refresh token or retry failed
        this.clearAuthTokens();
        window.location.href = '/login';
      }
    }
  }

  private async handleRateLimit(error: AxiosError, originalRequest?: AxiosRequestConfig): Promise<AxiosResponse> {
    const retryAfter = error.response?.headers['retry-after'];
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retryDelay;
    
    toast.error('Too many requests. Please wait a moment.');
    
    await this.delay(delay);
    
    if (originalRequest) {
      return this.client(originalRequest);
    }
    
    throw error;
  }

  private async handleServerError(error: AxiosError, originalRequest?: AxiosRequestConfig): Promise<AxiosResponse> {
    const requestKey = `${originalRequest?.method}_${originalRequest?.url}`;
    const retryCount = this.retryQueue.get(requestKey) || 0;
    
    if (retryCount < this.config.retries && originalRequest) {
      this.retryQueue.set(requestKey, retryCount + 1);
      
      const delay = this.config.retryDelay * Math.pow(2, retryCount); // Exponential backoff
      await this.delay(delay);
      
      return this.client(originalRequest);
    }
    
    this.retryQueue.delete(requestKey);
    toast.error('Server error. Please try again later.');
    throw error;
  }

  private handleClientError(error: AxiosError): void {
    const errorResponse = error.response?.data as ErrorResponse;
    const message = errorResponse?.message || 'An unexpected error occurred';
    
    toast.error(message);
  }

  private handleNetworkError(error: AxiosError, originalRequest?: AxiosRequestConfig): void {
    toast.error('Network error. Please check your connection.');
    
    // Optionally retry network errors
    if (originalRequest) {
      const requestKey = `${originalRequest.method}_${originalRequest.url}`;
      const retryCount = this.retryQueue.get(requestKey) || 0;
      
      if (retryCount < this.config.retries) {
        this.retryQueue.set(requestKey, retryCount + 1);
        setTimeout(() => {
          this.client(originalRequest);
        }, this.config.retryDelay);
      }
    }
  }

  private createApiError(error: AxiosError): ApiError {
    const apiError = new Error(error.message) as ApiError;
    apiError.name = 'ApiError';
    apiError.status = error.response?.status;
    apiError.response = error.response?.data as ErrorResponse;
    apiError.code = error.code;
    
    return apiError;
  }

  private async refreshAuthToken(refreshToken: string): Promise<AxiosResponse> {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  private clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return this.formatResponse(response);
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return this.formatResponse(response);
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return this.formatResponse(response);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return this.formatResponse(response);
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return this.formatResponse(response);
  }

  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  }

  // Utility methods
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearAuth(): void {
    this.clearAuthTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getBaseURL(): string {
    return this.config.baseURL;
  }

  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client.defaults.baseURL = this.config.baseURL;
    this.client.defaults.timeout = this.config.timeout;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for testing or custom instances
export { ApiClient };
export default apiClient;
