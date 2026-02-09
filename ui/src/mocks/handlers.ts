import { http, HttpResponse } from 'msw';
import { mockBooks, mockUsers, mockCarts, mockOrders } from './data';
import type {
  BookResponse,
  BookPageResponse,
  AuthResponse,
  UserProfileResponse,
  CartResponse,
  OrderResponse,
  OrderPageResponse,
  LoginRequest,
  UserRegistrationRequest,
  AddToCartRequest,
  CreateOrderRequest,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.bookstore.com/v1';

// Helper function to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to paginate results
function paginate<T>(items: T[], page: number = 0, size: number = 20) {
  const startIndex = page * size;
  const endIndex = startIndex + size;
  const content = items.slice(startIndex, endIndex);
  
  return {
    content,
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    first: page === 0,
    last: endIndex >= items.length,
  };
}

// Helper function to filter books
function filterBooks(books: BookResponse[], params: URLSearchParams) {
  let filtered = [...books];
  
  const search = params.get('q') || params.get('title');
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(book => 
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.description?.toLowerCase().includes(searchLower)
    );
  }
  
  const author = params.get('author');
  if (author) {
    filtered = filtered.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  
  const category = params.get('category');
  if (category) {
    filtered = filtered.filter(book => 
      book.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  const minPrice = params.get('minPrice');
  if (minPrice) {
    filtered = filtered.filter(book => book.price >= parseFloat(minPrice));
  }
  
  const maxPrice = params.get('maxPrice');
  if (maxPrice) {
    filtered = filtered.filter(book => book.price <= parseFloat(maxPrice));
  }
  
  // Sort
  const sort = params.get('sort') || 'title,asc';
  const [sortField, sortOrder] = sort.split(',');
  
  filtered.sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';
    
    switch (sortField) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'author':
        aValue = a.author;
        bValue = b.author;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'publishYear':
        aValue = a.publishYear || 0;
        bValue = b.publishYear || 0;
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'desc' ? -comparison : comparison;
    } else {
      const comparison = (aValue as number) - (bValue as number);
      return sortOrder === 'desc' ? -comparison : comparison;
    }
  });
  
  return filtered;
}

