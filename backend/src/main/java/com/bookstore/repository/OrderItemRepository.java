package com.bookstore.repository;

import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for OrderItem entity operations.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    
    /**
     * Find all order items by order.
     * @param order the order
     * @return List of order items
     */
    List<OrderItem> findByOrder(Order order);
    
    /**
     * Find order items by order ID.
     * @param orderId the order ID
     * @return List of order items
     */
    List<OrderItem> findByOrderId(UUID orderId);
    
    /**
     * Delete all order items by order.
     * @param order the order
     */
    void deleteByOrder(Order order);
}