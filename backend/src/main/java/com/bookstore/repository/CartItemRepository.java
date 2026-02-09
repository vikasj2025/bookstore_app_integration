package com.bookstore.repository;

import com.bookstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for CartItem entity operations.
 * 
 * This repository provides data access methods for cart items including
 * item management and cart-specific operations.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    /**
     * Find all items in a specific cart.
     * 
     * @param cartId the cart ID
     * @return list of cart items
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartId(@Param("cartId") UUID cartId);

    /**
     * Find a specific item in a cart by book.
     * 
     * @param cartId the cart ID
     * @param bookId the book ID
     * @return Optional containing the cart item if found
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.book.id = :bookId")
    Optional<CartItem> findByCartIdAndBookId(@Param("cartId") UUID cartId, @Param("bookId") UUID bookId);

    /**
     * Find cart items for a specific user.
     * 
     * @param userId the user ID
     * @return list of cart items for the user
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.user.id = :userId")
    List<CartItem> findByUserId(@Param("userId") UUID userId);

    /**
     * Find a specific cart item for a user by book.
     * 
     * @param userId the user ID
     * @param bookId the book ID
     * @return Optional containing the cart item if found
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.user.id = :userId AND ci.book.id = :bookId")
    Optional<CartItem> findByUserIdAndBookId(@Param("userId") UUID userId, @Param("bookId") UUID bookId);

    /**
     * Count items in a specific cart.
     * 
     * @param cartId the cart ID
     * @return count of items in the cart
     */
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.id = :cartId")
    long countByCartId(@Param("cartId") UUID cartId);

    /**
     * Count total quantity of items in a specific cart.
     * 
     * @param cartId the cart ID
     * @return total quantity of items in the cart
     */
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer sumQuantityByCartId(@Param("cartId") UUID cartId);

    /**
     * Calculate total value of items in a specific cart.
     * 
     * @param cartId the cart ID
     * @return total value of items in the cart
     */
    @Query("SELECT COALESCE(SUM(ci.totalPrice), 0) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Double sumTotalPriceByCartId(@Param("cartId") UUID cartId);

    /**
     * Find all cart items containing a specific book.
     * 
     * @param bookId the book ID
     * @return list of cart items containing the book
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.book.id = :bookId")
    List<CartItem> findByBookId(@Param("bookId") UUID bookId);

    /**
     * Delete all items from a specific cart.
     * 
     * @param cartId the cart ID
     * @return number of deleted records
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    int deleteByCartId(@Param("cartId") UUID cartId);

    /**
     * Delete a specific item from a cart.
     * 
     * @param cartId the cart ID
     * @param bookId the book ID
     * @return number of deleted records
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.book.id = :bookId")
    int deleteByCartIdAndBookId(@Param("cartId") UUID cartId, @Param("bookId") UUID bookId);

    /**
     * Update quantity of a specific cart item.
     * 
     * @param cartItemId the cart item ID
     * @param quantity the new quantity
     * @return number of updated records
     */
    @Modifying
    @Query("UPDATE CartItem ci SET ci.quantity = :quantity, ci.totalPrice = ci.unitPrice * :quantity WHERE ci.id = :cartItemId")
    int updateQuantity(@Param("cartItemId") UUID cartItemId, @Param("quantity") Integer quantity);

    /**
     * Check if a cart contains a specific book.
     * 
     * @param cartId the cart ID
     * @param bookId the book ID
     * @return true if the cart contains the book
     */
    @Query("SELECT COUNT(ci) > 0 FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.book.id = :bookId")
    boolean existsByCartIdAndBookId(@Param("cartId") UUID cartId, @Param("bookId") UUID bookId);

    /**
     * Find cart items with quantity greater than available stock.
     * This is useful for validation before checkout.
     * 
     * @param cartId the cart ID
     * @return list of cart items with insufficient stock
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.quantity > ci.book.stockQuantity")
    List<CartItem> findItemsWithInsufficientStock(@Param("cartId") UUID cartId);

    /**
     * Find the most popular books in carts (by total quantity across all carts).
     * 
     * @param limit the maximum number of results
     * @return list of book IDs ordered by popularity
     */
    @Query("SELECT ci.book.id, SUM(ci.quantity) as totalQuantity " +
           "FROM CartItem ci " +
           "GROUP BY ci.book.id " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findMostPopularBooksInCarts(@Param("limit") int limit);
}