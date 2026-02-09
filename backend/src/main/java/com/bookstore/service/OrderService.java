package com.bookstore.service;

import com.bookstore.dto.order.*;
import com.bookstore.dto.common.PagedResponse;
import com.bookstore.entity.*;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.OrderItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for order processing and management.
 */
@Service
@Transactional
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private CartService cartService;
    
    @Autowired
    private BookService bookService;
    
    @Value("${app.order.number-prefix}")
    private String orderNumberPrefix;
    
    @Value("${app.order.cancellation-window}")
    private int cancellationWindowHours;
    
    @Value("${app.pagination.default-page-size}")
    private int defaultPageSize;
    
    @Value("${app.pagination.max-page-size}")
    private int maxPageSize;
    
    /**
     * Create order from user's cart.
     * @param user the user
     * @param request create order request
     * @return order response
     */
    public OrderResponse createOrder(User user, CreateOrderRequest request) {
        logger.info("Creating order for user: {}", user.getEmail());
        
        // Get user's cart and validate
        Cart cart = cartService.getCartByUserId(user.getId());
        cartService.validateCartForCheckout(cart);
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        
        // Set addresses
        setShippingAddress(order, request.getShippingAddress());
        if (request.getBillingAddress() != null) {
            setBillingAddress(order, request.getBillingAddress());
        } else {
            // Use shipping address as billing address
            setBillingAddress(order, request.getShippingAddress());
        }
        
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNotes(request.getNotes());
        
        // Calculate total and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            // Validate stock availability one more time
            if (!cartItem.getBook().isAvailable(cartItem.getQuantity())) {
                throw new IllegalStateException(
                    "Insufficient stock for book: " + cartItem.getBook().getTitle()
                );
            }
            
            // Create order item
            OrderItem orderItem = new OrderItem(
                order, 
                cartItem.getBook(), 
                cartItem.getQuantity(), 
                cartItem.getPrice()
            );
            order.addItem(orderItem);
            
            // Update total
            totalAmount = totalAmount.add(orderItem.getSubtotal());
            
            // Decrease book stock
            bookService.decreaseStock(cartItem.getBook().getId(), cartItem.getQuantity());
        }
        
        order.setTotalAmount(totalAmount);
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Clear cart after successful order creation
        cartService.clearCart(user);
        
        logger.info("Successfully created order: {} for user: {}", 
                   savedOrder.getOrderNumber(), user.getEmail());
        
        return convertToOrderResponse(savedOrder);
    }
    
    /**
     * Get user's orders with pagination.
     * @param user the user
     * @param page page number
     * @param size page size
     * @param status order status filter
     * @return paged response of orders
     */
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(
            User user, 
            Integer page, 
            Integer size, 
            Order.OrderStatus status
    ) {
        logger.debug("Getting orders for user: {}, status: {}", user.getEmail(), status);
        
        int pageNumber = page != null ? Math.max(0, page) : 0;
        int pageSize = size != null ? Math.min(Math.max(1, size), maxPageSize) : defaultPageSize;
        
        Pageable pageable = PageRequest.of(
            pageNumber, 
            pageSize, 
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
        
        Page<Order> ordersPage;
        if (status != null) {
            ordersPage = orderRepository.findByUserAndStatus(user, status, pageable);
        } else {
            ordersPage = orderRepository.findByUser(user, pageable);
        }
        
        List<OrderResponse> orderResponses = ordersPage.getContent().stream()
            .map(this::convertToOrderResponse)
            .collect(Collectors.toList());
        
        return new PagedResponse<>(
            orderResponses,
            ordersPage.getNumber(),
            ordersPage.getSize(),
            ordersPage.getTotalElements(),
            ordersPage.getTotalPages(),
            ordersPage.isFirst(),
            ordersPage.isLast()
        );
    }
    
    /**
     * Get order details by ID.
     * @param user the user
     * @param orderId order ID
     * @return order details response
     */
    @Transactional(readOnly = true)
    public OrderDetailsResponse getOrderDetails(User user, UUID orderId) {
        logger.debug("Getting order details - user: {}, order: {}", user.getEmail(), orderId);
        
        Order order = orderRepository.findByIdAndUserIdWithItems(orderId, user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        return convertToOrderDetailsResponse(order);
    }
    
    /**
     * Cancel order.
     * @param user the user
     * @param orderId order ID
     * @return order response
     */
    public OrderResponse cancelOrder(User user, UUID orderId) {
        logger.info("Cancelling order - user: {}, order: {}", user.getEmail(), orderId);
        
        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        // Check if order can be cancelled
        if (!order.canBeCancelled()) {
            throw new IllegalStateException(
                "Order cannot be cancelled in current status: " + order.getStatus()
            );
        }
        
        // Check cancellation window
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(cancellationWindowHours);
        if (order.getCreatedAt().isBefore(cutoffTime)) {
            throw new IllegalStateException(
                "Order cannot be cancelled after " + cancellationWindowHours + " hours"
            );
        }
        
        // Cancel order and restore stock
        order.cancel();
        
        // Restore book stock
        for (OrderItem item : order.getItems()) {
            bookService.increaseStock(item.getBook().getId(), item.getQuantity());
        }
        
        Order savedOrder = orderRepository.save(order);
        
        logger.info("Successfully cancelled order: {}", order.getOrderNumber());
        
        return convertToOrderResponse(savedOrder);
    }
    
    /**
     * Generate unique order number.
     * @return order number
     */
    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return orderNumberPrefix + "-" + timestamp + "-" + randomSuffix;
    }
    
    /**
     * Set shipping address on order.
     * @param order the order
     * @param address the address
     */
    private void setShippingAddress(Order order, AddressDto address) {
        order.setShippingStreet(address.getStreet());
        order.setShippingCity(address.getCity());
        order.setShippingState(address.getState());
        order.setShippingPostalCode(address.getPostalCode());
        order.setShippingCountry(address.getCountry());
    }
    
    /**
     * Set billing address on order.
     * @param order the order
     * @param address the address
     */
    private void setBillingAddress(Order order, AddressDto address) {
        order.setBillingStreet(address.getStreet());
        order.setBillingCity(address.getCity());
        order.setBillingState(address.getState());
        order.setBillingPostalCode(address.getPostalCode());
        order.setBillingCountry(address.getCountry());
    }
    
    /**
     * Convert Order to OrderResponse.
     * @param order the order
     * @return order response
     */
    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        return response;
    }
    
    /**
     * Convert Order to OrderDetailsResponse.
     * @param order the order
     * @return order details response
     */
    private OrderDetailsResponse convertToOrderDetailsResponse(Order order) {
        OrderDetailsResponse response = new OrderDetailsResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        // Set addresses
        AddressDto shippingAddress = new AddressDto();
        shippingAddress.setStreet(order.getShippingStreet());
        shippingAddress.setCity(order.getShippingCity());
        shippingAddress.setState(order.getShippingState());
        shippingAddress.setPostalCode(order.getShippingPostalCode());
        shippingAddress.setCountry(order.getShippingCountry());
        response.setShippingAddress(shippingAddress);
        
        AddressDto billingAddress = new AddressDto();
        billingAddress.setStreet(order.getBillingStreet());
        billingAddress.setCity(order.getBillingCity());
        billingAddress.setState(order.getBillingState());
        billingAddress.setPostalCode(order.getBillingPostalCode());
        billingAddress.setCountry(order.getBillingCountry());
        response.setBillingAddress(billingAddress);
        
        response.setPaymentMethod(order.getPaymentMethod());
        response.setNotes(order.getNotes());
        response.setTrackingNumber(order.getTrackingNumber());
        
        // Convert order items
        List<OrderItemResponse> items = order.getItems().stream()
            .map(this::convertToOrderItemResponse)
            .collect(Collectors.toList());
        response.setItems(items);
        
        return response;
    }
    
    /**
     * Convert OrderItem to OrderItemResponse.
     * @param item the order item
     * @return order item response
     */
    private OrderItemResponse convertToOrderItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setSubtotal(item.getSubtotal());
        
        // Convert book information
        BookInOrderDto book = new BookInOrderDto();
        book.setId(item.getBook().getId());
        book.setTitle(item.getBook().getTitle());
        book.setAuthor(item.getBook().getAuthor());
        book.setImageUrl(item.getBook().getImageUrl());
        response.setBook(book);
        
        return response;
    }
}