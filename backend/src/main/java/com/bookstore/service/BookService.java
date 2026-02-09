package com.bookstore.service;

import com.bookstore.dto.book.BookDto;
import com.bookstore.dto.book.BookDetailsDto;
import com.bookstore.dto.common.PagedResponse;
import com.bookstore.entity.Book;
import com.bookstore.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for book catalog operations.
 */
@Service
@Transactional(readOnly = true)
public class BookService {
    
    private static final Logger logger = LoggerFactory.getLogger(BookService.class);
    
    @Autowired
    private BookRepository bookRepository;
    
    @Value("${app.pagination.default-page-size}")
    private int defaultPageSize;
    
    @Value("${app.pagination.max-page-size}")
    private int maxPageSize;
    
    /**
     * Get books with pagination and filtering.
     * @param page page number (0-based)
     * @param size page size
     * @param sort sort specification
     * @param category category filter
     * @param author author filter
     * @param search search term
     * @param minPrice minimum price filter
     * @param maxPrice maximum price filter
     * @return paged response of books
     */
    public PagedResponse<BookDto> getBooks(
            Integer page, 
            Integer size, 
            String sort,
            String category,
            String author,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        logger.debug("Getting books with filters - category: {}, author: {}, search: {}, price: {}-{}", 
                    category, author, search, minPrice, maxPrice);
        
        // Validate and set defaults
        int pageNumber = page != null ? Math.max(0, page) : 0;
        int pageSize = size != null ? Math.min(Math.max(1, size), maxPageSize) : defaultPageSize;
        
        // Parse sort parameter
        Sort sortObj = parseSortParameter(sort);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sortObj);
        
        // Apply filters
        Page<Book> booksPage = bookRepository.findBooksWithFilters(
            category, author, search, minPrice, maxPrice, pageable
        );
        
        // Convert to DTOs
        List<BookDto> bookDtos = booksPage.getContent().stream()
            .map(this::convertToBookDto)
            .collect(Collectors.toList());
        
        return new PagedResponse<>(
            bookDtos,
            booksPage.getNumber(),
            booksPage.getSize(),
            booksPage.getTotalElements(),
            booksPage.getTotalPages(),
            booksPage.isFirst(),
            booksPage.isLast()
        );
    }
    
    /**
     * Get book details by ID.
     * @param id book ID
     * @return book details
     */
    public BookDetailsDto getBookById(UUID id) {
        logger.debug("Getting book details for ID: {}", id);
        
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Book not found: " + id));
        
        return convertToBookDetailsDto(book);
    }
    
    /**
     * Get all book categories.
     * @return list of categories
     */
    @Cacheable(value = "categories", unless = "#result.isEmpty()")
    public List<String> getCategories() {
        logger.debug("Getting all book categories");
        return bookRepository.findAllCategories();
    }
    
    /**
     * Search books by title or description.
     * @param searchTerm search term
     * @param page page number
     * @param size page size
     * @param sort sort specification
     * @return paged response of books
     */
    public PagedResponse<BookDto> searchBooks(String searchTerm, Integer page, Integer size, String sort) {
        logger.debug("Searching books with term: {}", searchTerm);
        
        int pageNumber = page != null ? Math.max(0, page) : 0;
        int pageSize = size != null ? Math.min(Math.max(1, size), maxPageSize) : defaultPageSize;
        Sort sortObj = parseSortParameter(sort);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sortObj);
        
        Page<Book> booksPage = bookRepository.searchByTitleOrDescription(searchTerm, pageable);
        
        List<BookDto> bookDtos = booksPage.getContent().stream()
            .map(this::convertToBookDto)
            .collect(Collectors.toList());
        
        return new PagedResponse<>(
            bookDtos,
            booksPage.getNumber(),
            booksPage.getSize(),
            booksPage.getTotalElements(),
            booksPage.getTotalPages(),
            booksPage.isFirst(),
            booksPage.isLast()
        );
    }
    
    /**
     * Get book entity by ID (for internal use).
     * @param id book ID
     * @return book entity
     */
    public Book getBookEntityById(UUID id) {
        return bookRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Book not found: " + id));
    }
    
    /**
     * Check if book is available in requested quantity.
     * @param bookId book ID
     * @param quantity requested quantity
     * @return true if available, false otherwise
     */
    public boolean isBookAvailable(UUID bookId, int quantity) {
        Book book = getBookEntityById(bookId);
        return book.isAvailable(quantity);
    }
    
    /**
     * Decrease book stock (for order processing).
     * @param bookId book ID
     * @param quantity quantity to decrease
     */
    @Transactional
    public void decreaseStock(UUID bookId, int quantity) {
        Book book = getBookEntityById(bookId);
        book.decreaseStock(quantity);
        bookRepository.save(book);
        logger.info("Decreased stock for book {} by {}", bookId, quantity);
    }
    
    /**
     * Increase book stock (for order cancellation).
     * @param bookId book ID
     * @param quantity quantity to increase
     */
    @Transactional
    public void increaseStock(UUID bookId, int quantity) {
        Book book = getBookEntityById(bookId);
        book.increaseStock(quantity);
        bookRepository.save(book);
        logger.info("Increased stock for book {} by {}", bookId, quantity);
    }
    
    /**
     * Parse sort parameter.
     * @param sort sort parameter (field,direction)
     * @return Sort object
     */
    private Sort parseSortParameter(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "title");
        }
        
        String[] parts = sort.split(",");
        if (parts.length != 2) {
            return Sort.by(Sort.Direction.ASC, "title");
        }
        
        String field = parts[0].trim();
        String direction = parts[1].trim();
        
        // Validate field
        if (!isValidSortField(field)) {
            field = "title";
        }
        
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        return Sort.by(sortDirection, field);
    }
    
    /**
     * Validate sort field.
     * @param field field name
     * @return true if valid, false otherwise
     */
    private boolean isValidSortField(String field) {
        return List.of("title", "author", "price", "category", "publishedDate", "createdAt")
            .contains(field);
    }
    
    /**
     * Convert Book entity to BookDto.
     * @param book book entity
     * @return book DTO
     */
    private BookDto convertToBookDto(Book book) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setIsbn(book.getIsbn());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setDescription(book.getDescription());
        dto.setCategory(book.getCategory());
        dto.setPrice(book.getPrice());
        dto.setImageUrl(book.getImageUrl());
        dto.setStockQuantity(book.getStockQuantity());
        dto.setPublishedDate(book.getPublishedDate());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        return dto;
    }
    
    /**
     * Convert Book entity to BookDetailsDto.
     * @param book book entity
     * @return book details DTO
     */
    private BookDetailsDto convertToBookDetailsDto(Book book) {
        BookDetailsDto dto = new BookDetailsDto();
        dto.setId(book.getId());
        dto.setIsbn(book.getIsbn());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setDescription(book.getDescription());
        dto.setCategory(book.getCategory());
        dto.setPrice(book.getPrice());
        dto.setImageUrl(book.getImageUrl());
        dto.setStockQuantity(book.getStockQuantity());
        dto.setPublishedDate(book.getPublishedDate());
        dto.setPublisher(book.getPublisher());
        dto.setPageCount(book.getPageCount());
        dto.setLanguage(book.getLanguage());
        dto.setLength(book.getLength());
        dto.setWidth(book.getWidth());
        dto.setHeight(book.getHeight());
        dto.setWeight(book.getWeight());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        return dto;
    }
}