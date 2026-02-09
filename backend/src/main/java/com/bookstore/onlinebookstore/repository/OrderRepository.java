package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Order;
import com.bookstore.onlinebookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Order entity operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Find order by order number.
     * 
     * @param orderNumber the order number
     * @return Optional containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Check if order exists by order number.
     * 
     * @param orderNumber the order number
     * @return true if order exists, false otherwise
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Find orders by user with pagination.
     * 
     * @param user the user
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUser(User user, Pageable pageable);

    /**
     * Find orders by user ID with pagination.
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUserId(UUID userId, Pageable pageable);

    /**
     * Find order by ID and user ID (for authorization).
     * 
     * @param orderId the order ID
     * @param userId the user ID
     * @return Optional containing the order if found and belongs to user
     */
    Optional<Order> findByIdAndUserId(UUID orderId, UUID userId);

    /**
     * Find order with items by ID.
     * 
     * @param orderId the order ID
     * @return Optional containing the order with items if found
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.book WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") UUID orderId);

    /**
     * Find order with items by ID and user ID.
     * 
     * @param orderId the order ID
     * @param userId the user ID
     * @return Optional containing the order with items if found and belongs to user
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.book WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findByIdAndUserIdWithItems(@Param("orderId") UUID orderId, @Param("userId") UUID userId);

    /**
     * Find orders by status.
     * 
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders with the specified status
     */
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    /**
     * Find orders by user and status.
     * 
     * @param user the user
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUserAndStatus(User user, Order.OrderStatus status, Pageable pageable);

    /**
     * Find orders created between dates.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find recent orders for a user.
     * 
     * @param userId the user ID
     * @param limit maximum number of orders to return
     * @return List of recent orders
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Count orders by user.
     * 
     * @param user the user
     * @return number of orders for the user
     */
    long countByUser(User user);

    /**
     * Count orders by status.
     * 
     * @param status the order status
     * @return number of orders with the specified status
     */
    long countByStatus(Order.OrderStatus status);
}