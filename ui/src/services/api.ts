import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  ApiResponse,
  ErrorResponse,
  ValidationErrorResponse,
  AuthResponse,
  LoginRequest,
  UserRegistrationRequest,
  RefreshTokenRequest,
  UpdateUserProfileRequest,
  User,
  Book,
  BookCreateRequest,
  BookUpdateRequest,
  BookFilters,
  PagedResponse,
  SearchResponse,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  Order,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  InventoryResponse,
  UpdateInventoryRequest,
  HealthStatus,
} from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken });
              const { accessToken, refreshToken: newRefreshToken } = response;
              
              Cookies.set('accessToken', accessToken, { expires: 1 });
              Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
              
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): Error {
    if (error.response) {
      const errorData: ErrorResponse = error.response.data;
      return new Error(errorData.message || 'An error occurred');
    } else if (error.request) {
      return new Error('Network error - please check your connection');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
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
      throw this.handleError(error);
    }
  }

  // Health Check
  async healthCheck(): Promise<HealthStatus> {
    return this.request<HealthStatus>('GET', '/health');
  }

  // Authentication
  async register(data: UserRegistrationRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/register', data);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/login', data);
  }

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('POST', '/auth/refresh', data);
  }

  async logout(): Promise<void> {
    try {
      await this.request('POST', '/auth/logout');
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
  }

  // User Management
  async getUserProfile(): Promise<User> {
    return this.request<User>('GET', '/users/profile');
  }

  async updateUserProfile(data: UpdateUserProfileRequest): Promise<User> {
    return this.request<User>('PUT', '/users/profile', data);
  }

  // Books
  async getBooks(filters?: BookFilters): Promise<PagedResponse<Book>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return this.request<PagedResponse<Book>>('GET', `/books?${params.toString()}`);
  }

  async getBook(id: number): Promise<Book> {
    return this.request<Book>('GET', `/books/${id}`);
  }

  async createBook(data: BookCreateRequest): Promise<Book> {
    return this.request<Book>('POST', '/books', data);
  }

  async updateBook(id: number, data: BookUpdateRequest): Promise<Book> {
    return this.request<Book>('PUT', `/books/${id}`, data);
  }

  async deleteBook(id: number): Promise<void> {
    return this.request<void>('DELETE', `/books/${id}`);
  }

  async searchBooks(query: string, page = 0, size = 20): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      size: size.toString(),
    });
    
    return this.request<SearchResponse>('GET', `/books/search?${params.toString()}`);
  }

  // Shopping Cart
  async getCart(): Promise<Cart> {
    return this.request<Cart>('GET', '/cart');
  }

  async addToCart(data: AddToCartRequest): Promise<Cart> {
    return this.request<Cart>('POST', '/cart/items', data);
  }

  async updateCartItem(itemId: number, data: UpdateCartItemRequest): Promise<Cart> {
    return this.request<Cart>('PUT', `/cart/items/${itemId}`, data);
  }

  async removeFromCart(itemId: number): Promise<Cart> {
    return this.request<Cart>('DELETE', `/cart/items/${itemId}`);
  }

  async clearCart(): Promise<void> {
    return this.request<void>('DELETE', '/cart');
  }

  // Orders
  async getOrders(page = 0, size = 20, status?: string): Promise<PagedResponse<Order>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    return this.request<PagedResponse<Order>>('GET', `/orders?${params.toString()}`);
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>('GET', `/orders/${id}`);
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return this.request<Order>('POST', '/orders', data);
  }

  async cancelOrder(id: number): Promise<Order> {
    return this.request<Order>('PUT', `/orders/${id}/cancel`);
  }

  // Admin - Orders
  async getAllOrders(page = 0, size = 20, status?: string, userId?: number): Promise<PagedResponse<Order>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId.toString());
    
    return this.request<PagedResponse<Order>>('GET', `/admin/orders?${params.toString()}`);
  }

  async updateOrderStatus(id: number, data: UpdateOrderStatusRequest): Promise<Order> {
    return this.request<Order>('PUT', `/admin/orders/${id}/status`, data);
  }

  // Inventory
  async getInventory(bookId: number): Promise<InventoryResponse> {
    return this.request<InventoryResponse>('GET', `/inventory/${bookId}`);
  }

  async updateInventory(bookId: number, data: UpdateInventoryRequest): Promise<InventoryResponse> {
    return this.request<InventoryResponse>('PUT', `/inventory/${bookId}`, data);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
