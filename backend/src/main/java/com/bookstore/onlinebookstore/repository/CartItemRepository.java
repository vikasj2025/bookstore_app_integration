package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Cart;
import com.bookstore.onlinebookstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for CartItem entity operations
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    /**
     * Find cart item by cart and book ID
     * @param cart the cart
     * @param bookId the book ID
     * @return Optional containing the cart item if found
     */
    Optional<CartItem> findByCartAndBookId(Cart cart, Long bookId);
    
    /**
     * Find all cart items for a cart
     * @param cart the cart
     * @return List of cart items
     */
    List<CartItem> findByCart(Cart cart);
    
    /**
     * Find cart items by cart ID
     * @param cartId the cart ID
     * @return List of cart items
     */
    List<CartItem> findByCartId(Long cartId);
    
    /**
     * Delete all cart items for a cart
     * @param cart the cart
     */
    void deleteByCart(Cart cart);
    
    /**
     * Delete cart items by cart ID
     * @param cartId the cart ID
     */
    void deleteByCartId(Long cartId);
    
    /**
     * Count items in a cart
     * @param cart the cart
     * @return number of items in the cart
     */
    long countByCart(Cart cart);
    
    /**
     * Find cart items with book details
     * @param cartId the cart ID
     * @return List of cart items with book details
     */
    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.book WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithBook(@Param("cartId") Long cartId);
}
