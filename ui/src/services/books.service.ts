import { api } from '@/lib/api-client';
import {
  BookResponse,
  BookPageResponse,
  CreateBookRequest,
  UpdateBookRequest,
  BookSearchParams,
  InventoryResponse,
  UpdateInventoryRequest,
} from '@/types';

export class BooksService {
  /**
   * Get all books with pagination and filtering
   */
  static async getBooks(params?: BookSearchParams): Promise<BookPageResponse> {
    const response = await api.get<BookPageResponse>('/books', { params });
    return response.data;
  }

  /**
   * Get a specific book by ID
   */
  static async getBookById(bookId: string): Promise<BookResponse> {
    const response = await api.get<BookResponse>(`/books/${bookId}`);
    return response.data;
  }

  /**
   * Search books with advanced criteria
   */
  static async searchBooks(params: BookSearchParams): Promise<BookPageResponse> {
    const response = await api.get<BookPageResponse>('/books/search', { params });
    return response.data;
  }

  /**
   * Create a new book (Admin only)
   */
  static async createBook(data: CreateBookRequest): Promise<BookResponse> {
    const response = await api.post<BookResponse>('/books', data);
    return response.data;
  }

  /**
   * Update an existing book (Admin only)
   */
  static async updateBook(bookId: string, data: UpdateBookRequest): Promise<BookResponse> {
    const response = await api.put<BookResponse>(`/books/${bookId}`, data);
    return response.data;
  }

  /**
   * Delete a book (Admin only)
   */
  static async deleteBook(bookId: string): Promise<void> {
    await api.delete(`/books/${bookId}`);
  }

  /**
   * Get book inventory information
   */
  static async getInventory(bookId: string): Promise<InventoryResponse> {
    const response = await api.get<InventoryResponse>(`/inventory/${bookId}`);
    return response.data;
  }

  /**
   * Update book inventory (Admin only)
   */
  static async updateInventory(
    bookId: string,
    data: UpdateInventoryRequest
  ): Promise<InventoryResponse> {
    const response = await api.put<InventoryResponse>(`/inventory/${bookId}`, data);
    return response.data;
  }

  /**
   * Get unique categories
   */
  static async getCategories(): Promise<string[]> {
    // This would typically be a separate endpoint, but for now we'll derive from books
    const books = await this.getBooks({ size: 1000 });
    const categories = [...new Set(books.content.map(book => book.category))];
    return categories.sort();
  }

  /**
   * Get unique authors
   */
  static async getAuthors(): Promise<string[]> {
    // This would typically be a separate endpoint, but for now we'll derive from books
    const books = await this.getBooks({ size: 1000 });
    const authors = [...new Set(books.content.map(book => book.author))];
    return authors.sort();
  }

  /**
   * Get price range for filtering
   */
  static async getPriceRange(): Promise<{ min: number; max: number }> {
    const books = await this.getBooks({ size: 1000 });
    const prices = books.content.map(book => book.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Validate ISBN format
   */
  static validateISBN(isbn: string): boolean {
    const isbn13Regex = /^(978|979)\d{10}$/;
    return isbn13Regex.test(isbn.replace(/[\s-]/g, ''));
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  /**
   * Check if book is in stock
   */
  static isInStock(book: BookResponse): boolean {
    return book.stockQuantity > 0;
  }

  /**
   * Get stock status message
   */
  static getStockStatus(book: BookResponse): {
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
    message: string;
  } {
    if (book.stockQuantity === 0) {
      return {
        status: 'out-of-stock',
        message: 'Out of stock',
      };
    }

    if (book.stockQuantity <= 5) {
      return {
        status: 'low-stock',
        message: `Only ${book.stockQuantity} left in stock`,
      };
    }

    return {
      status: 'in-stock',
      message: 'In stock',
    };
  }

  /**
   * Generate book URL slug
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Get recommended books based on category
   */
  static async getRecommendedBooks(
    bookId: string,
    limit = 4
  ): Promise<BookResponse[]> {
    const book = await this.getBookById(bookId);
    const relatedBooks = await this.getBooks({
      category: book.category,
      size: limit + 1, // +1 to exclude current book
    });

    return relatedBooks.content
      .filter(b => b.id !== bookId)
      .slice(0, limit);
  }
}

export default BooksService;
