package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Book entity operations
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    /**
     * Find book by ISBN
     * @param isbn the ISBN to search for
     * @return Optional containing the book if found
     */
    Optional<Book> findByIsbn(String isbn);
    
    /**
     * Check if ISBN exists
     * @param isbn the ISBN to check
     * @return true if ISBN exists, false otherwise
     */
    boolean existsByIsbn(String isbn);
    
    /**
     * Find books by category with pagination
     * @param category the category to filter by
     * @param pageable pagination information
     * @return Page of books in the specified category
     */
    Page<Book> findByCategory(String category, Pageable pageable);
    
    /**
     * Find books by author with pagination
     * @param author the author to filter by
     * @param pageable pagination information
     * @return Page of books by the specified author
     */
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);
    
    /**
     * Find books by title containing search term
     * @param title the title search term
     * @param pageable pagination information
     * @return Page of books with titles containing the search term
     */
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    /**
     * Find books by price range
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination information
     * @return Page of books within the price range
     */
    Page<Book> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    /**
     * Find books that are in stock
     * @param pageable pagination information
     * @return Page of books that are in stock
     */
    Page<Book> findByInStockTrue(Pageable pageable);
    
    /**
     * Full-text search across title, author, and description
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return Page of books matching the search term
     */
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(b.category) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Book> searchBooks(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find books with advanced filtering
     * @param category category filter (optional)
     * @param author author filter (optional)
     * @param minPrice minimum price filter (optional)
     * @param maxPrice maximum price filter (optional)
     * @param pageable pagination information
     * @return Page of books matching the filters
     */
    @Query("SELECT b FROM Book b WHERE " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice)")
    Page<Book> findBooksWithFilters(
        @Param("category") String category,
        @Param("author") String author,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );
    
    /**
     * Find all distinct categories
     * @return List of all categories
     */
    @Query("SELECT DISTINCT b.category FROM Book b ORDER BY b.category")
    List<String> findAllCategories();
    
    /**
     * Find all distinct authors
     * @return List of all authors
     */
    @Query("SELECT DISTINCT b.author FROM Book b ORDER BY b.author")
    List<String> findAllAuthors();
    
    /**
     * Find books with low stock
     * @param threshold the stock threshold
     * @return List of books with stock below threshold
     */
    @Query("SELECT b FROM Book b WHERE b.stockQuantity <= :threshold AND b.inStock = true")
    List<Book> findBooksWithLowStock(@Param("threshold") int threshold);
    
    /**
     * Find top-rated books
     * @param pageable pagination information
     * @return Page of books ordered by rating descending
     */
    Page<Book> findByOrderByRatingDesc(Pageable pageable);
    
    /**
     * Find recently added books
     * @param pageable pagination information
     * @return Page of books ordered by creation date descending
     */
    Page<Book> findByOrderByCreatedAtDesc(Pageable pageable);
}
