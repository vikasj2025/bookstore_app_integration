package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Book;
import com.bookstore.onlinebookstore.entity.Cart;
import com.bookstore.onlinebookstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * 
     * @param cart the cart
     * @param book the book
     * @return Optional containing the cart item if found
     */
    Optional<CartItem> findByCartAndBook(Cart cart, Book book);

    /**
     * Find all cart items by cart.
     * 
     * @param cart the cart
     * @return List of cart items
     */
    List<CartItem> findByCart(Cart cart);

    /**
     * Find all cart items by cart ID.
     * 
     * @param cartId the cart ID
     * @return List of cart items
     */
    List<CartItem> findByCartId(UUID cartId);

    /**
     * Find cart items by cart with book details.
     * 
     * @param cartId the cart ID
     * @return List of cart items with book details
     */
    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.book WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithBook(@Param("cartId") UUID cartId);

    /**
     * Delete all cart items by cart.
     * 
     * @param cart the cart
     */
    void deleteByCart(Cart cart);

    /**
     * Delete all cart items by cart ID.
     * 
     * @param cartId the cart ID
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(@Param("cartId") UUID cartId);

    /**
     * Count cart items by cart.
     * 
     * @param cart the cart
     * @return number of items in cart
     */
    long countByCart(Cart cart);

    /**
     * Check if cart item exists by cart and book.
     * 
     * @param cart the cart
     * @param book the book
     * @return true if cart item exists, false otherwise
     */
    boolean existsByCartAndBook(Cart cart, Book book);
}