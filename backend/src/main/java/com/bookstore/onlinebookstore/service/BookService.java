package com.bookstore.onlinebookstore.service;

import com.bookstore.onlinebookstore.dto.BookDto;
import com.bookstore.onlinebookstore.dto.CommonDto;
import com.bookstore.onlinebookstore.entity.Book;
import com.bookstore.onlinebookstore.exception.ResourceNotFoundException;
import com.bookstore.onlinebookstore.exception.DuplicateResourceException;
import com.bookstore.onlinebookstore.mapper.BookMapper;
import com.bookstore.onlinebookstore.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Service class for book management operations.
 */
@Service
@Transactional
public class BookService {

    private static final Logger logger = LoggerFactory.getLogger(BookService.class);

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;

    @Autowired
    public BookService(BookRepository bookRepository, BookMapper bookMapper) {
        this.bookRepository = bookRepository;
        this.bookMapper = bookMapper;
    }

    /**
     * Get all books with pagination and filtering.
     * 
     * @param title title filter (optional)
     * @param author author filter (optional)
     * @param category category filter (optional)
     * @param minPrice minimum price filter (optional)
     * @param maxPrice maximum price filter (optional)
     * @param pageable pagination information
     * @return paginated book response
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "books", key = "#title + '_' + #author + '_' + #category + '_' + #minPrice + '_' + #maxPrice + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public BookDto.BookPageResponse getAllBooks(String title, String author, String category, 
                                               BigDecimal minPrice, BigDecimal maxPrice, 
                                               Pageable pageable) {
        logger.debug("Getting books with filters - title: {}, author: {}, category: {}, minPrice: {}, maxPrice: {}", 
                    title, author, category, minPrice, maxPrice);
        
        Page<Book> bookPage = bookRepository.findBooksWithFilters(
            title, author, category, minPrice, maxPrice, pageable);
        
        return bookMapper.toBookPageResponse(bookPage);
    }

    /**
     * Search books by query.
     * 
     * @param query search query
     * @param pageable pagination information
     * @return paginated book response
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "bookSearch", key = "#query + '_' + #pageable.pageNumber + '_' + #pageable.pageSize")
    public BookDto.BookPageResponse searchBooks(String query, Pageable pageable) {
        logger.debug("Searching books with query: {}", query);
        
        Page<Book> bookPage = bookRepository.searchBooks(query, pageable);
        return bookMapper.toBookPageResponse(bookPage);
    }

    /**
     * Get book by ID.
     * 
     * @param bookId book ID
     * @return book response
     * @throws ResourceNotFoundException if book not found
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "book", key = "#bookId")
    public BookDto.BookResponse getBookById(UUID bookId) {
        logger.debug("Getting book by ID: {}", bookId);
        
        Book book = findById(bookId);
        return bookMapper.toBookResponse(book);
    }

    /**
     * Create a new book.
     * 
     * @param request create book request
     * @return created book response
     * @throws DuplicateResourceException if book with ISBN already exists
     */
    @CacheEvict(value = {"books", "bookSearch"}, allEntries = true)
    public BookDto.BookResponse createBook(BookDto.CreateBookRequest request) {
        logger.info("Creating new book with ISBN: {}", request.getIsbn());
        
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book with ISBN " + request.getIsbn() + " already exists");
        }

        Book book = bookMapper.toBook(request);
        Book savedBook = bookRepository.save(book);
        
