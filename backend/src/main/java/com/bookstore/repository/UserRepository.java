package com.bookstore.repository;

import com.bookstore.entity.User;
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
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email address.
     * @param email the email address
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
    
    /**
     * Find user by email with cart eagerly loaded.
     * @param email the email address
     * @return Optional containing the user with cart if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.cart WHERE u.email = :email")
    Optional<User> findByEmailWithCart(@Param("email") String email);
    
    /**
     * Find user by email with orders eagerly loaded.
     * @param email the email address
     * @return Optional containing the user with orders if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.email = :email")
    Optional<User> findByEmailWithOrders(@Param("email") String email);
}