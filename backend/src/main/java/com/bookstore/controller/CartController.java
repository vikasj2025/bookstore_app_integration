package com.bookstore.controller;

import com.bookstore.dto.cart.*;
import com.bookstore.entity.User;
import com.bookstore.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for shopping cart operations.
 */
@RestController
@RequestMapping("/cart")
@Tag(name = "Shopping Cart", description = "Shopping cart management endpoints")
public class CartController {
    
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    
    @Autowired
    private CartService cartService;
    
    /**
     * Get user's shopping cart.
     */
    @GetMapping
    @Operation(summary = "Get user's shopping cart", description = "Retrieve current user's shopping cart items")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        logger.debug("Getting cart for user: {}", user.getEmail());
        
        CartResponse cart = cartService.getCart(user);
        return ResponseEntity.ok(cart);
    }
    
    /**
     * Add item to cart.
     */
    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Add a book to user's shopping cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Item added to cart successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Book not found"),
        @ApiResponse(responseCode = "409", description = "Item already in cart"),
        @ApiResponse(responseCode = "422", description = "Validation error")
    })
    public ResponseEntity<CartItemResponse> addItemToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.info("Adding item to cart - user: {}, book: {}, quantity: {}", 
                   user.getEmail(), request.getBookId(), request.getQuantity());
        
        CartItemResponse item = cartService.addItemToCart(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }
    
    /**
     * Update cart item quantity.
     */
    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity", description = "Update quantity of an item in user's shopping cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart item updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Cart item not found"),
        @ApiResponse(responseCode = "422", description = "Validation error")
    })
    public ResponseEntity<CartItemResponse> updateCartItem(
            @Parameter(description = "Cart item ID") 
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.info("Updating cart item - user: {}, item: {}, quantity: {}", 
                   user.getEmail(), itemId, request.getQuantity());
        
        CartItemResponse item = cartService.updateCartItem(user, itemId, request);
        return ResponseEntity.ok(item);
    }
    
    /**
     * Remove item from cart.
     */
    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart", description = "Remove an item from user's shopping cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Item removed from cart successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Cart item not found")
    })
    public ResponseEntity<Void> removeItemFromCart(
            @Parameter(description = "Cart item ID") 
            @PathVariable UUID itemId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.info("Removing item from cart - user: {}, item: {}", user.getEmail(), itemId);
        
        cartService.removeItemFromCart(user, itemId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Clear shopping cart.
     */
    @DeleteMapping
    @Operation(summary = "Clear shopping cart", description = "Remove all items from user's shopping cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Cart cleared successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        logger.info("Clearing cart for user: {}", user.getEmail());
        
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }
}