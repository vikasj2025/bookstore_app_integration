package com.bookstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a payment transaction.
 * 
 * This entity tracks payment processing, including payment status,
 * transaction details, and integration with external payment providers.
 */
@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_order", columnList = "order_id"),
    @Index(name = "idx_payment_status", columnList = "status"),
    @Index(name = "idx_payment_transaction_id", columnList = "transaction_id"),
    @Index(name = "idx_payment_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull(message = "Order is required")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "USD";

    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Column(name = "payment_method_id", length = 255)
    private String paymentMethodId;

    @Column(name = "payment_intent_id", length = 255)
    private String paymentIntentId;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "provider_response", columnDefinition = "TEXT")
    private String providerResponse;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version")
    private Long version;

    // Constructors
    public Payment() {}

    public Payment(Order order, BigDecimal amount, String currency) {
        this.order = order;
        this.amount = amount;
        this.currency = currency;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
        if (status == PaymentStatus.COMPLETED && completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getPaymentMethodId() {
        return paymentMethodId;
    }

    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }

    public String getPaymentIntentId() {
        return paymentIntentId;
    }

    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getProviderResponse() {
        return providerResponse;
    }

    public void setProviderResponse(String providerResponse) {
        this.providerResponse = providerResponse;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    // Business methods
    public boolean isPending() {
        return status == PaymentStatus.PENDING;
    }

    public boolean isProcessing() {
        return status == PaymentStatus.PROCESSING;
    }

    public boolean isCompleted() {
        return status == PaymentStatus.COMPLETED;
    }

    public boolean isFailed() {
        return status == PaymentStatus.FAILED;
    }

    public boolean isCancelled() {
        return status == PaymentStatus.CANCELLED;
    }

    public boolean isRefunded() {
        return status == PaymentStatus.REFUNDED;
    }

    public boolean canBeProcessed() {
        return status == PaymentStatus.PENDING;
    }

    public boolean canBeCancelled() {
        return status == PaymentStatus.PENDING || status == PaymentStatus.PROCESSING;
    }

    public boolean canBeRefunded() {
        return status == PaymentStatus.COMPLETED;
    }

    public void markAsProcessing() {
        if (!canBeProcessed()) {
            throw new IllegalStateException("Payment cannot be processed in current status: " + status);
        }
        this.status = PaymentStatus.PROCESSING;
    }

    public void markAsCompleted(String transactionId) {
        if (status != PaymentStatus.PROCESSING) {
            throw new IllegalStateException("Only processing payments can be completed");
        }
        this.status = PaymentStatus.COMPLETED;
        this.transactionId = transactionId;
        this.completedAt = LocalDateTime.now();
    }

    public void markAsFailed(String reason) {
        if (status == PaymentStatus.COMPLETED || status == PaymentStatus.REFUNDED) {
            throw new IllegalStateException("Cannot fail a completed or refunded payment");
        }
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
    }

    public void markAsCancelled() {
        if (!canBeCancelled()) {
            throw new IllegalStateException("Payment cannot be cancelled in current status: " + status);
        }
        this.status = PaymentStatus.CANCELLED;
    }

    public void markAsRefunded() {
        if (!canBeRefunded()) {
            throw new IllegalStateException("Payment cannot be refunded in current status: " + status);
        }
        this.status = PaymentStatus.REFUNDED;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Payment)) return false;
        Payment payment = (Payment) o;
        return id != null && id.equals(payment.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Payment{" +
                "id=" + id +
                ", orderId=" + (order != null ? order.getId() : null) +
                ", status=" + status +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", transactionId='" + transactionId + '\'' +
                '}';
    }

    /**
     * Enum representing payment status.
     */
    public enum PaymentStatus {
        PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, REFUNDED
    }
}