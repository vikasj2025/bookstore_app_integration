package com.bookstore.onlinebookstore.service;

import com.bookstore.onlinebookstore.dto.CartDto;
import com.bookstore.onlinebookstore.entity.*;
import com.bookstore.onlinebookstore.exception.InsufficientStockException;
import com.bookstore.onlinebookstore.exception.ResourceNotFoundException;
import com.bookstore.onlinebookstore.mapper.CartMapper;
import com.bookstore.onlinebookstore.repository.CartItemRepository;
import com.bookstore.onlinebookstore.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service class for shopping cart operations.
 */
@Service
@Transactional
public class CartService {

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookService bookService;
    private final CartMapper cartMapper;

    @Autowired
    public CartService(CartRepository cartRepository,
                      CartItemRepository cartItemRepository,
                      BookService bookService,
                      CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookService = bookService;
        this.cartMapper = cartMapper;
    }

    /**
     * Get user's cart.
     * 
     * @param userId user ID
     * @return cart response
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "cart", key = "#userId")
    public CartDto.CartResponse getUserCart(UUID userId) {
        logger.debug("Getting cart for user ID: {}", userId);
        
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> createEmptyCart(userId));
        
        return cartMapper.toCartResponse(cart);
    }

    /**
     * Add item to cart.
     * 
     * @param userId user ID
     * @param request add to cart request
     * @return updated cart response
     * @throws ResourceNotFoundException if book not found
     * @throws InsufficientStockException if insufficient stock
     */
    @CacheEvict(value = "cart", key = "#userId")
    public CartDto.CartResponse addItemToCart(UUID userId, CartDto.AddToCartRequest request) {
        logger.info("Adding item to cart - User: {}, Book: {}, Quantity: {}", 
                   userId, request.getBookId(), request.getQuantity());
        
        UUID bookId = UUID.fromString(request.getBookId());
        Book book = bookService.findById(bookId);
        
        // Check stock availability
        if (!book.hasAvailableQuantity(request.getQuantity())) {
            throw new InsufficientStockException(
                "Insufficient stock. Available: " + book.getAvailableQuantity() + 
                ", Requested: " + request.getQuantity());
        }
        
        Cart cart = getOrCreateCart(userId);
        CartItem existingItem = cart.findItemByBook(book);
        
        if (existingItem != null) {
            // Update existing item quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            
            // Check total quantity against stock
            if (!book.hasAvailableQuantity(newQuantity)) {
                throw new InsufficientStockException(
                    "Insufficient stock for total quantity. Available: " + book.getAvailableQuantity() + 
                    ", Requested total: " + newQuantity);
            }
            
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem(cart, book, request.getQuantity());
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }
        
        Cart savedCart = cartRepository.save(cart);
        logger.info("Item added to cart successfully - User: {}, Book: {}", userId, bookId);
        
        return cartMapper.toCartResponse(savedCart);
    }

    /**
     * Update cart item quantity.
     * 
     * @param userId user ID
     * @param itemId cart item ID
     * @param request update cart item request
     * @return updated cart response
     * @throws ResourceNotFoundException if cart item not found
     * @throws InsufficientStockException if insufficient stock
     */
    @CacheEvict(value = "cart", key = "#userId")
    public CartDto.CartResponse updateCartItem(UUID userId, UUID itemId, CartDto.UpdateCartItemRequest request) {
        logger.info("Updating cart item - User: {}, Item: {}, New Quantity: {}", 
                   userId, itemId, request.getQuantity());
        
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));
        
        // Verify item belongs to user's cart
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Cart item not found");
        }
        
        // Check stock availability
        Book book = cartItem.getBook();
        if (!book.hasAvailableQuantity(request.getQuantity())) {
            throw new InsufficientStockException(
                "Insufficient stock. Available: " + book.getAvailableQuantity() + 
                ", Requested: " + request.getQuantity());
        }
        
        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
        
        Cart savedCart = cartRepository.save(cart);
        logger.info("Cart item updated successfully - User: {}, Item: {}", userId, itemId);
        
        return cartMapper.toCartResponse(savedCart);
    }

    /**
     * Remove item from cart.
     * 
     * @param userId user ID
     * @param itemId cart item ID
     * @throws ResourceNotFoundException if cart item not found
     */
    @CacheEvict(value = "cart", key = "#userId")
    public void removeCartItem(UUID userId, UUID itemId) {
        logger.info("Removing cart item - User: {}, Item: {}", userId, itemId);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + itemId));
        
        // Verify item belongs to user's cart
        if (!cartItem.getCart().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Cart item not found");
        }
        
        Cart cart = cartItem.getCart();
        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
        
        cartRepository.save(cart);
        logger.info("Cart item removed successfully - User: {}, Item: {}", userId, itemId);
    }

    /**
     * Clear all items from cart.
     * 
     * @param userId user ID
     */
    @CacheEvict(value = "cart", key = "#userId")
    public void clearCart(UUID userId) {
        logger.info("Clearing cart for user ID: {}", userId);
        
        Cart cart = getOrCreateCart(userId);
        cart.clearItems();
        cartItemRepository.deleteByCartId(cart.getId());
        
        cartRepository.save(cart);
        logger.info("Cart cleared successfully for user ID: {}", userId);
    }

    /**
     * Create cart for a new user.
     * 
     * @param user the user
     * @return created cart
     */
    public Cart createCartForUser(User user) {
        logger.debug("Creating cart for user ID: {}", user.getId());
        
        Cart cart = new Cart(user);
        Cart savedCart = cartRepository.save(cart);
        
        logger.debug("Cart created successfully for user ID: {}", user.getId());
        return savedCart;
    }

    /**
     * Get or create cart for user.
     * 
     * @param userId user ID
     * @return cart entity
     */
    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> createEmptyCart(userId));
    }

    /**
     * Create empty cart for user.
     * 
     * @param userId user ID
     * @return created cart
     */
    private Cart createEmptyCart(UUID userId) {
        logger.debug("Creating empty cart for user ID: {}", userId);
        
        User user = new User();
        user.setId(userId);
        
        Cart cart = new Cart(user);
        return cartRepository.save(cart);
    }

    /**
     * Get cart entity by user ID (for internal use).
     * 
     * @param userId user ID
     * @return cart entity
     */
    @Transactional(readOnly = true)
    public Cart getCartByUserId(UUID userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> createEmptyCart(userId));
    }

    /**
     * Validate cart items against current stock levels.
     * 
     * @param cart the cart to validate
     * @throws InsufficientStockException if any item has insufficient stock
     */
    @Transactional(readOnly = true)
    public void validateCartStock(Cart cart) {
        for (CartItem item : cart.getItems()) {
            Book book = item.getBook();
            if (!book.hasAvailableQuantity(item.getQuantity())) {
                throw new InsufficientStockException(
                    "Insufficient stock for book: " + book.getTitle() + 
                    ". Available: " + book.getAvailableQuantity() + 
                    ", Required: " + item.getQuantity());
            }
        }
    }
}