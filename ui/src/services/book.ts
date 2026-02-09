/**
 * Book Service for the Online Bookstore Application
 * Handles book catalog operations, search, and filtering
 */

import {
  BookSummary,
  BookDetails,
  Category,
  PagedBooksResponse,
  BookQueryParams,
} from '@/types/api';
import { ApiClient } from '@/services/api/client';
import { LoggerService } from '@/services/logger';
import { apiEndpoints } from '@/config/app';

export class BookService {
  private apiClient: ApiClient;
  private logger: LoggerService;
  private categoriesCache: Category[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(apiClient: ApiClient, logger: LoggerService) {
    this.apiClient = apiClient;
    this.logger = logger.createChild('BookService');
  }

  /**
   * Get paginated list of books with filtering and sorting
   */
  async getBooks(params: BookQueryParams = {}): Promise<PagedBooksResponse> {
    try {
      this.logger.debug('Fetching books with params:', params);
      
      const response = await this.apiClient.get<PagedBooksResponse>(
        apiEndpoints.books.list,
        this.sanitizeParams(params)
      );

      this.logger.debug(`Fetched ${response.content.length} books`);
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch books:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific book
   */
  async getBookById(bookId: string): Promise<BookDetails> {
    try {
      this.logger.debug('Fetching book details:', bookId);
      
      const response = await this.apiClient.get<BookDetails>(
        apiEndpoints.books.details(bookId)
      );

      this.logger.debug('Book details fetched successfully');
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch book details:', error);
      throw error;
    }
  }

  /**
   * Get all book categories with caching
   */
  async getCategories(forceRefresh = false): Promise<Category[]> {
    try {
      // Return cached categories if available and not expired
      if (!forceRefresh && this.categoriesCache && Date.now() < this.cacheExpiry) {
        this.logger.debug('Returning cached categories');
        return this.categoriesCache;
      }

      this.logger.debug('Fetching book categories');
      
      const response = await this.apiClient.get<Category[]>(
        apiEndpoints.books.categories
      );

      // Cache the categories
      this.categoriesCache = response;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      this.logger.debug(`Fetched ${response.length} categories`);
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Search books by query string
   */
  async searchBooks(
    query: string,
    params: Omit<BookQueryParams, 'search'> = {}
  ): Promise<PagedBooksResponse> {
    try {
      this.logger.debug('Searching books:', query);
      
      const searchParams: BookQueryParams = {
        ...params,
        search: query.trim(),
      };

      const response = await this.getBooks(searchParams);
      
      this.logger.debug(`Search returned ${response.content.length} results`);
      return response;
    } catch (error) {
      this.logger.error('Book search failed:', error);
      throw error;
    }
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(
    category: string,
    params: Omit<BookQueryParams, 'category'> = {}
  ): Promise<PagedBooksResponse> {
    try {
      this.logger.debug('Fetching books by category:', category);
      
      const categoryParams: BookQueryParams = {
        ...params,
        category,
      };

      return await this.getBooks(categoryParams);
    } catch (error) {
      this.logger.error('Failed to fetch books by category:', error);
      throw error;
    }
  }

  /**
   * Get books by author
   */
  async getBooksByAuthor(
    author: string,
    params: Omit<BookQueryParams, 'author'> = {}
  ): Promise<PagedBooksResponse> {
    try {
      this.logger.debug('Fetching books by author:', author);
      
      const authorParams: BookQueryParams = {
        ...params,
        author,
      };

      return await this.getBooks(authorParams);
    } catch (error) {
      this.logger.error('Failed to fetch books by author:', error);
      throw error;
    }
  }

  /**
   * Get books within a price range
   */
  async getBooksByPriceRange(
    minPrice: number,
    maxPrice: number,
    params: Omit<BookQueryParams, 'minPrice' | 'maxPrice'> = {}
  ): Promise<PagedBooksResponse> {
    try {
      this.logger.debug('Fetching books by price range:', { minPrice, maxPrice });
      
      const priceParams: BookQueryParams = {
        ...params,
        minPrice,
        maxPrice,
      };

      return await this.getBooks(priceParams);
    } catch (error) {
      this.logger.error('Failed to fetch books by price range:', error);
      throw error;
    }
  }

  /**
   * Get featured or recommended books
   */
  async getFeaturedBooks(limit = 12): Promise<BookSummary[]> {
    try {
      this.logger.debug('Fetching featured books');
      
      // Get highly rated books as featured books
      const response = await this.getBooks({
        sortBy: 'rating',
        sortDirection: 'DESC',
        size: limit,
        page: 0,
      });

      return response.content;
    } catch (error) {
      this.logger.error('Failed to fetch featured books:', error);
      throw error;
    }
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit = 12): Promise<BookSummary[]> {
    try {
      this.logger.debug('Fetching new releases');
      
      const response = await this.getBooks({
        sortBy: 'publishedDate',
        sortDirection: 'DESC',
        size: limit,
        page: 0,
      });

      return response.content;
    } catch (error) {
      this.logger.error('Failed to fetch new releases:', error);
      throw error;
    }
  }

  /**
   * Get bestsellers
   */
  async getBestsellers(limit = 12): Promise<BookSummary[]> {
    try {
      this.logger.debug('Fetching bestsellers');
      
      // This would typically be based on sales data
      // For now, we'll use rating as a proxy
      const response = await this.getBooks({
        sortBy: 'rating',
        sortDirection: 'DESC',
        size: limit,
        page: 0,
      });

      return response.content;
    } catch (error) {
      this.logger.error('Failed to fetch bestsellers:', error);
      throw error;
    }
  }

  /**
   * Get books similar to a given book
   */
  async getSimilarBooks(bookId: string, limit = 6): Promise<BookSummary[]> {
    try {
      this.logger.debug('Fetching similar books for:', bookId);
      
      // First get the book details to find similar books by category
      const book = await this.getBookById(bookId);
      
      const response = await this.getBooksByCategory(book.category, {
        size: limit + 1, // Get one extra to exclude the current book
        sortBy: 'rating',
        sortDirection: 'DESC',
      });

      // Filter out the current book
      const similarBooks = response.content.filter(b => b.id !== bookId).slice(0, limit);
      
      this.logger.debug(`Found ${similarBooks.length} similar books`);
      return similarBooks;
    } catch (error) {
      this.logger.error('Failed to fetch similar books:', error);
      throw error;
    }
  }

  /**
   * Check book availability
   */
  async checkAvailability(bookId: string): Promise<{ inStock: boolean; quantity: number }> {
    try {
      const book = await this.getBookById(bookId);
      return {
        inStock: book.inStock,
        quantity: book.stockQuantity,
      };
    } catch (error) {
      this.logger.error('Failed to check book availability:', error);
      throw error;
    }
  }

  /**
   * Get book statistics
   */
  async getBookStats(): Promise<{
    totalBooks: number;
    totalCategories: number;
    averageRating: number;
  }> {
    try {
      this.logger.debug('Fetching book statistics');
      
      // Get first page to get total count
      const booksResponse = await this.getBooks({ size: 1 });
      const categories = await this.getCategories();
      
      // Calculate average rating from first page (simplified)
      const avgRating = booksResponse.content.length > 0 
        ? booksResponse.content[0].rating 
        : 0;

      return {
        totalBooks: booksResponse.pagination.totalElements,
        totalCategories: categories.length,
        averageRating: avgRating,
      };
    } catch (error) {
      this.logger.error('Failed to fetch book statistics:', error);
      throw error;
    }
  }

  /**
   * Clear categories cache
   */
  clearCache(): void {
    this.categoriesCache = null;
    this.cacheExpiry = 0;
    this.logger.debug('Categories cache cleared');
  }

  /**
   * Sanitize query parameters
   */
  private sanitizeParams(params: BookQueryParams): BookQueryParams {
    const sanitized: BookQueryParams = {};

    // Only include defined values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (sanitized as any)[key] = value;
      }
    });

    // Ensure page is not negative
    if (sanitized.page !== undefined && sanitized.page < 0) {
      sanitized.page = 0;
    }

    // Ensure size is within bounds
    if (sanitized.size !== undefined) {
      sanitized.size = Math.min(Math.max(sanitized.size, 1), 100);
    }

    // Ensure price range is valid
    if (sanitized.minPrice !== undefined && sanitized.minPrice < 0) {
      sanitized.minPrice = 0;
    }

    if (sanitized.maxPrice !== undefined && sanitized.minPrice !== undefined) {
      if (sanitized.maxPrice < sanitized.minPrice) {
        sanitized.maxPrice = sanitized.minPrice;
      }
    }

    return sanitized;
  }
}
