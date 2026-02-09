import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiError, ApiClientConfig, RequestConfig, ResponseConfig } from '@/types/api';
import { getAuthToken, removeAuthToken } from '@/utils/auth';
import { toast } from '@/utils/toast';

/**
 * HTTP Client with authentication, error handling, and retry logic
 */
class HttpClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private retryQueue: Array<() => void> = [];
  private isRefreshing = false;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
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
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (process.env.NODE_ENV === 'development') {
          const duration = Date.now() - (response.config.metadata?.startTime || 0);
          console.log(`API Call: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 401 Unauthorized - Token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while token is being refreshed
            return new Promise((resolve) => {
              this.retryQueue.push(() => {
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processRetryQueue();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processRetryQueue(refreshError as Error);
            removeAuthToken();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
        refreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  }

  private processRetryQueue(error?: Error): void {
    this.retryQueue.forEach((callback) => {
      if (error) {
        callback();
      } else {
        callback();
      }
    });
    this.retryQueue = [];
  }

  private handleError(error: AxiosError): void {
    const apiError = this.parseApiError(error);
    
    // Show user-friendly error messages
    switch (error.response?.status) {
      case 400:
        toast.error(apiError.message || 'Invalid request. Please check your input.');
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('The requested resource was not found.');
        break;
      case 409:
        toast.error(apiError.message || 'A conflict occurred. Please try again.');
        break;
      case 422:
        // Validation errors are handled by form components
        break;
      case 429:
        toast.error('Too many requests. Please wait a moment and try again.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (!navigator.onLine) {
          toast.error('No internet connection. Please check your network.');
        } else {
          toast.error('An unexpected error occurred. Please try again.');
        }
    }

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', apiError);
    }
  }

  private parseApiError(error: AxiosError): ApiError {
    const response = error.response;
    
    if (response?.data) {
      return response.data as ApiError;
    }
    
    return {
      error: error.name || 'Unknown Error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: error.config?.url || '',
      status: response?.status || 0,
      traceId: response?.headers['x-trace-id'],
    };
  }

  // HTTP Methods with retry logic
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.requestWithRetry('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.requestWithRetry('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.requestWithRetry('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.requestWithRetry('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.requestWithRetry('DELETE', url, undefined, config);
  }

  private async requestWithRetry<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig,
    attempt = 1
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        method,
        url,
        data,
        ...config,
      });
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // Retry logic for transient errors
      if (
        attempt < this.config.retryAttempts &&
        this.shouldRetry(axiosError)
      ) {
        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
        return this.requestWithRetry(method, url, data, config, attempt + 1);
      }
      
      throw error;
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    if (!error.response) return true;
    
    const status = error.response.status;
    return status >= 500 || status === 429;
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.config.retryDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods
  getBaseURL(): string {
    return this.config.baseURL;
  }

  setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }
}

// Create and export HTTP client instance
const httpClientConfig: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.bookstore.com/v1',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
};

export const httpClient = new HttpClient(httpClientConfig);
export default httpClient;
