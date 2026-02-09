package com.bookstore.repository;

import com.bookstore.entity.Book;
import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for CartItem entity operations.
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    
    /**
     * Find cart item by cart and book.
     * @param cart the cart
     * @param book the book
     * @return Optional containing the cart item if found
     */
    Optional<CartItem> findByCartAndBook(Cart cart, Book book);
    
    /**
     * Find all cart items by cart.
     * @param cart the cart
     * @return List of cart items
     */
    List<CartItem> findByCart(Cart cart);
    
    /**
     * Find cart item by cart ID and item ID.
     * @param cartId the cart ID
     * @param itemId the item ID
     * @return Optional containing the cart item if found
     */
    Optional<CartItem> findByCartIdAndId(UUID cartId, UUID itemId);
    
    /**
     * Delete all cart items by cart.
     * @param cart the cart
     */
    void deleteByCart(Cart cart);
    
    /**
     * Delete cart item by cart and book.
     * @param cart the cart
     * @param book the book
     */
    void deleteByCartAndBook(Cart cart, Book book);
    
    /**
     * Check if cart item exists by cart and book.
     * @param cart the cart
     * @param book the book
     * @return true if cart item exists, false otherwise
     */
    boolean existsByCartAndBook(Cart cart, Book book);
}