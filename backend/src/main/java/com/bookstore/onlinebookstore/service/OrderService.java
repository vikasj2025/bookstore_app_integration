package com.bookstore.onlinebookstore.service;

import com.bookstore.onlinebookstore.dto.OrderDto;
import com.bookstore.onlinebookstore.entity.*;
import com.bookstore.onlinebookstore.exception.InsufficientStockException;
import com.bookstore.onlinebookstore.exception.InvalidOperationException;
import com.bookstore.onlinebookstore.exception.ResourceNotFoundException;
import com.bookstore.onlinebookstore.mapper.OrderMapper;
import com.bookstore.onlinebookstore.repository.OrderRepository;
import com.bookstore.onlinebookstore.repository.OrderItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Service class for order management operations.
 */
@Service
@Transactional
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    private static final DateTimeFormatter ORDER_NUMBER_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final BookService bookService;
    private final UserService userService;
    private final OrderMapper orderMapper;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                       OrderItemRepository orderItemRepository,
                       CartService cartService,
                       BookService bookService,
                       UserService userService,
                       OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.bookService = bookService;
        this.userService = userService;
        this.orderMapper = orderMapper;
    }

    /**
     * Get user's orders with pagination.
     * 
     * @param userId user ID
     * @param pageable pagination information
     * @return paginated order response
     */
    @Transactional(readOnly = true)
    public OrderDto.OrderPageResponse getUserOrders(UUID userId, Pageable pageable) {
        logger.debug("Getting orders for user ID: {}", userId);
        
        Page<Order> orderPage = orderRepository.findByUserId(userId, pageable);
        return orderMapper.toOrderPageResponse(orderPage);
    }

    /**
     * Get order by ID.
     * 
     * @param userId user ID (for authorization)
     * @param orderId order ID
     * @return order response
     * @throws ResourceNotFoundException if order not found or doesn't belong to user
     */
    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderById(UUID userId, UUID orderId) {
        logger.debug("Getting order by ID: {} for user: {}", orderId, userId);
        
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        return orderMapper.toOrderResponse(order);
    }

    /**
     * Create order from user's cart.
     * 
     * @param userId user ID
     * @param request create order request
     * @return created order response
     * @throws InvalidOperationException if cart is empty
     * @throws InsufficientStockException if insufficient stock for any item
     */
    public OrderDto.OrderResponse createOrder(UUID userId, OrderDto.CreateOrderRequest request) {
        logger.info("Creating order for user ID: {}", userId);
        
        User user = userService.findById(userId);
        Cart cart = cartService.getCartByUserId(userId);
        
        if (cart.isEmpty()) {
            throw new InvalidOperationException("Cannot create order from empty cart");
        }
        
        // Validate stock availability
        cartService.validateCartStock(cart);
        
        // Reserve stock for all items
        for (CartItem cartItem : cart.getItems()) {
            bookService.reserveStock(cartItem.getBook().getId(), cartItem.getQuantity());
        }
        
        try {
            // Create order
            String orderNumber = generateOrderNumber();
            Address shippingAddress = orderMapper.toAddress(request.getShippingAddress());
            Address billingAddress = request.getBillingAddress() != null ? 
                orderMapper.toAddress(request.getBillingAddress()) : shippingAddress;
            
            Order order = new Order(orderNumber, user, shippingAddress, 
                Order.PaymentMethod.valueOf(request.getPaymentMethod().name()));
            order.setBillingAddress(billingAddress);
            order.setNotes(request.getNotes());
            
            // Create order items from cart items
            for (CartItem cartItem : cart.getItems()) {
                OrderItem orderItem = new OrderItem(order, cartItem.getBook(), 
                    cartItem.getQuantity(), cartItem.getUnitPrice());
                order.addItem(orderItem);
            }
            
            order.recalculateTotal();
            Order savedOrder = orderRepository.save(order);
            
            // Clear the cart after successful order creation
            cartService.clearCart(userId);
            
            logger.info("Order created successfully with ID: {} and number: {}", 
                       savedOrder.getId(), savedOrder.getOrderNumber());
            
            return orderMapper.toOrderResponse(savedOrder);
            
        } catch (Exception e) {
            // Release reserved stock if order creation fails
            for (CartItem cartItem : cart.getItems()) {
                try {
                    bookService.releaseReservedStock(cartItem.getBook().getId(), cartItem.getQuantity());
                } catch (Exception releaseException) {
                    logger.error("Failed to release reserved stock for book: {}", 
                               cartItem.getBook().getId(), releaseException);
                }
            }
            throw e;
        }
    }

    /**
     * Cancel an order.
     * 
     * @param userId user ID (for authorization)
     * @param orderId order ID
     * @return updated order response
     * @throws ResourceNotFoundException if order not found or doesn't belong to user
     * @throws InvalidOperationException if order cannot be cancelled
     */
    public OrderDto.OrderResponse cancelOrder(UUID userId, UUID orderId) {
        logger.info("Cancelling order ID: {} for user: {}", orderId, userId);
        
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        if (!order.canBeCancelled()) {
            throw new InvalidOperationException(
                "Order cannot be cancelled in current state: " + order.getStatus());
        }
        
        // Release reserved stock
        for (OrderItem orderItem : order.getItems()) {
            if (order.getStatus() == Order.OrderStatus.PENDING || 
                order.getStatus() == Order.OrderStatus.CONFIRMED) {
                bookService.releaseReservedStock(orderItem.getBook().getId(), orderItem.getQuantity());
            }
        }
        
        order.cancel();
        Order savedOrder = orderRepository.save(order);
        
        logger.info("Order cancelled successfully with ID: {}", orderId);
        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Confirm an order (admin operation).
     * 
     * @param orderId order ID
     * @return updated order response
     */
    public OrderDto.OrderResponse confirmOrder(UUID orderId) {
        logger.info("Confirming order ID: {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        order.confirm();
        Order savedOrder = orderRepository.save(order);
        
        logger.info("Order confirmed successfully with ID: {}", orderId);
        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Process an order (admin operation).
     * 
     * @param orderId order ID
     * @return updated order response
     */
    public OrderDto.OrderResponse processOrder(UUID orderId) {
        logger.info("Processing order ID: {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        order.process();
        Order savedOrder = orderRepository.save(order);
        
        logger.info("Order processing started for ID: {}", orderId);
        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Ship an order (admin operation).
     * 
     * @param orderId order ID
     * @return updated order response
     */
    public OrderDto.OrderResponse shipOrder(UUID orderId) {
        logger.info("Shipping order ID: {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Reduce stock when order is shipped
        for (OrderItem orderItem : order.getItems()) {
            bookService.reduceStock(orderItem.getBook().getId(), orderItem.getQuantity());
        }
        
        order.ship();
        Order savedOrder = orderRepository.save(order);
        
        logger.info("Order shipped successfully with ID: {}", orderId);
        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Mark order as delivered (admin operation).
     * 
     * @param orderId order ID
     * @return updated order response
     */
    public OrderDto.OrderResponse deliverOrder(UUID orderId) {
        logger.info("Marking order as delivered ID: {}", orderId);
        
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        order.deliver();
        Order savedOrder = orderRepository.save(order);
        
        logger.info("Order marked as delivered with ID: {}", orderId);
        return orderMapper.toOrderResponse(savedOrder);
    }

    /**
     * Get all orders with pagination (admin operation).
     * 
     * @param pageable pagination information
     * @return paginated order response
     */
    @Transactional(readOnly = true)
    public OrderDto.OrderPageResponse getAllOrders(Pageable pageable) {
        logger.debug("Getting all orders");
        
        Page<Order> orderPage = orderRepository.findAll(pageable);
        return orderMapper.toOrderPageResponse(orderPage);
    }

    /**
     * Get orders by status (admin operation).
     * 
     * @param status order status
     * @param pageable pagination information
     * @return paginated order response
     */
    @Transactional(readOnly = true)
    public OrderDto.OrderPageResponse getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        logger.debug("Getting orders by status: {}", status);
        
        Page<Order> orderPage = orderRepository.findByStatus(status, pageable);
        return orderMapper.toOrderPageResponse(orderPage);
    }

    /**
     * Generate unique order number.
     * 
     * @return order number
     */
    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(ORDER_NUMBER_FORMATTER);
        String randomSuffix = String.format("%04d", (int) (Math.random() * 10000));
        return "ORD" + timestamp + randomSuffix;
    }

    /**
     * Find order by ID (internal method).
     * 
     * @param orderId order ID
     * @return order entity
     * @throws ResourceNotFoundException if order not found
     */
    @Transactional(readOnly = true)
    public Order findById(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
    }
}