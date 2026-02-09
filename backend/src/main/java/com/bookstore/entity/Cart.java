package com.bookstore.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Cart entity representing a user's shopping cart.
 */
@Entity
@Table(name = "carts", indexes = {
    @Index(name = "idx_cart_user", columnList = "user_id", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class Cart {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Cart() {}
    
    public Cart(User user) {
        this.user = user;
    }
    
    // Business methods
    public void addItem(Book book, int quantity) {
        Optional<CartItem> existingItem = findItemByBook(book);
        if (existingItem.isPresent()) {
            existingItem.get().increaseQuantity(quantity);
        } else {
            CartItem newItem = new CartItem(this, book, quantity, book.getPrice());
            items.add(newItem);
        }
    }
    
    public void updateItemQuantity(UUID itemId, int quantity) {
        CartItem item = findItemById(itemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));
        item.setQuantity(quantity);
    }
    
    public void removeItem(UUID itemId) {
        items.removeIf(item -> item.getId().equals(itemId));
    }
    
    public void removeItem(Book book) {
        items.removeIf(item -> item.getBook().getId().equals(book.getId()));
    }
    
    public void clear() {
        items.clear();
    }
    
    public BigDecimal getTotalAmount() {
        return items.stream()
            .map(CartItem::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public int getTotalItems() {
        return items.stream()
            .mapToInt(CartItem::getQuantity)
            .sum();
    }
    
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    public Optional<CartItem> findItemByBook(Book book) {
        return items.stream()
            .filter(item -> item.getBook().getId().equals(book.getId()))
            .findFirst();
    }
    
    public Optional<CartItem> findItemById(UUID itemId) {
        return items.stream()
            .filter(item -> item.getId().equals(itemId))
            .findFirst();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public List<CartItem> getItems() {
        return items;
    }
    
    public void setItems(List<CartItem> items) {
        this.items = items;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}