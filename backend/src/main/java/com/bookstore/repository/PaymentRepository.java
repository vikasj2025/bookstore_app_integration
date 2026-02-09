package com.bookstore.repository;

import com.bookstore.entity.Payment;
import com.bookstore.entity.Order;
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
 * Repository interface for Payment entity operations.
 * 
 * This repository provides data access methods for payments including
 * transaction tracking, status management, and payment analytics.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    /**
     * Find a payment by order.
     * 
     * @param order the order to find payment for
     * @return Optional containing the payment if found
     */
    Optional<Payment> findByOrder(Order order);

    /**
     * Find a payment by order ID.
     * 
     * @param orderId the order ID to find payment for
     * @return Optional containing the payment if found
     */
    @Query("SELECT p FROM Payment p WHERE p.order.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") UUID orderId);

    /**
     * Find a payment by transaction ID.
     * 
     * @param transactionId the transaction ID
     * @return Optional containing the payment if found
     */
    Optional<Payment> findByTransactionId(String transactionId);

    /**
     * Find a payment by payment intent ID (for Stripe integration).
     * 
     * @param paymentIntentId the payment intent ID
     * @return Optional containing the payment if found
     */
    Optional<Payment> findByPaymentIntentId(String paymentIntentId);

    /**
     * Find payments by status with pagination.
     * 
     * @param status the payment status to filter by
     * @param pageable pagination information
     * @return page of payments with the specified status
     */
    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);

    /**
     * Find payments by user ID with pagination.
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of payments for the user
     */
    @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId")
    Page<Payment> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find payments created within a date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable pagination information
     * @return page of payments created within the date range
     */
    Page<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find payments completed within a date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @param pageable pagination information
     * @return page of payments completed within the date range
     */
    Page<Payment> findByCompletedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Find pending payments older than a specific time (for timeout handling).
     * 
     * @param cutoffTime the cutoff time
     * @return list of pending payments that may have timed out
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find processing payments older than a specific time (for stuck payment detection).
     * 
     * @param cutoffTime the cutoff time
     * @return list of processing payments that may be stuck
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'PROCESSING' AND p.updatedAt < :cutoffTime")
    List<Payment> findStuckProcessingPayments(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Find failed payments for a user.
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of failed payments for the user
     */
    @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId AND p.status = 'FAILED'")
    Page<Payment> findFailedPaymentsByUser(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Count payments by status.
     * 
     * @param status the payment status
     * @return count of payments with the specified status
     */
    long countByStatus(Payment.PaymentStatus status);

    /**
     * Count payments created today.
     * 
     * @param startOfDay the start of the current day
     * @return count of payments created today
     */
    long countByCreatedAtAfter(LocalDateTime startOfDay);

    /**
     * Count successful payments for a user.
     * 
     * @param userId the user ID
     * @return count of successful payments for the user
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.order.user.id = :userId AND p.status = 'COMPLETED'")
    long countSuccessfulPaymentsByUser(@Param("userId") UUID userId);

    /**
     * Calculate total revenue for a date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return total revenue for the period
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' AND p.completedAt BETWEEN :startDate AND :endDate")
    Double calculateRevenueForPeriod(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate);

    /**
     * Calculate total amount of pending payments.
     * 
     * @return total amount of pending payments
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'PENDING'")
    Double calculatePendingPaymentsAmount();

    /**
     * Find payments by payment method ID.
     * 
     * @param paymentMethodId the payment method ID
     * @param pageable pagination information
     * @return page of payments using the specified payment method
     */
    Page<Payment> findByPaymentMethodId(String paymentMethodId, Pageable pageable);

    /**
     * Find payments by currency.
     * 
     * @param currency the currency code
     * @param pageable pagination information
     * @return page of payments in the specified currency
     */
    Page<Payment> findByCurrency(String currency, Pageable pageable);

    /**
     * Find recent successful payments.
     * 
     * @param since the date to look back from
     * @param pageable pagination information
     * @return page of recent successful payments
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'COMPLETED' AND p.completedAt >= :since ORDER BY p.completedAt DESC")
    Page<Payment> findRecentSuccessfulPayments(@Param("since") LocalDateTime since, Pageable pageable);

    /**
     * Calculate average payment amount for a period.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return average payment amount for the period
     */
    @Query("SELECT AVG(p.amount) FROM Payment p " +
           "WHERE p.status = 'COMPLETED' AND p.completedAt BETWEEN :startDate AND :endDate")
    Double calculateAveragePaymentAmount(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);

    /**
     * Find payments that need refund processing.
     * 
     * @return list of payments marked for refund
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'REFUNDED'")
    List<Payment> findPaymentsForRefund();

    /**
     * Check if a payment exists for an order.
     * 
     * @param orderId the order ID
     * @return true if a payment exists for the order
     */
    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.order.id = :orderId")
    boolean existsByOrderId(@Param("orderId") UUID orderId);
}