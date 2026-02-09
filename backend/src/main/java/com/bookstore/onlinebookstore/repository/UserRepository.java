package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email address.
     * 
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email address.
     * 
     * @param email the email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find user by email and enabled status.
     * 
     * @param email the email address
     * @param enabled the enabled status
     * @return Optional containing the user if found
     */
    Optional<User> findByEmailAndEnabled(String email, boolean enabled);

    /**
     * Find user with cart by user ID.
     * 
     * @param userId the user ID
     * @return Optional containing the user with cart if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.cart WHERE u.id = :userId")
    Optional<User> findByIdWithCart(@Param("userId") UUID userId);

    /**
     * Find user with orders by user ID.
     * 
     * @param userId the user ID
     * @return Optional containing the user with orders if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :userId")
    Optional<User> findByIdWithOrders(@Param("userId") UUID userId);
}