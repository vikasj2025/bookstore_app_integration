import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ApiResponse, ErrorResponse } from '@/types';
import { authStore } from '@/store/auth';
import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bookstore.com/v1';
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for auth token
  client.interceptors.request.use(
    (config) => {
      const { accessToken } = authStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors (token expired)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshToken } = authStore.getState();
          if (refreshToken) {
            const response = await client.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
            authStore.getState().setTokens(newAccessToken, newRefreshToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          authStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// Retry logic for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retries = MAX_RETRIES
): Promise<AxiosResponse<T>> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await delay(RETRY_DELAY);
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Check if error is retryable (5xx errors or network errors)
const isRetryableError = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.response.status === 429 // Rate limit
    );
  }
  return false;
};

// Delay utility
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Transform axios error to ApiError
const transformError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const apiError = new Error(error.message) as ApiError;
    apiError.status = error.response?.status;
    apiError.response = error.response?.data as ErrorResponse;
    return apiError;
  }
  return new Error('An unexpected error occurred') as ApiError;
};

// Generic API request function
const request = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await retryRequest(() => apiClient.request<T>(config));
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
    };
  } catch (error) {
    const apiError = transformError(error);
    
    // Show user-friendly error messages
    if (apiError.response?.message) {
      toast.error(apiError.response.message);
    } else if (apiError.status === 404) {
      toast.error('Resource not found');
    } else if (apiError.status === 403) {
      toast.error('Access denied');
    } else if (apiError.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!navigator.onLine) {
      toast.error('No internet connection');
    } else {
      toast.error('An unexpected error occurred');
    }

    throw apiError;
  }
};

// HTTP Methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, method: 'GET', url });
  },

  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, method: 'POST', url, data });
  },

  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, method: 'PUT', url, data });
  },

  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, method: 'PATCH', url, data });
  },

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return request<T>({ ...config, method: 'DELETE', url });
  },
};

// Export the axios instance for direct use if needed
export { apiClient };
export default api;
