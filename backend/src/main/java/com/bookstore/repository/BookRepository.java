package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Book entity operations.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {
    
    /**
     * Find book by ISBN.
     * @param isbn the ISBN
     * @return Optional containing the book if found
     */
    Optional<Book> findByIsbn(String isbn);
    
    /**
     * Find books by category with pagination.
     * @param category the category
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByCategory(String category, Pageable pageable);
    
    /**
     * Find books by author with pagination.
     * @param author the author name
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);
    
    /**
     * Search books by title or description with pagination.
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return Page of books
     */
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Book> searchByTitleOrDescription(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find books by price range with pagination.
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    /**
     * Find books with complex filtering.
     * @param category category filter (optional)
     * @param author author filter (optional)
     * @param searchTerm search term for title/description (optional)
     * @param minPrice minimum price (optional)
     * @param maxPrice maximum price (optional)
     * @param pageable pagination information
     * @return Page of books
     */
    @Query("SELECT b FROM Book b WHERE " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:searchTerm IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice)")
    Page<Book> findBooksWithFilters(
        @Param("category") String category,
        @Param("author") String author,
        @Param("searchTerm") String searchTerm,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );
    
    /**
     * Get all distinct categories.
     * @return List of categories
     */
    @Query("SELECT DISTINCT b.category FROM Book b ORDER BY b.category")
    List<String> findAllCategories();
    
    /**
     * Find books that are in stock.
     * @param pageable pagination information
     * @return Page of books in stock
     */
    Page<Book> findByStockQuantityGreaterThan(Integer quantity, Pageable pageable);
    
    /**
     * Find books by multiple IDs.
     * @param ids list of book IDs
     * @return List of books
     */
    List<Book> findByIdIn(List<UUID> ids);
    
    /**
     * Check if book exists by ISBN.
     * @param isbn the ISBN
     * @return true if book exists, false otherwise
     */
    boolean existsByIsbn(String isbn);
}