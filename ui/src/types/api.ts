// API Response Types based on OpenAPI specification

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  path?: string;
  status?: number;
  traceId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: string;
}

export interface ValidationErrorResponse extends ApiResponse {
  validationErrors: ValidationError[];
}

export interface PageableRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface Pageable {
  page: number;
  size: number;
  sort: string[];
}

export interface PagedResponse<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// Book Types
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookDetails extends Book {
  publisher: string;
  pageCount: number;
  language: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export interface BooksSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  category?: string;
  author?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CategoriesResponse {
  categories: string[];
}

// Cart Types
export interface AddToCartRequest {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartItem {
  id: string;
  book: Book;
  quantity: number;
  price: number;
  subtotal: number;
  addedAt: string;
}

export interface CartResponse {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

// Order Types
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderRequest {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';
  notes?: string;
}

export interface OrderItem {
  id: string;
  book: Book;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailsResponse extends Order {
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  notes?: string;
  trackingNumber?: string;
}

export interface OrdersSearchParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

// Health Check Types
export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  details: {
    database: {
      status: 'UP' | 'DOWN';
      responseTime: string;
    };
    redis: {
      status: 'UP' | 'DOWN';
      responseTime: string;
    };
  };
  version: string;
}

// Generic API Error
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  path: string;
  status: number;
  traceId?: string;
  validationErrors?: ValidationError[];
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Request/Response Interceptor Types
export interface RequestConfig {
  url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  data?: any;
  params?: any;
  timeout?: number;
}

export interface ResponseConfig<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}
