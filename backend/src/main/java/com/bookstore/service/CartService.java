package com.bookstore.service;

import com.bookstore.dto.cart.*;
import com.bookstore.entity.Book;
import com.bookstore.entity.Cart;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.User;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.CartItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for shopping cart operations.
 */
@Service
@Transactional
public class CartService {
    
    private static final Logger logger = LoggerFactory.getLogger(CartService.class);
    
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private BookService bookService;
    
    /**
     * Get user's shopping cart.
     * @param user the user
     * @return cart response
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(User user) {
        logger.debug("Getting cart for user: {}", user.getEmail());
        
        Cart cart = getOrCreateCart(user);
        return convertToCartResponse(cart);
    }
    
    /**
     * Add item to cart.
     * @param user the user
     * @param request add to cart request
     * @return cart item response
     */
    public CartItemResponse addItemToCart(User user, AddToCartRequest request) {
        logger.info("Adding item to cart - user: {}, book: {}, quantity: {}", 
                   user.getEmail(), request.getBookId(), request.getQuantity());
        
        // Validate book availability
        Book book = bookService.getBookEntityById(request.getBookId());
        if (!book.isAvailable(request.getQuantity())) {
            throw new IllegalArgumentException("Insufficient stock for book: " + book.getTitle());
        }
        
        Cart cart = getOrCreateCart(user);
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository.findByCartAndBook(cart, book).orElse(null);
        
        if (existingItem != null) {
            // Update existing item quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (!book.isAvailable(newQuantity)) {
                throw new IllegalArgumentException("Insufficient stock for requested quantity");
            }
            existingItem.setQuantity(newQuantity);
            CartItem savedItem = cartItemRepository.save(existingItem);
            return convertToCartItemResponse(savedItem);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem(cart, book, request.getQuantity(), book.getPrice());
            cart.getItems().add(newItem);
            CartItem savedItem = cartItemRepository.save(newItem);
            return convertToCartItemResponse(savedItem);
        }
    }
    
    /**
     * Update cart item quantity.
     * @param user the user
     * @param itemId cart item ID
     * @param request update cart item request
     * @return cart item response
     */
    public CartItemResponse updateCartItem(User user, UUID itemId, UpdateCartItemRequest request) {
        logger.info("Updating cart item - user: {}, item: {}, quantity: {}", 
                   user.getEmail(), itemId, request.getQuantity());
        
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findByCartIdAndId(cart.getId(), itemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));
        
        // Validate book availability
        if (!item.getBook().isAvailable(request.getQuantity())) {
            throw new IllegalArgumentException("Insufficient stock for requested quantity");
        }
        
        item.setQuantity(request.getQuantity());
        CartItem savedItem = cartItemRepository.save(item);
        
        return convertToCartItemResponse(savedItem);
    }
    
    /**
     * Remove item from cart.
     * @param user the user
     * @param itemId cart item ID
     */
    public void removeItemFromCart(User user, UUID itemId) {
        logger.info("Removing item from cart - user: {}, item: {}", user.getEmail(), itemId);
        
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findByCartIdAndId(cart.getId(), itemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));
        
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
    }
    
    /**
     * Clear user's cart.
     * @param user the user
     */
    public void clearCart(User user) {
        logger.info("Clearing cart for user: {}", user.getEmail());
        
        Cart cart = getOrCreateCart(user);
        cart.clear();
        cartItemRepository.deleteByCart(cart);
    }
    
    /**
     * Get or create cart for user.
     * @param user the user
     * @return cart
     */
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserWithItems(user)
            .orElseGet(() -> createCartForUser(user));
    }
    
    /**
     * Create cart for user.
     * @param user the user
     * @return created cart
     */
    public Cart createCartForUser(User user) {
        logger.info("Creating cart for user: {}", user.getEmail());
        
        Cart cart = new Cart(user);
        return cartRepository.save(cart);
    }
    
    /**
     * Get cart by user ID.
     * @param userId user ID
     * @return cart
     */
    public Cart getCartByUserId(UUID userId) {
        return cartRepository.findByUserIdWithItems(userId)
            .orElseThrow(() -> new IllegalArgumentException("Cart not found for user: " + userId));
    }
    
    /**
     * Validate cart for checkout.
     * @param cart the cart
     * @throws IllegalStateException if cart is invalid for checkout
     */
    public void validateCartForCheckout(Cart cart) {
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cannot checkout with empty cart");
        }
        
        // Validate stock availability for all items
        for (CartItem item : cart.getItems()) {
            if (!item.getBook().isAvailable(item.getQuantity())) {
                throw new IllegalStateException(
                    "Insufficient stock for book: " + item.getBook().getTitle()
                );
            }
        }
    }
    
    /**
     * Convert Cart to CartResponse.
     * @param cart the cart
     * @return cart response
     */
    private CartResponse convertToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setTotalItems(cart.getTotalItems());
        response.setTotalAmount(cart.getTotalAmount());
        response.setUpdatedAt(cart.getUpdatedAt());
        
        List<CartItemResponse> items = cart.getItems().stream()
            .map(this::convertToCartItemResponse)
            .collect(Collectors.toList());
        response.setItems(items);
        
        return response;
    }
    
    /**
     * Convert CartItem to CartItemResponse.
     * @param item the cart item
     * @return cart item response
     */
    private CartItemResponse convertToCartItemResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setId(item.getId());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setSubtotal(item.getSubtotal());
        response.setAddedAt(item.getAddedAt());
        
        // Convert book information
        BookInCartDto book = new BookInCartDto();
        book.setId(item.getBook().getId());
        book.setTitle(item.getBook().getTitle());
        book.setAuthor(item.getBook().getAuthor());
        book.setPrice(item.getBook().getPrice());
        book.setImageUrl(item.getBook().getImageUrl());
        book.setStockQuantity(item.getBook().getStockQuantity());
        response.setBook(book);
        
        return response;
    }
}