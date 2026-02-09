import { httpClient } from '@/lib/http-client';
import {
  Book,
  BookDetails,
  BooksSearchParams,
  PagedResponse,
  CategoriesResponse,
} from '@/types/api';

/**
 * Books Service
 * Handles all book catalog related API operations
 */
export class BooksService {
  private readonly basePath = '/books';

  /**
   * Get paginated list of books with optional filtering and sorting
   */
  async getBooks(params: BooksSearchParams = {}): Promise<PagedResponse<Book>> {
    try {
      const queryParams = this.buildQueryParams(params);
      const response = await httpClient.get<PagedResponse<Book>>(
        `${this.basePath}${queryParams ? `?${queryParams}` : ''}`
      );
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch books');
    }
  }

  /**
   * Get detailed information about a specific book
   */
  async getBookById(bookId: string): Promise<BookDetails> {
    try {
      const response = await httpClient.get<BookDetails>(`${this.basePath}/${bookId}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch book details');
    }
  }

  /**
   * Get all available book categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await httpClient.get<CategoriesResponse>(`${this.basePath}/categories`);
      return response.categories;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch categories');
    }
  }

  /**
   * Search books by title, author, or description
   */
  async searchBooks(
    searchTerm: string,
    params: Omit<BooksSearchParams, 'search'> = {}
  ): Promise<PagedResponse<Book>> {
    try {
      const searchParams: BooksSearchParams = {
        ...params,
        search: searchTerm,
      };
      
      return await this.getBooks(searchParams);
    } catch (error) {
      throw this.handleError(error, 'Failed to search books');
    }
  }

  /**
   * Get books by category with pagination
   */
  async getBooksByCategory(
    category: string,
    params: Omit<BooksSearchParams, 'category'> = {}
  ): Promise<PagedResponse<Book>> {
    try {
      const categoryParams: BooksSearchParams = {
        ...params,
        category,
      };
      
      return await this.getBooks(categoryParams);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch books in category: ${category}`);
    }
  }

  /**
   * Get books by author with pagination
   */
  async getBooksByAuthor(
    author: string,
    params: Omit<BooksSearchParams, 'author'> = {}
  ): Promise<PagedResponse<Book>> {
    try {
      const authorParams: BooksSearchParams = {
        ...params,
        author,
      };
      
      return await this.getBooks(authorParams);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch books by author: ${author}`);
    }
  }

  /**
   * Get books within a price range
   */
  async getBooksByPriceRange(
    minPrice: number,
    maxPrice: number,
    params: Omit<BooksSearchParams, 'minPrice' | 'maxPrice'> = {}
  ): Promise<PagedResponse<Book>> {
    try {
      const priceParams: BooksSearchParams = {
        ...params,
        minPrice,
        maxPrice,
      };
      
      return await this.getBooks(priceParams);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch books in price range: $${minPrice} - $${maxPrice}`);
    }
  }

  /**
   * Get featured/recommended books
   */
  async getFeaturedBooks(limit = 12): Promise<Book[]> {
    try {
      const response = await this.getBooks({
        size: limit,
        sort: 'createdAt,desc', // Newest books first
      });
      
      return response.content;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch featured books');
    }
  }

  /**
   * Get popular books (sorted by some popularity metric)
   */
  async getPopularBooks(limit = 12): Promise<Book[]> {
    try {
      const response = await this.getBooks({
        size: limit,
        sort: 'title,asc', // Fallback to title sort since we don't have popularity metric
      });
      
      return response.content;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch popular books');
    }
  }

  /**
   * Get books with low stock (for inventory management)
   */
  async getLowStockBooks(threshold = 10): Promise<Book[]> {
    try {
      // Note: This would typically be a separate endpoint or query parameter
      // For now, we'll fetch all books and filter client-side
      const response = await this.getBooks({
        size: 100, // Get more books to filter
        sort: 'stockQuantity,asc',
      });
      
      return response.content.filter(book => book.stockQuantity <= threshold);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch low stock books');
    }
  }

  /**
   * Build query parameters string from search params
   */
  private buildQueryParams(params: BooksSearchParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Handle service errors with user-friendly messages
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 404) {
      return new Error('Book not found');
    }
    
    if (error.response?.status === 400) {
      return new Error('Invalid search parameters');
    }
    
    return new Error(error.message || defaultMessage);
  }

  /**
   * Utility method to format book price
   */
  static formatPrice(price: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  /**
   * Utility method to check if book is in stock
   */
  static isInStock(book: Book): boolean {
    return book.stockQuantity > 0;
  }

  /**
   * Utility method to check if book is low stock
   */
  static isLowStock(book: Book, threshold = 10): boolean {
    return book.stockQuantity <= threshold && book.stockQuantity > 0;
  }

  /**
   * Utility method to get stock status
   */
  static getStockStatus(book: Book): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (book.stockQuantity === 0) return 'out-of-stock';
    if (book.stockQuantity <= 10) return 'low-stock';
    return 'in-stock';
  }

  /**
   * Utility method to format published date
   */
  static formatPublishedDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Utility method to generate book URL slug
   */
  static generateSlug(book: Book): string {
    return `${book.title}
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}-${book.id.slice(-8)}`;
  }
}

// Create and export service instance
export const booksService = new BooksService();
export default booksService;
