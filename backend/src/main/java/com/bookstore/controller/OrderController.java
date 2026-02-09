package com.bookstore.controller;

import com.bookstore.dto.common.PagedResponse;
import com.bookstore.dto.order.*;
import com.bookstore.entity.Order;
import com.bookstore.entity.User;
import com.bookstore.service.OrderService;
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
 * REST controller for order management operations.
 */
@RestController
@RequestMapping("/orders")
@Tag(name = "Order Management", description = "Order processing and management endpoints")
public class OrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    @Autowired
    private OrderService orderService;
    
    /**
     * Get user's orders with pagination.
     */
    @GetMapping
    @Operation(summary = "Get user's orders", description = "Retrieve paginated list of user's orders")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<PagedResponse<OrderResponse>> getUserOrders(
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") Integer page,
            
            @Parameter(description = "Number of items per page")
            @RequestParam(defaultValue = "10") Integer size,
            
            @Parameter(description = "Filter by order status")
            @RequestParam(required = false) Order.OrderStatus status,
            
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.debug("Getting orders for user: {}, status: {}", user.getEmail(), status);
        
        PagedResponse<OrderResponse> orders = orderService.getUserOrders(user, page, size, status);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Create order from cart.
     */
    @PostMapping
    @Operation(summary = "Create order from cart", description = "Create a new order from user's current shopping cart")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Order created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or empty cart"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "422", description = "Validation error")
    })
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.info("Creating order for user: {}", user.getEmail());
        
        OrderResponse order = orderService.createOrder(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
    
    /**
     * Get order details.
     */
    @GetMapping("/{orderId}")
    @Operation(summary = "Get order details", description = "Retrieve detailed information about a specific order")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order details retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderDetailsResponse> getOrderDetails(
            @Parameter(description = "Order ID")
            @PathVariable UUID orderId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.debug("Getting order details - user: {}, order: {}", user.getEmail(), orderId);
        
        OrderDetailsResponse order = orderService.getOrderDetails(user, orderId);
        return ResponseEntity.ok(order);
    }
    
    /**
     * Cancel order.
     */
    @PostMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel an existing order if it's in a cancellable state")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Order cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Order cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderResponse> cancelOrder(
            @Parameter(description = "Order ID")
            @PathVariable UUID orderId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        logger.info("Cancelling order - user: {}, order: {}", user.getEmail(), orderId);
        
        OrderResponse order = orderService.cancelOrder(user, orderId);
        return ResponseEntity.ok(order);
    }
}