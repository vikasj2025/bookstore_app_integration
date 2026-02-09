package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Cart;
import com.bookstore.onlinebookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Cart entity operations
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    /**
     * Find cart by user
     * @param user the user to find cart for
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUser(User user);
    
    /**
     * Find cart by user ID
     * @param userId the user ID to find cart for
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUserId(Long userId);
    
    /**
     * Check if cart exists for user
     * @param user the user to check
     * @return true if cart exists, false otherwise
     */
    boolean existsByUser(User user);
    
    /**
     * Find carts that haven't been updated recently (for cleanup)
     * @param cutoffDate the cutoff date for last update
     * @return List of carts not updated since cutoff date
     */
    @Query("SELECT c FROM Cart c WHERE c.updatedAt < :cutoffDate")
    List<Cart> findCartsNotUpdatedSince(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Find empty carts
     * @return List of carts with no items
     */
    @Query("SELECT c FROM Cart c WHERE c.totalItems = 0")
    List<Cart> findEmptyCarts();
    
    /**
     * Get cart with items for user
     * @param userId the user ID
     * @return Optional containing the cart with items if found
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.book WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
}
