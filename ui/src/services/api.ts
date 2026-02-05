import { ApiResponse, ErrorResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mavenbootstrap.com/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: string,
    public traceId?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ErrorResponse;
      
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred',
            timestamp: new Date().toISOString(),
          },
        };
      }
      
      throw new ApiError(
        response.status,
        errorData.error.code,
        errorData.error.message,
        errorData.error.details,
        errorData.error.traceId
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        0,
        'NETWORK_ERROR',
        'Network request failed. Please check your connection and try again.',
        error instanceof Error ? error.message : 'Unknown network error'
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async downloadFile(endpoint: string, params?: Record<string, any>): Promise<Blob> {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: {
          code: 'DOWNLOAD_ERROR',
          message: 'Failed to download file',
          timestamp: new Date().toISOString(),
        },
      }));
      
      throw new ApiError(
        response.status,
        errorData.error.code,
        errorData.error.message
      );
    }

    return response.blob();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility function for handling API calls in React components
export async function handleApiCall<T>(
  apiCall: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await apiCall();
    return { data, loading: false };
  } catch (error) {
    const apiError = error as ApiError;
    return {
      error: {
        error: {
          code: apiError.code || 'UNKNOWN_ERROR',
          message: apiError.message || 'An unknown error occurred',
          details: apiError.details,
          timestamp: new Date().toISOString(),
          traceId: apiError.traceId,
        },
      },
      loading: false,
    };
  }
}

// Retry utility for handling transient errors
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError!;
}

export { ApiError };
