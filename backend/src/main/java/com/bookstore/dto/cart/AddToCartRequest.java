package com.bookstore.dto.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Add to cart request DTO.
 */
public class AddToCartRequest {
    
    @NotNull(message = "Book ID is required")
    private UUID bookId;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 10, message = "Quantity cannot exceed 10")
    private Integer quantity;
    
    // Constructors
    public AddToCartRequest() {}
    
    public AddToCartRequest(UUID bookId, Integer quantity) {
        this.bookId = bookId;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public UUID getBookId() {
        return bookId;
    }
    
    public void setBookId(UUID bookId) {
        this.bookId = bookId;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}