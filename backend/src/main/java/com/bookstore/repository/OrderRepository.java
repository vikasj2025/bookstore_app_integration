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
 * 
 * This repository provides data access methods for orders including
 * user-specific orders, status filtering, and order analytics.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Find an order by order number.
     * 
     * @param orderNumber the order number to search for
     * @return Optional containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);

    /**
     * Check if an order exists with the given order number.
     * 
     * @param orderNumber the order number to check
     * @return true if an order with this number exists
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Find orders by user with pagination.
     * 
     * @param user the user to find orders for
     * @param pageable pagination information
     * @return page of user's orders
     */
    Page<Order> findByUser(User user, Pageable pageable);

    /**
     * Find orders by user ID with pagination.
     * 
     * @param userId the user ID to find orders for
     * @param pageable pagination information
     * @return page of user's orders
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId")
    Page<Order> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find orders by status with pagination.
     * 
     * @param status the order status to filter by
     * @param pageable pagination information
     * @return page of orders with the specified status
     */
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    /**
     * Find orders by user and status with pagination.
     * 
     * @param userId the user ID
     * @param status the order status
     * @param pageable pagination information
     * @return page of user's orders with the specified status
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    Page<Order> findByUserIdAndStatus(@Param("userId") UUID userId, 
                                     @Param("status") Order.OrderStatus status, 
                                     Pageable pageable);

    /**
     * Find orders by payment status with pagination.
     * 
     * @param paymentStatus the payment status to filter by
     * @param pageable pagination information
     * @return page of orders with the specified payment status
     */
    Page<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus, Pageable pageable);

    /**
     * Find orders created within a date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable pagination information
     * @return page of orders created within the date range
     */
    Page<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find orders created after a specific date.
     * 
     * @param date the date threshold
     * @param pageable pagination information
     * @return page of orders created after the date
     */
    Page<Order> findByCreatedAtAfter(LocalDateTime date, Pageable pageable);

    /**
     * Find recent orders for a user.
     * 
     * @param userId the user ID
     * @param days number of days to look back
     * @param pageable pagination information
     * @return page of user's recent orders
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.createdAt >= :since ORDER BY o.createdAt DESC")
    Page<Order> findRecentOrdersByUser(@Param("userId") UUID userId, 
                                      @Param("since") LocalDateTime since, 
                                      Pageable pageable);

    /**
     * Find orders that need to be shipped (confirmed status).
     * 
     * @param pageable pagination information
     * @return page of orders ready for shipping
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'CONFIRMED' ORDER BY o.createdAt ASC")
    Page<Order> findOrdersToShip(Pageable pageable);

    /**
     * Find orders by tracking number.
     * 
     * @param trackingNumber the tracking number
     * @return Optional containing the order if found
     */
    Optional<Order> findByTrackingNumber(String trackingNumber);

    /**
     * Count orders by status.
     * 
     * @param status the order status
     * @return count of orders with the specified status
     */
    long countByStatus(Order.OrderStatus status);

    /**
     * Count orders by user.
     * 
     * @param user the user
     * @return count of orders for the user
     */
    long countByUser(User user);

    /**
     * Count orders created today.
     * 
     * @param startOfDay the start of the current day
     * @return count of orders created today
     */
    long countByCreatedAtAfter(LocalDateTime startOfDay);

    /**
     * Calculate total revenue for a date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return total revenue for the period
     */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.paymentStatus = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double calculateRevenueForPeriod(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);

    /**
     * Find top customers by order count.
     * 
     * @param limit the maximum number of results
     * @return list of user IDs and their order counts
     */
    @Query("SELECT o.user.id, COUNT(o) as orderCount " +
           "FROM Order o " +
           "GROUP BY o.user.id " +
           "ORDER BY orderCount DESC")
    List<Object[]> findTopCustomersByOrderCount(@Param("limit") int limit);

    /**
     * Find top customers by total spent.
     * 
     * @param limit the maximum number of results
     * @return list of user IDs and their total spending
     */
    @Query("SELECT o.user.id, SUM(o.totalAmount) as totalSpent " +
           "FROM Order o " +
           "WHERE o.paymentStatus = 'COMPLETED' " +
           "GROUP BY o.user.id " +
           "ORDER BY totalSpent DESC")
    List<Object[]> findTopCustomersByTotalSpent(@Param("limit") int limit);

    /**
     * Find orders containing a specific book.
     * 
     * @param bookId the book ID
     * @param pageable pagination information
     * @return page of orders containing the book
     */
    @Query("SELECT DISTINCT o FROM Order o JOIN o.items oi WHERE oi.book.id = :bookId")
    Page<Order> findOrdersContainingBook(@Param("bookId") UUID bookId, Pageable pageable);

    /**
     * Find orders with total amount greater than a threshold.
     * 
     * @param amount the amount threshold
     * @param pageable pagination information
     * @return page of high-value orders
     */
    @Query("SELECT o FROM Order o WHERE o.totalAmount > :amount ORDER BY o.totalAmount DESC")
    Page<Order> findHighValueOrders(@Param("amount") Double amount, Pageable pageable);

    /**
     * Find orders that are overdue for shipping (confirmed for more than specified hours).
     * 
     * @param hoursAgo the number of hours ago
     * @return list of overdue orders
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'CONFIRMED' AND o.updatedAt < :cutoffTime")
    List<Order> findOverdueOrders(@Param("cutoffTime") LocalDateTime cutoffTime);
}