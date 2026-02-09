/**
 * HTTP API Client for the Online Bookstore Application
 * Provides typed HTTP communication with retry logic, error handling, and authentication
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { ApiClientConfig, ApiError, ErrorResponse, RequestConfig } from '@/types/api';
import { LoggerService } from '@/services/logger';
import { appConfig } from '@/config/app';

export class ApiClient {
  private client: AxiosInstance;
  private logger: LoggerService;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig, logger: LoggerService) {
    this.logger = logger;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;

    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor for authentication and logging
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;

        this.logger.debug('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          requestId,
        });

        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('API Response:', {
          status: response.status,
          url: response.config.url,
          requestId: response.config.headers['X-Request-ID'],
        });
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        this.logger.error('API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleAuthenticationFailure();
            return Promise.reject(this.createApiError(error));
          }
        }

        // Handle retry for transient errors
        if (this.shouldRetry(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          return this.retryRequest(originalRequest);
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  /**
   * Make HTTP request with typed response
   */
  async request<T = any>(config: RequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        method: config.method,
        url: config.url,
        data: config.data,
        params: config.params,
        headers: config.headers,
        timeout: config.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
    });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
    });
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(appConfig.auth.tokenStorageKey);
    } catch (error) {
      this.logger.warn('Failed to get auth token from storage:', error);
      return null;
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<void> {
    if (typeof window === 'undefined') return;

    const refreshToken = localStorage.getItem(appConfig.auth.refreshTokenStorageKey);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${appConfig.api.baseUrl}/auth/refresh`,
        { refreshToken },
        { timeout: appConfig.api.timeout }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem(appConfig.auth.tokenStorageKey, accessToken);
      localStorage.setItem(appConfig.auth.refreshTokenStorageKey, newRefreshToken);

      this.logger.info('Token refreshed successfully');
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Handle authentication failure
   */
  private handleAuthenticationFailure(): void {
    if (typeof window === 'undefined') return;

    // Clear stored tokens
    localStorage.removeItem(appConfig.auth.tokenStorageKey);
    localStorage.removeItem(appConfig.auth.refreshTokenStorageKey);
    localStorage.removeItem(appConfig.auth.userStorageKey);

    // Redirect to login page
    window.location.href = '/auth/login';
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      (error.response.status >= 500 && error.response.status < 600) ||
      error.response.status === 429 // Rate limiting
    );
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
    let lastError: AxiosError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Exponential backoff delay
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);

        this.logger.debug(`Retrying request (attempt ${attempt}/${this.retryAttempts})`);
        return await this.client(config);
      } catch (error) {
        lastError = error as AxiosError;
        this.logger.warn(`Retry attempt ${attempt} failed:`, error);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create standardized API error
   */
  private createApiError(error: AxiosError): ApiError {
    const apiError = new Error(error.message) as ApiError;
    apiError.name = 'ApiError';
    apiError.status = error.response?.status;
    apiError.code = error.code;
    apiError.response = error.response?.data as ErrorResponse;

    return apiError;
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): ApiError {
    if (error.name === 'ApiError') {
      return error;
    }

    // Transform axios errors
    if (error.isAxiosError) {
      return this.createApiError(error);
    }

    // Handle other errors
    const apiError = new Error(error.message || 'Unknown error') as ApiError;
    apiError.name = 'ApiError';
    return apiError;
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(appConfig.auth.tokenStorageKey, token);
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(appConfig.auth.tokenStorageKey);
      localStorage.removeItem(appConfig.auth.refreshTokenStorageKey);
    }
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.client.defaults.baseURL || '';
  }

  /**
   * Update base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.client.defaults.baseURL = baseUrl;
  }
}
