package com.bookstore.repository;

import com.bookstore.entity.Order;
import com.bookstore.entity.User;
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
     * @param orderNumber the order number
     * @return Optional containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * Find orders by user with pagination.
     * @param user the user
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUser(User user, Pageable pageable);
    
    /**
     * Find orders by user ID with pagination.
     * @param userId the user ID
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUserId(UUID userId, Pageable pageable);
    
    /**
     * Find orders by user and status with pagination.
     * @param user the user
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUserAndStatus(User user, Order.OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by user ID and status with pagination.
     * @param userId the user ID
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders
     */
    Page<Order> findByUserIdAndStatus(UUID userId, Order.OrderStatus status, Pageable pageable);
    
    /**
     * Find order by ID and user ID.
     * @param orderId the order ID
     * @param userId the user ID
     * @return Optional containing the order if found
     */
    Optional<Order> findByIdAndUserId(UUID orderId, UUID userId);
    
    /**
     * Find order with items eagerly loaded.
     * @param orderId the order ID
     * @return Optional containing the order with items if found
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.book WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") UUID orderId);
    
    /**
     * Find order by ID and user ID with items eagerly loaded.
     * @param orderId the order ID
     * @param userId the user ID
     * @return Optional containing the order with items if found
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.book " +
           "WHERE o.id = :orderId AND o.user.id = :userId")
    Optional<Order> findByIdAndUserIdWithItems(@Param("orderId") UUID orderId, @Param("userId") UUID userId);
    
    /**
     * Find orders by status.
     * @param status the order status
     * @return List of orders
     */
    List<Order> findByStatus(Order.OrderStatus status);
    
    /**
     * Find orders created between dates.
     * @param startDate start date
     * @param endDate end date
     * @return List of orders
     */
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Count orders by user.
     * @param user the user
     * @return number of orders
     */
    long countByUser(User user);
    
    /**
     * Count orders by user and status.
     * @param user the user
     * @param status the order status
     * @return number of orders
     */
    long countByUserAndStatus(User user, Order.OrderStatus status);
    
    /**
     * Check if order exists by order number.
     * @param orderNumber the order number
     * @return true if order exists, false otherwise
     */
    boolean existsByOrderNumber(String orderNumber);
    
    /**
     * Find orders that can be cancelled (created within cancellation window).
     * @param cutoffTime the cutoff time for cancellation
     * @param statuses the allowed statuses for cancellation
     * @return List of orders that can be cancelled
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :cutoffTime AND o.status IN :statuses")
    List<Order> findCancellableOrders(@Param("cutoffTime") LocalDateTime cutoffTime, 
                                    @Param("statuses") List<Order.OrderStatus> statuses);
}