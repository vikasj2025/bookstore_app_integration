import { http, HttpResponse } from 'msw';
import {
  Book,
  BookPageResponse,
  UserResponse,
  LoginResponse,
  CartResponse,
  OrderResponse,
  PaymentResponse,
  HealthResponse,
} from '@/types/api';
import { mockBooks, mockUsers, mockCarts, mockOrders } from './data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1';

export const handlers = [
  // Health Check
  http.get(`${API_BASE}/health`, () => {
    const healthResponse: HealthResponse = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'UP', details: { connectionTime: '5ms' } },
        cache: { status: 'UP', details: { hitRate: '95%' } },
        search: { status: 'UP', details: { indexSize: '1.2GB' } },
      },
    };
    return HttpResponse.json(healthResponse);
  }),

  // Books API
  http.get(`${API_BASE}/books`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');
    const minPrice = parseFloat(url.searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(url.searchParams.get('maxPrice') || '999999');

    let filteredBooks = [...mockBooks];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBooks = filteredBooks.filter(
        book =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.description?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }

    if (author) {
      filteredBooks = filteredBooks.filter(book => 
        book.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    filteredBooks = filteredBooks.filter(
      book => book.price >= minPrice && book.price <= maxPrice
    );

    // Pagination
    const totalElements = filteredBooks.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;
    const content = filteredBooks.slice(start, end);

    const response: BookPageResponse = {
      content,
      pageable: {
        page,
        size,
        sort: [],
      },
      totalElements,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1,
      numberOfElements: content.length,
    };

    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE}/books/:bookId`, ({ params }) => {
    const { bookId } = params;
    const book = mockBooks.find(b => b.id === bookId);
    
    if (!book) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Book not found',
      });
    }

    return HttpResponse.json(book);
  }),

  http.post(`${API_BASE}/books`, async ({ request }) => {
    const bookData = await request.json() as any;
    const newBook: Book = {
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...bookData,
    };
    
    mockBooks.push(newBook);
    return HttpResponse.json(newBook, { status: 201 });
  }),

  // User Authentication
  http.post(`${API_BASE}/users/register`, async ({ request }) => {
    const userData = await request.json() as any;
    const newUser: UserResponse = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    return HttpResponse.json(newUser, { status: 201 });
  }),

  http.post(`${API_BASE}/users/login`, async ({ request }) => {
    const credentials = await request.json() as any;
    
    // Simple mock authentication
    if (credentials.email === 'admin@bookstore.com' && credentials.password === 'admin123') {
      const adminUser: UserResponse = {
        id: 'admin-1',
        email: 'admin@bookstore.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      const loginResponse: LoginResponse = {
        accessToken: 'mock-access-token-admin',
        refreshToken: 'mock-refresh-token-admin',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: adminUser,
      };
      
      return HttpResponse.json(loginResponse);
    }
    
    if (credentials.email === 'user@example.com' && credentials.password === 'password123') {
      const user: UserResponse = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00Z',
      };
      
      const loginResponse: LoginResponse = {
        accessToken: 'mock-access-token-user',
        refreshToken: 'mock-refresh-token-user',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user,
      };
      
      return HttpResponse.json(loginResponse);
    }
    
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Invalid credentials',
    });
  }),

  http.get(`${API_BASE}/users/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (token === 'mock-access-token-admin') {
      const adminUser: UserResponse = {
        id: 'admin-1',
        email: 'admin@bookstore.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: '2024-01-01T00:00:00Z',
      };
      return HttpResponse.json(adminUser);
    }
    
    if (token === 'mock-access-token-user') {
      const user: UserResponse = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00Z',
      };
      return HttpResponse.json(user);
    }
    
    return new HttpResponse(null, {
      status: 401,
      statusText: 'Invalid token',
    });
  }),

  // Cart API
  http.get(`${API_BASE}/cart`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    
    // Return mock cart
    const cart = mockCarts[0];
    return HttpResponse.json(cart);
  }),

  http.post(`${API_BASE}/cart/items`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    
    const itemData = await request.json() as any;
    const book = mockBooks.find(b => b.id === itemData.bookId);
    
    if (!book) {
      return new HttpResponse(null, {
        status: 404,
        statusText: 'Book not found',
      });
    }
    
    // Update mock cart
    const cart = mockCarts[0];
    const existingItem = cart.items.find(item => item.book.id === itemData.bookId);
    
    if (existingItem) {
      existingItem.quantity += itemData.quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
    } else {
      cart.items.push({
        id: `item-${Date.now()}`,
        book,
        quantity: itemData.quantity,
        unitPrice: book.price,
        totalPrice: book.price * itemData.quantity,
      });
    }
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.updatedAt = new Date().toISOString();
    
    return HttpResponse.json(cart, { status: 201 });
  }),

  // Orders API
  http.get(`${API_BASE}/orders`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    const totalElements = mockOrders.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;
    const content = mockOrders.slice(start, end);
    
    return HttpResponse.json({
      content,
      pageable: { page, size, sort: [] },
      totalElements,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1,
    });
  }),

  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    
    const orderData = await request.json() as any;
    const cart = mockCarts[0];
    
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
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      totalAmount: cart.totalAmount + 5.99 + (cart.totalAmount * 0.08), // Add shipping and tax
      shippingCost: 5.99,
      taxAmount: cart.totalAmount * 0.08,
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockOrders.push(newOrder);
    
    // Clear cart after order creation
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Payment API
  http.post(`${API_BASE}/payments/process`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    
    const paymentData = await request.json() as any;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const paymentResponse: PaymentResponse = {
      id: `payment-${Date.now()}`,
      orderId: paymentData.orderId,
      status: 'COMPLETED',
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      transactionId: `txn-${Date.now()}`,
      paymentMethodId: paymentData.paymentMethodId,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    
    // Update order payment status
    const order = mockOrders.find(o => o.id === paymentData.orderId);
    if (order) {
      order.paymentStatus = 'COMPLETED';
      order.status = 'CONFIRMED';
      order.updatedAt = new Date().toISOString();
    }
    
    return HttpResponse.json(paymentResponse);
  }),

  // Error simulation for testing
  http.get(`${API_BASE}/test/error`, () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),

  http.get(`${API_BASE}/test/timeout`, () => {
    // Simulate timeout
    return new Promise(() => {});
  }),
];
