package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Order;
import com.bookstore.onlinebookstore.entity.OrderStatus;
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

/**
 * Repository interface for Order entity operations
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find order by order number
     * @param orderNumber the order number to search for
     * @return Optional containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * Find orders by user with pagination
     * @param user the user
     * @param pageable pagination information
     * @return Page of orders for the user
     */
    Page<Order> findByUser(User user, Pageable pageable);
    
    /**
     * Find orders by user ID with pagination
     * @param userId the user ID
     * @param pageable pagination information
     * @return Page of orders for the user
     */
    Page<Order> findByUserId(Long userId, Pageable pageable);
    
    /**
     * Find orders by user and status
     * @param user the user
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders matching user and status
     */
    Page<Order> findByUserAndStatus(User user, OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by user ID and status
     * @param userId the user ID
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders matching user and status
     */
    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);
    
    /**
     * Find orders by status with pagination
     * @param status the order status
     * @param pageable pagination information
     * @return Page of orders with the specified status
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    /**
     * Find orders created between dates
     * @param startDate start date
     * @param endDate end date
     * @param pageable pagination information
     * @return Page of orders created between the dates
     */
    Page<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * Find orders with advanced filtering
     * @param userId user ID filter (optional)
     * @param status status filter (optional)
     * @param startDate start date filter (optional)
     * @param endDate end date filter (optional)
     * @param pageable pagination information
     * @return Page of orders matching the filters
     */
    @Query("SELECT o FROM Order o WHERE " +
           "(:userId IS NULL OR o.user.id = :userId) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Page<Order> findOrdersWithFilters(
        @Param("userId") Long userId,
        @Param("status") OrderStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
    
    /**
     * Find order with items by ID
     * @param orderId the order ID
     * @return Optional containing the order with items if found
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.book WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
    
    /**
     * Find order with items by order number
     * @param orderNumber the order number
     * @return Optional containing the order with items if found
     */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items oi LEFT JOIN FETCH oi.book WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithItems(@Param("orderNumber") String orderNumber);
    
    /**
     * Find user's order by ID (for authorization check)
     * @param orderId the order ID
     * @param userId the user ID
     * @return Optional containing the order if it belongs to the user
     */
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);
    
    /**
     * Count orders by status
     * @param status the order status
     * @return count of orders with the status
     */
    long countByStatus(OrderStatus status);
    
    /**
     * Count orders by user
     * @param user the user
     * @return count of orders for the user
     */
    long countByUser(User user);
    
    /**
     * Find recent orders
     * @param pageable pagination information
     * @return Page of recent orders ordered by creation date descending
     */
    Page<Order> findByOrderByCreatedAtDesc(Pageable pageable);
}
