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
import java.util.UUID;

/**
 * Repository interface for Book entity operations.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {

    /**
     * Find book by ISBN.
     * 
     * @param isbn the ISBN
     * @return Optional containing the book if found
     */
    Optional<Book> findByIsbn(String isbn);

    /**
     * Check if book exists by ISBN.
     * 
     * @param isbn the ISBN
     * @return true if book exists, false otherwise
     */
    boolean existsByIsbn(String isbn);

    /**
     * Find books by category with pagination.
     * 
     * @param category the category
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByCategory(String category, Pageable pageable);

    /**
     * Find books by title containing (case-insensitive) with pagination.
     * 
     * @param title the title to search for
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    /**
     * Find books by author containing (case-insensitive) with pagination.
     * 
     * @param author the author to search for
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);

    /**
     * Find books by price range with pagination.
     * 
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination information
     * @return Page of books
     */
    Page<Book> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    /**
     * Advanced search for books with multiple criteria.
     * 
     * @param title title to search for (can be null)
     * @param author author to search for (can be null)
     * @param category category to filter by (can be null)
     * @param minPrice minimum price (can be null)
     * @param maxPrice maximum price (can be null)
     * @param pageable pagination information
     * @return Page of books matching criteria
     */
    @Query("SELECT b FROM Book b WHERE " +
           "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice)")
    Page<Book> findBooksWithFilters(
        @Param("title") String title,
        @Param("author") String author,
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    /**
     * Full-text search across title, author, and description.
     * 
     * @param searchQuery the search query
     * @param pageable pagination information
     * @return Page of books matching the search query
     */
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :searchQuery, '%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%', :searchQuery, '%'))")
    Page<Book> searchBooks(@Param("searchQuery") String searchQuery, Pageable pageable);

    /**
     * Find books with stock quantity greater than zero.
     * 
     * @param pageable pagination information
     * @return Page of books in stock
     */
    @Query("SELECT b FROM Book b WHERE b.stockQuantity > 0")
    Page<Book> findBooksInStock(Pageable pageable);

    /**
     * Find books with low stock (less than specified threshold).
     * 
     * @param threshold the stock threshold
     * @return List of books with low stock
     */
    @Query("SELECT b FROM Book b WHERE b.stockQuantity <= :threshold AND b.stockQuantity > 0")
    List<Book> findBooksWithLowStock(@Param("threshold") Integer threshold);

    /**
     * Find all distinct categories.
     * 
     * @return List of distinct categories
     */
    @Query("SELECT DISTINCT b.category FROM Book b ORDER BY b.category")
    List<String> findDistinctCategories();

    /**
     * Find books by IDs for bulk operations.
     * 
     * @param ids list of book IDs
     * @return List of books
     */
    @Query("SELECT b FROM Book b WHERE b.id IN :ids")
    List<Book> findByIdIn(@Param("ids") List<UUID> ids);
}