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
 * 
 * This repository provides data access methods for books including
 * search, filtering, and pagination capabilities.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {

    /**
     * Find a book by its ISBN.
     * 
     * @param isbn the ISBN to search for
     * @return Optional containing the book if found
     */
    Optional<Book> findByIsbn(String isbn);

    /**
     * Check if a book exists with the given ISBN.
     * 
     * @param isbn the ISBN to check
     * @return true if a book with this ISBN exists
     */
    boolean existsByIsbn(String isbn);

    /**
     * Find books by category with pagination.
     * 
     * @param category the category to filter by
     * @param pageable pagination information
     * @return page of books in the specified category
     */
    Page<Book> findByCategory(String category, Pageable pageable);

    /**
     * Find books by author with pagination.
     * 
     * @param author the author to filter by
     * @param pageable pagination information
     * @return page of books by the specified author
     */
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);

    /**
     * Find books by title containing the search term (case insensitive).
     * 
     * @param title the title search term
     * @param pageable pagination information
     * @return page of books with titles containing the search term
     */
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    /**
     * Find books within a price range.
     * 
     * @param minPrice minimum price (inclusive)
     * @param maxPrice maximum price (inclusive)
     * @param pageable pagination information
     * @return page of books within the price range
     */
    Page<Book> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    /**
     * Find books that are in stock (stock quantity > 0).
     * 
     * @param pageable pagination information
     * @return page of books in stock
     */
    Page<Book> findByStockQuantityGreaterThan(Integer quantity, Pageable pageable);

    /**
     * Search books by multiple criteria using a custom query.
     * 
     * @param searchTerm search term for title, author, or description
     * @param category category filter (can be null)
     * @param minPrice minimum price filter (can be null)
     * @param maxPrice maximum price filter (can be null)
     * @param pageable pagination information
     * @return page of books matching the criteria
     */
    @Query("SELECT b FROM Book b WHERE " +
           "(:searchTerm IS NULL OR " +
           " LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           " LOWER(b.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
           "b.stockQuantity > 0")
    Page<Book> searchBooks(@Param("searchTerm") String searchTerm,
                          @Param("category") String category,
                          @Param("minPrice") BigDecimal minPrice,
                          @Param("maxPrice") BigDecimal maxPrice,
                          Pageable pageable);

    /**
     * Find all distinct categories.
     * 
     * @return list of distinct categories
     */
    @Query("SELECT DISTINCT b.category FROM Book b WHERE b.category IS NOT NULL ORDER BY b.category")
    List<String> findDistinctCategories();

    /**
     * Find books with low stock (below threshold).
     * 
     * @param threshold the stock threshold
     * @return list of books with low stock
     */
    List<Book> findByStockQuantityLessThan(Integer threshold);

    /**
     * Find top selling books by category.
     * This would typically join with order items, but for now returns recent books.
     * 
     * @param category the category
     * @param pageable pagination information
     * @return page of books in category ordered by creation date
     */
    @Query("SELECT b FROM Book b WHERE b.category = :category AND b.stockQuantity > 0 ORDER BY b.createdAt DESC")
    Page<Book> findTopBooksByCategory(@Param("category") String category, Pageable pageable);

    /**
     * Find recently added books.
     * 
     * @param pageable pagination information
     * @return page of recently added books
     */
    @Query("SELECT b FROM Book b WHERE b.stockQuantity > 0 ORDER BY b.createdAt DESC")
    Page<Book> findRecentBooks(Pageable pageable);

    /**
     * Count books by category.
     * 
     * @param category the category
     * @return count of books in the category
     */
    long countByCategory(String category);

    /**
     * Count books in stock.
     * 
     * @return count of books with stock quantity > 0
     */
    long countByStockQuantityGreaterThan(Integer quantity);

    /**
     * Update stock quantity for a book.
     * 
     * @param bookId the book ID
     * @param newQuantity the new stock quantity
     * @return number of updated records
     */
    @Query("UPDATE Book b SET b.stockQuantity = :newQuantity WHERE b.id = :bookId")
    int updateStockQuantity(@Param("bookId") UUID bookId, @Param("newQuantity") Integer newQuantity);
}