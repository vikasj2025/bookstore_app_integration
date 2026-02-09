package com.bookstore.repository;

import com.bookstore.entity.Cart;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Cart entity operations.
 * 
 * This repository provides data access methods for shopping carts including
 * user-specific cart operations and cart management.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    /**
     * Find a cart by user.
     * 
     * @param user the user to find cart for
     * @return Optional containing the user's cart if found
     */
    Optional<Cart> findByUser(User user);

    /**
     * Find a cart by user ID.
     * 
     * @param userId the user ID to find cart for
     * @return Optional containing the user's cart if found
     */
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") UUID userId);

    /**
     * Check if a cart exists for the given user.
     * 
     * @param user the user to check for
     * @return true if a cart exists for this user
     */
    boolean existsByUser(User user);

    /**
     * Check if a cart exists for the given user ID.
     * 
     * @param userId the user ID to check for
     * @return true if a cart exists for this user
     */
    @Query("SELECT COUNT(c) > 0 FROM Cart c WHERE c.user.id = :userId")
    boolean existsByUserId(@Param("userId") UUID userId);

    /**
     * Find carts that haven't been updated for a specified period (for cleanup).
     * 
     * @param cutoffDate the cutoff date for last update
     * @return list of stale carts
     */
    List<Cart> findByUpdatedAtBefore(LocalDateTime cutoffDate);

    /**
     * Find carts with no items (empty carts).
     * 
     * @return list of empty carts
     */
    @Query("SELECT c FROM Cart c WHERE c.items IS EMPTY")
    List<Cart> findEmptyCarts();

    /**
     * Count total number of items in a user's cart.
     * 
     * @param userId the user ID
     * @return total number of items in the cart
     */
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM Cart c JOIN c.items ci WHERE c.user.id = :userId")
    Integer countItemsInUserCart(@Param("userId") UUID userId);

    /**
     * Get total value of items in a user's cart.
     * 
     * @param userId the user ID
     * @return total value of items in the cart
     */
    @Query("SELECT COALESCE(SUM(ci.totalPrice), 0) FROM Cart c JOIN c.items ci WHERE c.user.id = :userId")
    Double getTotalValueOfUserCart(@Param("userId") UUID userId);

    /**
     * Find carts created after a specific date.
     * 
     * @param date the date threshold
     * @return list of carts created after the date
     */
    List<Cart> findByCreatedAtAfter(LocalDateTime date);

    /**
     * Delete cart by user ID.
     * 
     * @param userId the user ID
     * @return number of deleted records
     */
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
    int deleteByUserId(@Param("userId") UUID userId);

    /**
     * Delete carts that haven't been updated for a specified period.
     * 
     * @param cutoffDate the cutoff date for last update
     * @return number of deleted records
     */
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.updatedAt < :cutoffDate")
    int deleteStaleCartsBefore(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Delete empty carts.
     * 
     * @return number of deleted records
     */
    @Modifying
    @Query("DELETE FROM Cart c WHERE c.items IS EMPTY")
    int deleteEmptyCarts();

    /**
     * Count carts created today.
     * 
     * @param startOfDay the start of the current day
     * @return count of carts created today
     */
    long countByCreatedAtAfter(LocalDateTime startOfDay);

    /**
     * Find carts with items from a specific book.
     * 
     * @param bookId the book ID
     * @return list of carts containing the book
     */
    @Query("SELECT DISTINCT c FROM Cart c JOIN c.items ci WHERE ci.book.id = :bookId")
    List<Cart> findCartsContainingBook(@Param("bookId") UUID bookId);

    /**
     * Count total active carts (carts with items).
     * 
     * @return count of active carts
     */
    @Query("SELECT COUNT(DISTINCT c) FROM Cart c WHERE c.items IS NOT EMPTY")
    long countActiveCarts();
}