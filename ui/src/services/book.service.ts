import { apiClient } from './api-client';
import {
  Book,
  BookPageResponse,
  BookSearchParams,
  CreateBookRequest,
  UpdateBookRequest,
  ApiResponse,
} from '@/types/api';

export class BookService {
  private readonly basePath = '/books';

  /**
   * Get all books with pagination and filtering
   */
  async getBooks(params: BookSearchParams = {}): Promise<ApiResponse<BookPageResponse>> {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.size !== undefined) queryParams.set('size', params.size.toString());
    
    // Add filter parameters
    if (params.category) queryParams.set('category', params.category);
    if (params.author) queryParams.set('author', params.author);
    if (params.minPrice !== undefined) queryParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params.search) queryParams.set('search', params.search);

    const url = queryParams.toString() ? `${this.basePath}?${queryParams}` : this.basePath;
    return apiClient.get<BookPageResponse>(url);
  }

  /**
   * Get a specific book by ID
   */
  async getBookById(bookId: string): Promise<ApiResponse<Book>> {
    return apiClient.get<Book>(`${this.basePath}/${bookId}`);
  }

  /**
   * Create a new book (Admin only)
   */
  async createBook(bookData: CreateBookRequest): Promise<ApiResponse<Book>> {
    return apiClient.post<Book>(this.basePath, bookData);
  }

  /**
   * Update an existing book (Admin only)
   */
  async updateBook(bookId: string, bookData: UpdateBookRequest): Promise<ApiResponse<Book>> {
    return apiClient.put<Book>(`${this.basePath}/${bookId}`, bookData);
  }

  /**
   * Delete a book (Admin only)
   */
  async deleteBook(bookId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${bookId}`);
  }

  /**
   * Search books by title, author, or description
   */
  async searchBooks(query: string, params: Omit<BookSearchParams, 'search'> = {}): Promise<ApiResponse<BookPageResponse>> {
    return this.getBooks({ ...params, search: query });
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(category: string, params: Omit<BookSearchParams, 'category'> = {}): Promise<ApiResponse<BookPageResponse>> {
    return this.getBooks({ ...params, category });
  }

  /**
   * Get books by author
   */
  async getBooksByAuthor(author: string, params: Omit<BookSearchParams, 'author'> = {}): Promise<ApiResponse<BookPageResponse>> {
    return this.getBooks({ ...params, author });
  }

  /**
   * Get books within a price range
   */
  async getBooksByPriceRange(
    minPrice: number,
    maxPrice: number,
    params: Omit<BookSearchParams, 'minPrice' | 'maxPrice'> = {}
  ): Promise<ApiResponse<BookPageResponse>> {
    return this.getBooks({ ...params, minPrice, maxPrice });
  }

  /**
   * Get featured books (first page with default size)
   */
  async getFeaturedBooks(size: number = 8): Promise<ApiResponse<BookPageResponse>> {
    return this.getBooks({ page: 0, size });
  }

  /**
   * Get new releases (books sorted by creation date)
   */
  async getNewReleases(size: number = 12): Promise<ApiResponse<BookPageResponse>> {
    return this.getBooks({ page: 0, size });
  }

  /**
   * Get bestsellers (this would typically require a separate endpoint or sorting parameter)
   */
  async getBestsellers(size: number = 10): Promise<ApiResponse<BookPageResponse>> {
    // Note: This assumes the API supports sorting by sales or popularity
    // In a real implementation, this might be a separate endpoint
    return this.getBooks({ page: 0, size });
  }

  /**
   * Check if a book is in stock
   */
  async checkStock(bookId: string): Promise<boolean> {
    try {
      const response = await this.getBookById(bookId);
      return response.data.stockQuantity > 0;
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  }

  /**
   * Get available stock quantity for a book
   */
  async getStockQuantity(bookId: string): Promise<number> {
    try {
      const response = await this.getBookById(bookId);
      return response.data.stockQuantity;
    } catch (error) {
      console.error('Error getting stock quantity:', error);
      return 0;
    }
  }

  /**
   * Get unique categories (this would typically be a separate endpoint)
   */
  async getCategories(): Promise<string[]> {
    // Note: This is a placeholder implementation
    // In a real application, this would be a separate API endpoint
    try {
      const response = await this.getBooks({ size: 1000 }); // Get many books to extract categories
      const categories = new Set(response.data.content.map(book => book.category).filter(Boolean));
      return Array.from(categories) as string[];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Get unique authors (this would typically be a separate endpoint)
   */
  async getAuthors(): Promise<string[]> {
    // Note: This is a placeholder implementation
    // In a real application, this would be a separate API endpoint
    try {
      const response = await this.getBooks({ size: 1000 }); // Get many books to extract authors
      const authors = new Set(response.data.content.map(book => book.author));
      return Array.from(authors);
    } catch (error) {
      console.error('Error getting authors:', error);
      return [];
    }
  }

  /**
   * Validate book data before creation/update
   */
  validateBookData(bookData: CreateBookRequest | UpdateBookRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if ('title' in bookData && (!bookData.title || bookData.title.trim().length === 0)) {
      errors.push('Title is required');
    }

    if ('author' in bookData && (!bookData.author || bookData.author.trim().length === 0)) {
      errors.push('Author is required');
    }

    if ('isbn' in bookData && bookData.isbn) {
      const isbnRegex = /^[0-9]{10}([0-9]{3})?$/;
      if (!isbnRegex.test(bookData.isbn)) {
        errors.push('Invalid ISBN format');
      }
    }

    if ('price' in bookData && (bookData.price === undefined || bookData.price < 0)) {
      errors.push('Price must be a positive number');
    }

    if ('stockQuantity' in bookData && (bookData.stockQuantity === undefined || bookData.stockQuantity < 0)) {
      errors.push('Stock quantity must be a non-negative number');
    }

    if ('imageUrl' in bookData && bookData.imageUrl) {
      try {
        new URL(bookData.imageUrl);
      } catch {
        errors.push('Invalid image URL format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create singleton instance
export const bookService = new BookService();
export default bookService;
