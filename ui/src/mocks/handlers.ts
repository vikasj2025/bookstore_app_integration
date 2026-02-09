import { http, HttpResponse } from 'msw';
import { Book, BookDetails, CartResponse, Order, OrderDetailsResponse, UserProfile } from '@/types/api';

// Mock data
const mockBooks: Book[] = [
  {
    id: '1',
    isbn: '978-0-123456-78-9',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic American novel set in the Jazz Age',
    category: 'Fiction',
    price: 12.99,
    imageUrl: 'https://example.com/gatsby.jpg',
    stockQuantity: 25,
    publishedDate: '1925-04-10',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    isbn: '978-0-987654-32-1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A gripping tale of racial injustice and childhood innocence',
    category: 'Fiction',
    price: 14.99,
    imageUrl: 'https://example.com/mockingbird.jpg',
    stockQuantity: 18,
    publishedDate: '1960-07-11',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    isbn: '978-0-456789-12-3',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'A controversial coming-of-age story',
    category: 'Fiction',
    price: 13.99,
    imageUrl: 'https://example.com/catcher.jpg',
    stockQuantity: 30,
    publishedDate: '1951-07-16',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const mockUser: UserProfile = {
  id: 'user-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
};

const mockCart: CartResponse = {
  id: 'cart-1',
  items: [
    {
      id: 'item-1',
      book: mockBooks[0],
      quantity: 2,
      price: 12.99,
      subtotal: 25.98,
      addedAt: '2024-01-01T12:00:00Z',
    },
  ],
  totalItems: 2,
  totalAmount: 25.98,
  updatedAt: '2024-01-01T12:00:00Z',
};

const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    status: 'DELIVERED',
    totalAmount: 45.97,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-05T14:00:00Z',
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    status: 'SHIPPED',
    totalAmount: 29.99,
    createdAt: '2024-01-10T15:30:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
  },
];

// API Handlers
export const handlers = [
  // Authentication
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'john.doe@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: mockUser,
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials', message: 'Email or password is incorrect' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        ...mockUser,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      },
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: mockUser,
    });
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Books
  http.get('/api/books', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    
    let filteredBooks = [...mockBooks];
    
    if (search) {
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredBooks = filteredBooks.filter(book => 
        book.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    const start = page * size;
    const end = start + size;
    const paginatedBooks = filteredBooks.slice(start, end);
    
    return HttpResponse.json({
      content: paginatedBooks,
      pageable: {
        page,
        size,
        sort: ['title,asc'],
      },
      totalElements: filteredBooks.length,
      totalPages: Math.ceil(filteredBooks.length / size),
      last: end >= filteredBooks.length,
      first: page === 0,
      numberOfElements: paginatedBooks.length,
      empty: paginatedBooks.length === 0,
    });
  }),

  http.get('/api/books/:id', ({ params }) => {
    const book = mockBooks.find(b => b.id === params.id);
    
    if (!book) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Book not found' },
        { status: 404 }
      );
    }
    
    const bookDetails: BookDetails = {
      ...book,
      publisher: 'Mock Publisher',
      pageCount: 250,
      language: 'English',
      dimensions: {
        length: 8.5,
        width: 5.5,
        height: 1.0,
        weight: 0.8,
      },
    };
    
    return HttpResponse.json(bookDetails);
  }),

  http.get('/api/books/categories', () => {
    return HttpResponse.json({
      categories: ['Fiction', 'Non-Fiction', 'Science', 'Biography', 'Technology'],
    });
  }),

  // Cart
  http.get('/api/cart', () => {
    return HttpResponse.json(mockCart);
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const body = await request.json() as { bookId: string; quantity: number };
    const book = mockBooks.find(b => b.id === body.bookId);
    
    if (!book) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Book not found' },
        { status: 404 }
      );
    }
    
    const cartItem = {
      id: `item-${Date.now()}`,
      book,
      quantity: body.quantity,
      price: book.price,
      subtotal: book.price * body.quantity,
      addedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(cartItem, { status: 201 });
  }),

  http.put('/api/cart/items/:itemId', async ({ params, request }) => {
    const body = await request.json() as { quantity: number };
    const item = mockCart.items.find(i => i.id === params.itemId);
    
    if (!item) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    const updatedItem = {
      ...item,
      quantity: body.quantity,
      subtotal: item.price * body.quantity,
    };
    
    return HttpResponse.json(updatedItem);
  }),

  http.delete('/api/cart/items/:itemId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('/api/cart', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Orders
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    const start = page * size;
    const end = start + size;
    const paginatedOrders = mockOrders.slice(start, end);
    
    return HttpResponse.json({
      content: paginatedOrders,
      pageable: {
        page,
        size,
        sort: ['createdAt,desc'],
      },
      totalElements: mockOrders.length,
      totalPages: Math.ceil(mockOrders.length / size),
      last: end >= mockOrders.length,
      first: page === 0,
      numberOfElements: paginatedOrders.length,
      empty: paginatedOrders.length === 0,
    });
  }),

  http.get('/api/orders/:orderId', ({ params }) => {
    const order = mockOrders.find(o => o.id === params.orderId);
    
    if (!order) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Order not found' },
        { status: 404 }
      );
    }
    
    const orderDetails: OrderDetailsResponse = {
      ...order,
      items: [
        {
          id: 'order-item-1',
          book: mockBooks[0],
          quantity: 2,
          price: 12.99,
          subtotal: 25.98,
        },
        {
          id: 'order-item-2',
          book: mockBooks[1],
          quantity: 1,
          price: 14.99,
          subtotal: 14.99,
        },
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      },
      billingAddress: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      },
      paymentMethod: 'CREDIT_CARD',
      notes: 'Please leave at the door',
      trackingNumber: order.status === 'SHIPPED' || order.status === 'DELIVERED' ? '1Z999AA1234567890' : undefined,
    };
    
    return HttpResponse.json(orderDetails);
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    
    const newOrder: OrderDetailsResponse = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-2024-${String(mockOrders.length + 1).padStart(3, '0')}`,
      status: 'PENDING',
      totalAmount: mockCart.totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: mockCart.items.map(item => ({
        id: `order-item-${Date.now()}`,
        book: item.book,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      paymentMethod: body.paymentMethod || 'CREDIT_CARD',
      notes: body.notes,
    };
    
    return HttpResponse.json(newOrder, { status: 201 });
  }),

  http.post('/api/orders/:orderId/cancel', ({ params }) => {
    const order = mockOrders.find(o => o.id === params.orderId);
    
    if (!order) {
      return HttpResponse.json(
        { error: 'Not Found', message: 'Order not found' },
        { status: 404 }
      );
    }
    
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return HttpResponse.json(
        { error: 'Bad Request', message: 'Order cannot be cancelled' },
        { status: 400 }
      );
    }
    
    const cancelledOrder = {
      ...order,
      status: 'CANCELLED' as const,
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(cancelledOrder);
  }),

  // Health Check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      details: {
        database: {
          status: 'UP',
          responseTime: '15ms',
        },
        redis: {
          status: 'UP',
          responseTime: '5ms',
        },
      },
      version: '1.0.0',
    });
  }),
];
