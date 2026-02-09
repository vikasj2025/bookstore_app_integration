/**
 * TypeScript type definitions for the Online Bookstore API
 * Generated from OpenAPI specification
 */

// Base API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: ErrorResponse;
  success: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  timestamp: string;
  path?: string;
  validationErrors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: string;
}

// Pagination types
export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  pagination: PaginationInfo;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

// Book types
export interface BookSummary {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  rating: number;
  coverImageUrl?: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface BookDetails extends BookSummary {
  description?: string;
  isbn?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  language?: string;
  dimensions?: {
    height: number;
    width: number;
    thickness: number;
    unit: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
}

export type PagedBooksResponse = PagedResponse<BookSummary>;

// Shopping Cart types
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  book: BookSummary;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface AddToCartRequest {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT';

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  orderDate: string;
  expectedDeliveryDate?: string;
}

export interface OrderDetails extends OrderSummary {
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  tax: number;
  discount: number;
  notes?: string;
  trackingNumber?: string;
}

export interface OrderItem {
  id: string;
  book: BookSummary;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateOrderRequest {
  shippingAddress: Omit<Address, 'id'>;
  billingAddress?: Omit<Address, 'id'>;
  paymentMethod: PaymentMethod;
  shippingMethod?: ShippingMethod;
  notes?: string;
}

export type PagedOrdersResponse = PagedResponse<OrderSummary>;

// Address type
export interface Address {
  id?: string;
  firstName?: string;
  lastName?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
}

// User Profile types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  addresses: Address[];
  preferences: {
    favoriteGenres?: string[];
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferences?: {
    favoriteGenres?: string[];
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}

// Health Check types
export interface HealthCheckResponse {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  version: string;
  components: {
    database: {
      status: 'UP' | 'DOWN';
      responseTime: number;
    };
    redis: {
      status: 'UP' | 'DOWN';
      responseTime: number;
    };
    externalServices: {
      paymentGateway: {
        status: 'UP' | 'DOWN' | 'UNKNOWN';
      };
    };
  };
}

// API Query Parameters
export interface BookQueryParams {
  page?: number;
  size?: number;
  category?: string;
  author?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'title' | 'author' | 'price' | 'rating' | 'publishedDate';
  sortDirection?: 'ASC' | 'DESC';
}

export interface OrderQueryParams {
  page?: number;
  size?: number;
  status?: OrderStatus;
}

// HTTP Client types
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: ErrorResponse;
}

// Common utility types
export type SortDirection = 'ASC' | 'DESC';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Form validation types
export interface FormErrors<T> {
  [K in keyof T]?: string;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isSubmitting: boolean;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  author?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
}

export interface SortOption {
  field: string;
  direction: SortDirection;
  label: string;
}

// Event types for real-time updates
export interface CartUpdatedEvent {
  type: 'CART_UPDATED';
  cart: Cart;
}

export interface OrderStatusChangedEvent {
  type: 'ORDER_STATUS_CHANGED';
  orderId: string;
  status: OrderStatus;
}

export type BookstoreEvent = CartUpdatedEvent | OrderStatusChangedEvent;
