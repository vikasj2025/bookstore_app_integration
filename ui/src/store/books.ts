/**
 * Books Store using Zustand
 * Manages book catalog state and search functionality
 */

import { create } from 'zustand';
import { BookSummary, BookDetails, Category, PagedBooksResponse, BookQueryParams } from '@/types/api';
import { getBookService } from '@/lib/container';

interface BooksState {
  // State
  books: BookSummary[];
  currentBook: BookDetails | null;
  categories: Category[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  } | null;
  searchQuery: string;
  filters: BookQueryParams;
  isLoading: boolean;
  isLoadingBook: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  
  // Actions
  loadBooks: (params?: BookQueryParams) => Promise<void>;
  loadBook: (bookId: string) => Promise<void>;
  loadCategories: (forceRefresh?: boolean) => Promise<void>;
  searchBooks: (query: string, params?: Omit<BookQueryParams, 'search'>) => Promise<void>;
  setFilters: (filters: Partial<BookQueryParams>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getBookById: (bookId: string) => BookSummary | undefined;
  getCategoryById: (categoryId: string) => Category | undefined;
  getCategoryByName: (categoryName: string) => Category | undefined;
  hasNextPage: () => boolean;
  hasPreviousPage: () => boolean;
}

const initialFilters: BookQueryParams = {
  page: 0,
  size: 20,
  sortBy: 'title',
  sortDirection: 'ASC',
};

export const useBooksStore = create<BooksState>()((set, get) => ({
  // Initial state
  books: [],
  currentBook: null,
  categories: [],
  pagination: null,
  searchQuery: '',
  filters: initialFilters,
  isLoading: false,
  isLoadingBook: false,
  isLoadingCategories: false,
  error: null,

  // Actions
  loadBooks: async (params?: BookQueryParams) => {
    set({ isLoading: true, error: null });
    
    try {
      const bookService = getBookService();
      const queryParams = { ...get().filters, ...params };
      const response = await bookService.getBooks(queryParams);
      
      set({
        books: response.content,
        pagination: response.pagination,
        filters: queryParams,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to load books',
      });
      throw error;
    }
  },

  loadBook: async (bookId: string) => {
    set({ isLoadingBook: true, error: null });
    
    try {
      const bookService = getBookService();
      const book = await bookService.getBookById(bookId);
      
      set({
        currentBook: book,
        isLoadingBook: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoadingBook: false,
        error: error.message || 'Failed to load book details',
      });
      throw error;
    }
  },

  loadCategories: async (forceRefresh = false) => {
    set({ isLoadingCategories: true, error: null });
    
    try {
      const bookService = getBookService();
      const categories = await bookService.getCategories(forceRefresh);
      
      set({
        categories,
        isLoadingCategories: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoadingCategories: false,
        error: error.message || 'Failed to load categories',
      });
      throw error;
    }
  },

  searchBooks: async (query: string, params?: Omit<BookQueryParams, 'search'>) => {
    set({ isLoading: true, error: null, searchQuery: query });
    
    try {
      const bookService = getBookService();
      const searchParams = { ...get().filters, ...params };
      const response = await bookService.searchBooks(query, searchParams);
      
      set({
        books: response.content,
        pagination: response.pagination,
        filters: { ...searchParams, search: query },
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Search failed',
      });
      throw error;
    }
  },

  setFilters: (newFilters: Partial<BookQueryParams>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    
    set({ filters: updatedFilters });
    
    // Auto-reload books with new filters
    get().loadBooks(updatedFilters);
  },

  clearFilters: () => {
    set({ 
      filters: initialFilters,
      searchQuery: '',
    });
    
    // Reload books with default filters
    get().loadBooks(initialFilters);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Computed properties
  getBookById: (bookId: string) => {
    const { books } = get();
    return books.find(book => book.id === bookId);
  },

  getCategoryById: (categoryId: string) => {
    const { categories } = get();
    return categories.find(category => category.id === categoryId);
  },

  getCategoryByName: (categoryName: string) => {
    const { categories } = get();
    return categories.find(category => 
      category.name.toLowerCase() === categoryName.toLowerCase()
    );
  },

  hasNextPage: () => {
    const { pagination } = get();
    return pagination ? !pagination.last : false;
  },

  hasPreviousPage: () => {
    const { pagination } = get();
    return pagination ? !pagination.first : false;
  },
}));

// Selectors for better performance
export const useBooks = () => useBooksStore((state) => ({
  books: state.books,
  pagination: state.pagination,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useCurrentBook = () => useBooksStore((state) => ({
  book: state.currentBook,
  isLoading: state.isLoadingBook,
  error: state.error,
}));

export const useCategories = () => useBooksStore((state) => ({
  categories: state.categories,
  isLoading: state.isLoadingCategories,
  error: state.error,
}));

export const useBookFilters = () => useBooksStore((state) => ({
  filters: state.filters,
  searchQuery: state.searchQuery,
}));

export const useBooksActions = () => useBooksStore((state) => ({
  loadBooks: state.loadBooks,
  loadBook: state.loadBook,
  loadCategories: state.loadCategories,
  searchBooks: state.searchBooks,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  setSearchQuery: state.setSearchQuery,
  clearError: state.clearError,
  setLoading: state.setLoading,
  setError: state.setError,
}));

export const useBooksComputed = () => useBooksStore((state) => ({
  getBookById: state.getBookById,
  getCategoryById: state.getCategoryById,
  getCategoryByName: state.getCategoryByName,
  hasNextPage: state.hasNextPage,
  hasPreviousPage: state.hasPreviousPage,
}));

// Convenience hooks
export const useBookSearch = () => {
  const { searchQuery } = useBookFilters();
  const { searchBooks, setSearchQuery } = useBooksActions();
  
  return {
    searchQuery,
    searchBooks,
    setSearchQuery,
  };
};

export const usePagination = () => {
  const { pagination } = useBooks();
  const { hasNextPage, hasPreviousPage } = useBooksComputed();
  const { setFilters } = useBooksActions();
  
  const goToPage = (page: number) => {
    setFilters({ page });
  };
  
  const nextPage = () => {
    if (hasNextPage() && pagination) {
      goToPage(pagination.page + 1);
    }
  };
  
  const previousPage = () => {
    if (hasPreviousPage() && pagination) {
      goToPage(pagination.page - 1);
    }
  };
  
  return {
    pagination,
    hasNextPage: hasNextPage(),
    hasPreviousPage: hasPreviousPage(),
    goToPage,
    nextPage,
    previousPage,
  };
};
