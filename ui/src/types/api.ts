// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  traceId?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: any;
}

export interface MessageResponse {
  message: string;
  timestamp: string;
}

// Pagination Types
export interface PageInfo {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PagedResponse<T> {
  content: T[];
  page: PageInfo;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  createdAt: string;
  lastLoginAt?: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Book Types
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  description?: string;
  price: number;
  category: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookCreateRequest {
  title: string;
  author: string;
  isbn: string;
  description?: string;
  price: number;
  category: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  imageUrl?: string;
  stockQuantity: number;
}

export interface BookUpdateRequest {
  title?: string;
  author?: string;
  description?: string;
  price?: number;
  category?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  imageUrl?: string;
}

export interface BookFilters {
  page?: number;
  size?: number;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'title' | 'price' | 'publishedDate' | 'rating';
  sortDirection?: 'asc' | 'desc';
}

export interface SearchResponse {
  content: Book[];
  page: PageInfo;
  query: string;
  totalResults: number;
}

// Cart Types
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  book: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  totalItems: number;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentInfo?: PaymentInfo;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryDate?: string;
}

export interface OrderItem {
  id: number;
  book: Book;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface CreateOrderRequest {
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  paymentToken: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

// Inventory Types
export interface InventoryResponse {
  bookId: number;
  quantity: number;
  reserved: number;
  available: number;
  lastUpdated: string;
}

export interface UpdateInventoryRequest {
  quantity: number;
  operation: 'SET' | 'ADD' | 'SUBTRACT';
  reason?: string;
}

// Health Check Types
export interface HealthStatus {
  status: 'UP' | 'DOWN';
  timestamp: string;
  components?: {
    database?: 'UP' | 'DOWN';
    redis?: 'UP' | 'DOWN';
  };
}