        logger.info("Book created successfully with ID: {}", savedBook.getId());
        return bookMapper.toBookResponse(savedBook);
    }

    /**
     * Update an existing book.
     * 
     * @param bookId book ID
     * @param request update book request
     * @return updated book response
     * @throws ResourceNotFoundException if book not found
     */
    @CacheEvict(value = {"books", "bookSearch", "book"}, allEntries = true)
    public BookDto.BookResponse updateBook(UUID bookId, BookDto.UpdateBookRequest request) {
        logger.info("Updating book with ID: {}", bookId);
        
        Book book = findById(bookId);
        bookMapper.updateBookFromRequest(request, book);
        
        Book updatedBook = bookRepository.save(book);
        logger.info("Book updated successfully with ID: {}", bookId);
        
        return bookMapper.toBookResponse(updatedBook);
    }

    /**
     * Delete a book.
     * 
     * @param bookId book ID
     * @throws ResourceNotFoundException if book not found
     */
    @CacheEvict(value = {"books", "bookSearch", "book"}, allEntries = true)
    public void deleteBook(UUID bookId) {
        logger.info("Deleting book with ID: {}", bookId);
        
        Book book = findById(bookId);
        bookRepository.delete(book);
        
        logger.info("Book deleted successfully with ID: {}", bookId);
    }

    /**
     * Get book inventory information.
     * 
     * @param bookId book ID
     * @return inventory response
     */
    @Transactional(readOnly = true)
    public CommonDto.InventoryResponse getBookInventory(UUID bookId) {
        logger.debug("Getting inventory for book ID: {}", bookId);
        
        Book book = findById(bookId);
        return bookMapper.toInventoryResponse(book);
    }

    /**
     * Update book inventory.
     * 
     * @param bookId book ID
     * @param request update inventory request
     * @return updated inventory response
     */
    @CacheEvict(value = {"books", "book"}, allEntries = true)
    public CommonDto.InventoryResponse updateBookInventory(UUID bookId, CommonDto.UpdateInventoryRequest request) {
        logger.info("Updating inventory for book ID: {} to quantity: {}", bookId, request.getStockQuantity());
        
        Book book = findById(bookId);
        book.setStockQuantity(request.getStockQuantity());
        
        Book updatedBook = bookRepository.save(book);
        logger.info("Inventory updated successfully for book ID: {}", bookId);
        
        return bookMapper.toInventoryResponse(updatedBook);
    }

    /**
     * Get distinct categories.
     * 
     * @return list of categories
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "categories")
    public List<String> getCategories() {
        logger.debug("Getting all distinct categories");
        return bookRepository.findDistinctCategories();
    }

    /**
     * Find book by ID (internal method).
     * 
     * @param bookId book ID
     * @return book entity
     * @throws ResourceNotFoundException if book not found
     */
    @Transactional(readOnly = true)
    public Book findById(UUID bookId) {
        return bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));
    }

    /**
     * Find book by ISBN.
     * 
     * @param isbn book ISBN
     * @return book entity
     * @throws ResourceNotFoundException if book not found
     */
    @Transactional(readOnly = true)
    public Book findByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ISBN: " + isbn));
    }

    /**
     * Check if book has sufficient stock.
     * 
     * @param bookId book ID
     * @param quantity requested quantity
     * @return true if sufficient stock available
     */
    @Transactional(readOnly = true)
    public boolean hasAvailableStock(UUID bookId, int quantity) {
        Book book = findById(bookId);
        return book.hasAvailableQuantity(quantity);
    }

    /**
     * Reserve book quantity for order processing.
     * 
     * @param bookId book ID
     * @param quantity quantity to reserve
     */
    public void reserveStock(UUID bookId, int quantity) {
        logger.debug("Reserving {} units of book ID: {}", quantity, bookId);
        
        Book book = findById(bookId);
        book.reserveQuantity(quantity);
        bookRepository.save(book);
        
        logger.debug("Reserved {} units of book ID: {}", quantity, bookId);
    }

    /**
     * Release reserved book quantity.
     * 
     * @param bookId book ID
     * @param quantity quantity to release
     */
    public void releaseReservedStock(UUID bookId, int quantity) {
        logger.debug("Releasing {} reserved units of book ID: {}", quantity, bookId);
        
        Book book = findById(bookId);
        book.releaseReservedQuantity(quantity);
        bookRepository.save(book);
        
        logger.debug("Released {} reserved units of book ID: {}", quantity, bookId);
    }

    /**
     * Reduce book stock (for completed orders).
     * 
     * @param bookId book ID
     * @param quantity quantity to reduce
     */
    public void reduceStock(UUID bookId, int quantity) {
        logger.debug("Reducing {} units from stock of book ID: {}", quantity, bookId);
        
        Book book = findById(bookId);
        book.reduceStock(quantity);
        bookRepository.save(book);
        
        logger.debug("Reduced {} units from stock of book ID: {}", quantity, bookId);
    }
}