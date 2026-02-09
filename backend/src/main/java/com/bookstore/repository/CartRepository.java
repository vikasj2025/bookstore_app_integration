package com.bookstore.repository;

import com.bookstore.entity.Cart;
import com.bookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Cart entity operations.
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    
    /**
     * Find cart by user.
     * @param user the user
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUser(User user);
    
    /**
     * Find cart by user ID.
     * @param userId the user ID
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUserId(UUID userId);
    
    /**
     * Find cart by user with items eagerly loaded.
     * @param user the user
     * @return Optional containing the cart with items if found
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.book WHERE c.user = :user")
    Optional<Cart> findByUserWithItems(@Param("user") User user);
    
    /**
     * Find cart by user ID with items eagerly loaded.
     * @param userId the user ID
     * @return Optional containing the cart with items if found
     */
    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.book WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") UUID userId);
    
    /**
     * Check if cart exists for user.
     * @param user the user
     * @return true if cart exists, false otherwise
     */
    boolean existsByUser(User user);
    
    /**
     * Delete cart by user.
     * @param user the user
     */
    void deleteByUser(User user);
}