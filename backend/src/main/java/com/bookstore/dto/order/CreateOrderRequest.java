package com.bookstore.dto.order;

import com.bookstore.entity.Order;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Create order request DTO.
 */
public class CreateOrderRequest {
    
    @NotNull(message = "Shipping address is required")
    @Valid
    private AddressDto shippingAddress;
    
    @Valid
    private AddressDto billingAddress;
    
    private Order.PaymentMethod paymentMethod;
    
    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;
    
    // Constructors
    public CreateOrderRequest() {}
    
    // Getters and Setters
    public AddressDto getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(AddressDto shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public AddressDto getBillingAddress() {
        return billingAddress;
    }
    
    public void setBillingAddress(AddressDto billingAddress) {
        this.billingAddress = billingAddress;
    }
    
    public Order.PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(Order.PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}