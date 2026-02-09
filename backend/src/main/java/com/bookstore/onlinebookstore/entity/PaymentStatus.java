package com.bookstore.onlinebookstore.entity;

/**
 * Enumeration representing payment statuses
 */
public enum PaymentStatus {
    PENDING("Payment is pending"),
    COMPLETED("Payment completed successfully"),
    FAILED("Payment failed"),
    REFUNDED("Payment has been refunded");
    
    private final String description;
    
    PaymentStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
