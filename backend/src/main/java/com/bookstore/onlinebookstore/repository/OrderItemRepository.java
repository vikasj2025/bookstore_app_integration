package com.bookstore.onlinebookstore.repository;

import com.bookstore.onlinebookstore.entity.Order;
import com.bookstore.onlinebookstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for OrderItem entity operations
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Find order items by order
     * @param order the order
     * @return List of order items
     */
    List<OrderItem> findByOrder(Order order);
    
    /**
     * Find order items by order ID
     * @param orderId the order ID
     * @return List of order items
     */
    List<OrderItem> findByOrderId(Long orderId);
    
    /**
     * Find order items with book details
     * @param orderId the order ID
     * @return List of order items with book details
     */
    @Query("SELECT oi FROM OrderItem oi JOIN FETCH oi.book WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderIdWithBook(@Param("orderId") Long orderId);
    
    /**
     * Find order items by book ID
     * @param bookId the book ID
     * @return List of order items containing the book
     */
    List<OrderItem> findByBookId(Long bookId);
    
    /**
     * Count order items by order
     * @param order the order
     * @return count of items in the order
     */
    long countByOrder(Order order);
    
    /**
     * Delete order items by order
     * @param order the order
     */
    void deleteByOrder(Order order);
}
