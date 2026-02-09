package com.bookstore.dto.order;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Order item response DTO.
 */
public class OrderItemResponse {
    
    private UUID id;
    private BookInOrderDto book;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
    
    // Constructors
    public OrderItemResponse() {}
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public BookInOrderDto getBook() {
        return book;
    }
    
    public void setBook(BookInOrderDto book) {
        this.book = book;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}