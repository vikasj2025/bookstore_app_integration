// API Response Types based on OpenAPI specification

// Common Types
export interface Pageable {
  page: number;
  size: number;
  sort: string[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  timestamp: string;
  path?: string;
  status?: number;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: string;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  services?: Record<string, {
    status: 'UP' | 'DOWN';
    details?: Record<string, unknown>;
  }>;
}

// Book Types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description?: string;
  price: number;
  category?: string;
  stockQuantity: number;
  imageUrl?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  description?: string;
  price: number;
  category?: string;
  stockQuantity: number;
  imageUrl?: string;
  publishedDate?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  description?: string;
  price?: number;
  category?: string;
  stockQuantity?: number;
  imageUrl?: string;
  publishedDate?: string;
}

export interface BookPageResponse {
  content: Book[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface BookSearchParams {
  page?: number;
  size?: number;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// User Types
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'USER' | 'ADMIN';
  address?: Address;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: Address;
}

// Cart Types
export interface CartItem {
  id: string;
  book: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  updatedAt: string;
}

export interface AddCartItemRequest {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';

export interface OrderItem {
  id: string;
  book: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod?: PaymentMethod;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderPageResponse {
  content: OrderResponse[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UpdateOrderStatusRequest {
  status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  notes?: string;
}

export interface OrderSearchParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

// Payment Types
export type PaymentStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethodId: string;
  savePaymentMethod?: boolean;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  status: PaymentStatusType;
  amount: number;
  currency: string;
  transactionId?: string;
  paymentMethodId: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatusType;
  amount: number;
  currency: string;
  lastUpdated: string;
}

// API Client Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError extends Error {
  status?: number;
  response?: ErrorResponse;
  code?: string;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

// Utility Types
export type ApiEndpoint = 
  | '/books'
  | '/books/{bookId}'
  | '/users/register'
  | '/users/login'
  | '/users/profile'
  | '/cart'
  | '/cart/items'
  | '/cart/items/{itemId}'
  | '/orders'
  | '/orders/{orderId}'
  | '/payments/process'
  | '/payments/{paymentId}/status'
  | '/health';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface SearchFilters {
  search?: string;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
}
