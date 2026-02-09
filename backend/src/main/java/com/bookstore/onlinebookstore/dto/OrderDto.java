package com.bookstore.onlinebookstore.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for order-related operations.
 */
public class OrderDto {

    /**
     * Request DTO for creating an order.
     */
    public static class CreateOrderRequest {
        @NotNull(message = "Shipping address is required")
        @Valid
        private AddressRequest shippingAddress;

        @Valid
        private AddressRequest billingAddress;

        @NotNull(message = "Payment method is required")
        private PaymentMethod paymentMethod;

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        private String notes;

        // Constructors
        public CreateOrderRequest() {}

        // Getters and Setters
        public AddressRequest getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(AddressRequest shippingAddress) { this.shippingAddress = shippingAddress; }
        public AddressRequest getBillingAddress() { return billingAddress; }
        public void setBillingAddress(AddressRequest billingAddress) { this.billingAddress = billingAddress; }
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    /**
     * Request DTO for address information.
     */
    public static class AddressRequest {
        @NotBlank(message = "Street is required")
        @Size(max = 200, message = "Street must not exceed 200 characters")
        private String street;

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must not exceed 100 characters")
        private String city;

        @NotBlank(message = "State is required")
        @Size(max = 100, message = "State must not exceed 100 characters")
        private String state;

        @NotBlank(message = "Zip code is required")
        @Size(max = 20, message = "Zip code must not exceed 20 characters")
        private String zipCode;

        @NotBlank(message = "Country is required")
        @Size(max = 100, message = "Country must not exceed 100 characters")
        private String country;

        // Constructors
        public AddressRequest() {}

        // Getters and Setters
        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    /**
     * Response DTO for address information.
     */
    public static class AddressResponse {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;

        // Constructors
        public AddressResponse() {}

        // Getters and Setters
        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public String getZipCode() { return zipCode; }
        public void setZipCode(String zipCode) { this.zipCode = zipCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    /**
     * Response DTO for order item information.
     */
    public static class OrderItemResponse {
        private String id;
        private BookDto.BookResponse book;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;

        // Constructors
        public OrderItemResponse() {}

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public BookDto.BookResponse getBook() { return book; }
        public void setBook(BookDto.BookResponse book) { this.book = book; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    }

    /**
     * Response DTO for order information.
     */
    public static class OrderResponse {
        private String id;
        private String orderNumber;
        private String userId;
        private OrderStatus status;
        private List<OrderItemResponse> items;
        private BigDecimal totalAmount;
        private AddressResponse shippingAddress;
        private AddressResponse billingAddress;
        private PaymentMethod paymentMethod;
        private String notes;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;

        // Constructors
        public OrderResponse() {}

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getOrderNumber() { return orderNumber; }
        public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public OrderStatus getStatus() { return status; }
        public void setStatus(OrderStatus status) { this.status = status; }
        public List<OrderItemResponse> getItems() { return items; }
        public void setItems(List<OrderItemResponse> items) { this.items = items; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public AddressResponse getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(AddressResponse shippingAddress) { this.shippingAddress = shippingAddress; }
        public AddressResponse getBillingAddress() { return billingAddress; }
        public void setBillingAddress(AddressResponse billingAddress) { this.billingAddress = billingAddress; }
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    /**
     * Response DTO for paginated order results.
     */
    public static class OrderPageResponse {
        private List<OrderResponse> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;

        // Constructors
        public OrderPageResponse() {}

        // Getters and Setters
        public List<OrderResponse> getContent() { return content; }
        public void setContent(List<OrderResponse> content) { this.content = content; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public boolean isFirst() { return first; }
        public void setFirst(boolean first) { this.first = first; }
        public boolean isLast() { return last; }
        public void setLast(boolean last) { this.last = last; }
    }

    /**
     * Order status enumeration.
     */
    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }

    /**
     * Payment method enumeration.
     */
    public enum PaymentMethod {
        CREDIT_CARD, DEBIT_CARD, PAYPAL
    }
}