export const handlers = [
  // Authentication endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    await delay();
    
    const body = await request.json() as LoginRequest;
    const user = mockUsers.find(u => u.email === body.email);
    
    if (!user || body.password !== 'password123') {
      return HttpResponse.json(
        {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
          path: '/auth/login',
        },
        { status: 401 }
      );
    }
    
    const response: AuthResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user,
    };
    
    return HttpResponse.json(response);
  }),
  
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    await delay();
    
    const body = await request.json() as UserRegistrationRequest;
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === body.email);
    if (existingUser) {
      return HttpResponse.json(
        {
          error: 'USER_EXISTS',
          message: 'User with this email already exists',
          timestamp: new Date().toISOString(),
          path: '/auth/register',
        },
        { status: 409 }
      );
    }
    
    const newUser: UserProfileResponse = {
      id: `user-${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    const response: AuthResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: newUser,
    };
    
    return HttpResponse.json(response, { status: 201 });
  }),
  
  http.post(`${API_URL}/auth/refresh`, async () => {
    await delay();
    
    const response: AuthResponse = {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: mockUsers[0], // Return first user for simplicity
    };
    
    return HttpResponse.json(response);
  }),
  
  http.post(`${API_URL}/auth/logout`, async () => {
    await delay();
    
    return HttpResponse.json({
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  }),
  
  // User profile endpoints
  http.get(`${API_URL}/users/profile`, async () => {
    await delay();
    return HttpResponse.json(mockUsers[0]);
  }),
  
  http.put(`${API_URL}/users/profile`, async ({ request }) => {
    await delay();
    
    const body = await request.json() as Partial<UserProfileResponse>;
    const updatedUser = {
      ...mockUsers[0],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(updatedUser);
  }),
  
  // Books endpoints
  http.get(`${API_URL}/books`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    
    const filteredBooks = filterBooks(mockBooks, url.searchParams);
    const paginatedResult = paginate(filteredBooks, page, size);
    
    return HttpResponse.json(paginatedResult as BookPageResponse);
  }),
  
  http.get(`${API_URL}/books/search`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    
    const filteredBooks = filterBooks(mockBooks, url.searchParams);
    const paginatedResult = paginate(filteredBooks, page, size);
    
    return HttpResponse.json(paginatedResult as BookPageResponse);
  }),
  
  http.get(`${API_URL}/books/:bookId`, async ({ params }) => {
    await delay();
    
    const bookId = params.bookId as string;
    const book = mockBooks.find(b => b.id === bookId);
    
    if (!book) {
      return HttpResponse.json(
        {
          error: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          timestamp: new Date().toISOString(),
          path: `/books/${bookId}`,
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(book);
  }),
  
  // Cart endpoints
  http.get(`${API_URL}/cart`, async () => {
    await delay();
    return HttpResponse.json(mockCarts[0]);
  }),
  
  http.post(`${API_URL}/cart/items`, async ({ request }) => {
    await delay();
    
    const body = await request.json() as AddToCartRequest;
    const book = mockBooks.find(b => b.id === body.bookId);
    
    if (!book) {
      return HttpResponse.json(
        {
          error: 'BOOK_NOT_FOUND',
          message: 'Book not found',
          timestamp: new Date().toISOString(),
          path: '/cart/items',
        },
        { status: 404 }
      );
    }
    
    if (book.stockQuantity < body.quantity) {
      return HttpResponse.json(
        {
          error: 'INSUFFICIENT_STOCK',
          message: 'Insufficient stock available',
          timestamp: new Date().toISOString(),
          path: '/cart/items',
        },
        { status: 400 }
      );
    }
    
    // Add item to cart (simplified)
    const cart = mockCarts[0];
    const existingItem = cart.items.find(item => item.book.id === body.bookId);
    
    if (existingItem) {
      existingItem.quantity += body.quantity;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        book,
        quantity: body.quantity,
        unitPrice: book.price,
        totalPrice: book.price * body.quantity,
        addedAt: new Date().toISOString(),
      };
      cart.items.push(newItem);
    }
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.updatedAt = new Date().toISOString();
    
    return HttpResponse.json(cart, { status: 201 });
  }),
  
  http.put(`${API_URL}/cart/items/:itemId`, async ({ params, request }) => {
    await delay();
    
    const itemId = params.itemId as string;
    const body = await request.json() as { quantity: number };
    
    const cart = mockCarts[0];
    const item = cart.items.find(item => item.id === itemId);
    
    if (!item) {
      return HttpResponse.json(
        {
          error: 'ITEM_NOT_FOUND',
          message: 'Cart item not found',
          timestamp: new Date().toISOString(),
          path: `/cart/items/${itemId}`,
        },
        { status: 404 }
      );
    }
    
    item.quantity = body.quantity;
    item.totalPrice = item.unitPrice * item.quantity;
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.updatedAt = new Date().toISOString();
    
    return HttpResponse.json(cart);
  }),
  
  http.delete(`${API_URL}/cart/items/:itemId`, async ({ params }) => {
    await delay();
    
    const itemId = params.itemId as string;
    const cart = mockCarts[0];
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          error: 'ITEM_NOT_FOUND',
          message: 'Cart item not found',
          timestamp: new Date().toISOString(),
          path: `/cart/items/${itemId}`,
        },
        { status: 404 }
      );
    }
    
    cart.items.splice(itemIndex, 1);
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.updatedAt = new Date().toISOString();
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  http.delete(`${API_URL}/cart`, async () => {
    await delay();
    
    const cart = mockCarts[0];
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    cart.updatedAt = new Date().toISOString();
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  // Orders endpoints
  http.get(`${API_URL}/orders`, async ({ request }) => {
    await delay();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    const paginatedResult = paginate(mockOrders, page, size);
    
    return HttpResponse.json(paginatedResult as OrderPageResponse);
  }),
  
  http.get(`${API_URL}/orders/:orderId`, async ({ params }) => {
    await delay();
    
    const orderId = params.orderId as string;
    const order = mockOrders.find(o => o.id === orderId);
    
    if (!order) {
      return HttpResponse.json(
        {
          error: 'ORDER_NOT_FOUND',
          message: 'Order not found',
          timestamp: new Date().toISOString(),
          path: `/orders/${orderId}`,
        },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(order);
  }),
  
  http.post(`${API_URL}/orders`, async ({ request }) => {
    await delay();
    
    const body = await request.json() as CreateOrderRequest;
    const cart = mockCarts[0];
    
    if (cart.items.length === 0) {
      return HttpResponse.json(
        {
          error: 'EMPTY_CART',
          message: 'Cannot create order with empty cart',
          timestamp: new Date().toISOString(),
          path: '/orders',
        },
        { status: 400 }
      );
    }
    
    const newOrder: OrderResponse = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${Date.now()}`,
      userId: 'user-1',
      status: 'PENDING',
      items: cart.items.map(item => ({
        id: `order-item-${Date.now()}-${item.id}`,
        book: item.book,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totalAmount: cart.totalAmount,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockOrders.unshift(newOrder);
    
    // Clear cart after order creation
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    cart.updatedAt = new Date().toISOString();
    
    return HttpResponse.json(newOrder, { status: 201 });
  }),
  
  http.put(`${API_URL}/orders/:orderId/cancel`, async ({ params }) => {
    await delay();
    
    const orderId = params.orderId as string;
    const order = mockOrders.find(o => o.id === orderId);
    
    if (!order) {
      return HttpResponse.json(
        {
          error: 'ORDER_NOT_FOUND',
          message: 'Order not found',
          timestamp: new Date().toISOString(),
          path: `/orders/${orderId}/cancel`,
        },
        { status: 404 }
      );
    }
    
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return HttpResponse.json(
        {
          error: 'CANNOT_CANCEL',
          message: 'Order cannot be cancelled in current state',
          timestamp: new Date().toISOString(),
          path: `/orders/${orderId}/cancel`,
        },
        { status: 400 }
      );
    }
    
    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();
    
    return HttpResponse.json(order);
  }),
  
  // Health check
  http.get(`${API_URL}/health`, async () => {
    await delay(100);
    
    return HttpResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      components: {
        database: 'UP',
        redis: 'UP',
      },
    });
  }),
];
