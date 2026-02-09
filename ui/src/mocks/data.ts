import {
  Book,
  UserResponse,
  CartResponse,
  OrderResponse,
} from '@/types/api';

// Mock Books Data
export const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.',
    price: 12.99,
    category: 'Fiction',
    stockQuantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    publishedDate: '1925-04-10',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    price: 14.99,
    category: 'Fiction',
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    publishedDate: '1960-07-11',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-3',
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    description: 'A dystopian social science fiction novel about totalitarianism and surveillance.',
    price: 13.99,
    category: 'Science Fiction',
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=400&fit=crop',
    publishedDate: '1949-06-08',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    description: 'A romantic novel that critiques the British landed gentry at the end of the 18th century.',
    price: 11.99,
    category: 'Romance',
    stockQuantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    publishedDate: '1813-01-28',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-5',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '9780316769174',
    description: 'A controversial novel about teenage rebellion and alienation in post-war America.',
    price: 15.99,
    category: 'Fiction',
    stockQuantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    publishedDate: '1951-07-16',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-6',
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    isbn: '9780747532699',
    description: 'The first book in the beloved Harry Potter series about a young wizard\'s journey.',
    price: 16.99,
    category: 'Fantasy',
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop',
    publishedDate: '1997-06-26',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-7',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    isbn: '9780544003415',
    description: 'An epic high-fantasy novel about the quest to destroy the One Ring.',
    price: 24.99,
    category: 'Fantasy',
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    publishedDate: '1954-07-29',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-8',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441172719',
    description: 'A science fiction epic set in a distant future amidst a feudal interstellar society.',
    price: 18.99,
    category: 'Science Fiction',
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=400&fit=crop',
    publishedDate: '1965-08-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-9',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '9780547928227',
    description: 'A fantasy novel about the adventures of Bilbo Baggins, a hobbit who goes on an unexpected journey.',
    price: 14.99,
    category: 'Fantasy',
    stockQuantity: 28,
    imageUrl: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=300&h=400&fit=crop',
    publishedDate: '1937-09-21',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'book-10',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '9780060850524',
    description: 'A dystopian novel exploring themes of technology, society, and human nature.',
    price: 13.99,
    category: 'Science Fiction',
    stockQuantity: 16,
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop',
    publishedDate: '1932-01-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Users Data
export const mockUsers: UserResponse[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    role: 'USER',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@bookstore.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Cart Data
export const mockCarts: CartResponse[] = [
  {
    id: 'cart-1',
    userId: 'user-1',
    items: [
      {
        id: 'cart-item-1',
        book: mockBooks[0],
        quantity: 2,
        unitPrice: mockBooks[0].price,
        totalPrice: mockBooks[0].price * 2,
      },
      {
        id: 'cart-item-2',
        book: mockBooks[2],
        quantity: 1,
        unitPrice: mockBooks[2].price,
        totalPrice: mockBooks[2].price * 1,
      },
    ],
    totalAmount: (mockBooks[0].price * 2) + (mockBooks[2].price * 1),
    totalItems: 3,
    updatedAt: '2024-01-15T10:30:00Z',
  },
];

// Mock Orders Data
export const mockOrders: OrderResponse[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    userId: 'user-1',
    status: 'DELIVERED',
    items: [
      {
        id: 'order-item-1',
        book: mockBooks[0],
        quantity: 1,
        unitPrice: mockBooks[0].price,
        totalPrice: mockBooks[0].price,
      },
      {
        id: 'order-item-2',
        book: mockBooks[1],
        quantity: 2,
        unitPrice: mockBooks[1].price,
        totalPrice: mockBooks[1].price * 2,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    totalAmount: 48.97,
    shippingCost: 5.99,
    taxAmount: 3.44,
    paymentStatus: 'COMPLETED',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    userId: 'user-1',
    status: 'SHIPPED',
    items: [
      {
        id: 'order-item-3',
        book: mockBooks[5],
        quantity: 1,
        unitPrice: mockBooks[5].price,
        totalPrice: mockBooks[5].price,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    totalAmount: 24.34,
    shippingCost: 5.99,
    taxAmount: 1.36,
    paymentStatus: 'COMPLETED',
    createdAt: '2024-01-14T11:20:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024-003',
    userId: 'user-1',
    status: 'PENDING',
    items: [
      {
        id: 'order-item-4',
        book: mockBooks[7],
        quantity: 1,
        unitPrice: mockBooks[7].price,
        totalPrice: mockBooks[7].price,
      },
      {
        id: 'order-item-5',
        book: mockBooks[8],
        quantity: 1,
        unitPrice: mockBooks[8].price,
        totalPrice: mockBooks[8].price,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    totalAmount: 42.69,
    shippingCost: 5.99,
    taxAmount: 2.72,
    paymentStatus: 'PENDING',
    createdAt: '2024-01-16T09:45:00Z',
    updatedAt: '2024-01-16T09:45:00Z',
  },
];

// Helper function to get random books
export const getRandomBooks = (count: number): Book[] => {
  const shuffled = [...mockBooks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get books by category
export const getBooksByCategory = (category: string): Book[] => {
  return mockBooks.filter(book => book.category === category);
};

// Helper function to get featured books
export const getFeaturedBooks = (): Book[] => {
  return mockBooks.slice(0, 6); // Return first 6 books as featured
};

// Helper function to get bestsellers
export const getBestsellers = (): Book[] => {
  // Return books sorted by a mock popularity score
  return [...mockBooks]
    .sort((a, b) => b.price - a.price) // Mock sorting by price as popularity
    .slice(0, 8);
};

// Helper function to search books
export const searchBooks = (query: string): Book[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockBooks.filter(
    book =>
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.description?.toLowerCase().includes(lowercaseQuery)
  );
};
