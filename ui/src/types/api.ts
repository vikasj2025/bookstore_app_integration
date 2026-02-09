// API Response Types based on OpenAPI specification

// Common Types
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

export interface SuccessResponse {
  message: string;
  timestamp: string;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  components?: {
    database?: 'UP' | 'DOWN';
    redis?: 'UP' | 'DOWN';
  };
}

// Pagination Types
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

// Authentication Types
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfileResponse;
}

// User Types
export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

// Book Types
export interface BookResponse {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  category: string;
  description?: string;
  publishYear?: number;
  publisher?: string;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  price: number;
  category: string;
  description?: string;
  publishYear?: number;
  publisher?: string;
  stockQuantity: number;
  imageUrl?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  price?: number;
  category?: string;
  description?: string;
  publishYear?: number;
  publisher?: string;
  imageUrl?: string;
}

export interface BookPageResponse extends PageResponse<BookResponse> {}

export interface BookSearchParams {
  q?: string;
  title?: string;
  author?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// Cart Types
export interface CartItemResponse {
  id: string;
  book: BookResponse;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

export interface AddToCartRequest {
  bookId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Address Types
export interface AddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AddressResponse {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Order Types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL';

export interface OrderItemResponse {
  id: string;
  book: BookResponse;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemResponse[];
  totalAmount: number;
  shippingAddress: AddressResponse;
  billingAddress?: AddressResponse;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrderPageResponse extends PageResponse<OrderResponse> {}

// Inventory Types
export interface InventoryResponse {
  bookId: string;
  stockQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  lastUpdated: string;
}

export interface UpdateInventoryRequest {
  stockQuantity: number;
}

// API Client Types
export interface ApiError extends Error {
  status?: number;
  response?: ErrorResponse;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}
