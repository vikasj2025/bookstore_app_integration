/**
 * Order Service for the Online Bookstore Application
 * Handles order management operations
 */

import {
  OrderSummary,
  OrderDetails,
  CreateOrderRequest,
  PagedOrdersResponse,
  OrderQueryParams,
  OrderStatus,
} from '@/types/api';
import { ApiClient } from '@/services/api/client';
import { LoggerService } from '@/services/logger';
import { apiEndpoints } from '@/config/app';

export class OrderService {
  private apiClient: ApiClient;
  private logger: LoggerService;
  private orderListeners: Array<(orderId: string, status: OrderStatus) => void> = [];

  constructor(apiClient: ApiClient, logger: LoggerService) {
    this.apiClient = apiClient;
    this.logger = logger.createChild('OrderService');
  }

  /**
   * Create a new order from the current cart
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderDetails> {
    try {
      this.logger.info('Creating new order');
      
      const response = await this.apiClient.post<OrderDetails>(
        apiEndpoints.orders.create,
        orderData
      );

      this.logger.info('Order created successfully:', response.orderNumber);
      return response;
    } catch (error) {
      this.logger.error('Failed to create order:', error);
      throw error;
    }
  }

  /**
   * Get paginated list of user's orders
   */
  async getOrders(params: OrderQueryParams = {}): Promise<PagedOrdersResponse> {
    try {
      this.logger.debug('Fetching user orders with params:', params);
      
      const response = await this.apiClient.get<PagedOrdersResponse>(
        apiEndpoints.orders.list,
        this.sanitizeParams(params)
      );

      this.logger.debug(`Fetched ${response.content.length} orders`);
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific order
   */
  async getOrderById(orderId: string): Promise<OrderDetails> {
    try {
      this.logger.debug('Fetching order details:', orderId);
      
      const response = await this.apiClient.get<OrderDetails>(
        apiEndpoints.orders.details(orderId)
      );

      this.logger.debug('Order details fetched successfully');
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch order details:', error);
      throw error;
    }
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(orderId: string): Promise<OrderDetails> {
    try {
      this.logger.info('Cancelling order:', orderId);
      
      const response = await this.apiClient.put<OrderDetails>(
        apiEndpoints.orders.cancel(orderId)
      );

      // Notify listeners about status change
      this.notifyOrderStatusChange(orderId, 'CANCELLED');
      
      this.logger.info('Order cancelled successfully');
      return response;
    } catch (error) {
      this.logger.error('Failed to cancel order:', error);
      throw error;
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    status: OrderStatus,
    params: Omit<OrderQueryParams, 'status'> = {}
  ): Promise<PagedOrdersResponse> {
    try {
      this.logger.debug('Fetching orders by status:', status);
      
      const statusParams: OrderQueryParams = {
        ...params,
        status,
      };

      return await this.getOrders(statusParams);
    } catch (error) {
      this.logger.error('Failed to fetch orders by status:', error);
      throw error;
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit = 5): Promise<OrderSummary[]> {
    try {
      this.logger.debug('Fetching recent orders');
      
      const response = await this.getOrders({
        size: limit,
        page: 0,
      });

      return response.content;
    } catch (error) {
      this.logger.error('Failed to fetch recent orders:', error);
      throw error;
    }
  }

  /**
   * Get pending orders
   */
  async getPendingOrders(): Promise<OrderSummary[]> {
    try {
      this.logger.debug('Fetching pending orders');
      
      const response = await this.getOrdersByStatus('PENDING');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to fetch pending orders:', error);
      throw error;
    }
  }

  /**
   * Get delivered orders
   */
  async getDeliveredOrders(): Promise<OrderSummary[]> {
    try {
      this.logger.debug('Fetching delivered orders');
      
      const response = await this.getOrdersByStatus('DELIVERED');
      return response.content;
    } catch (error) {
      this.logger.error('Failed to fetch delivered orders:', error);
      throw error;
    }
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: OrderSummary | OrderDetails): boolean {
    const cancellableStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  }

  /**
   * Get order status display text
   */
  getOrderStatusText(status: OrderStatus): string {
    const statusTexts: Record<OrderStatus, string> = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
    };

    return statusTexts[status] || status;
  }

  /**
   * Get order status color for UI
   */
  getOrderStatusColor(status: OrderStatus): string {
    const statusColors: Record<OrderStatus, string> = {
      PENDING: 'yellow',
      CONFIRMED: 'blue',
      SHIPPED: 'purple',
      DELIVERED: 'green',
      CANCELLED: 'red',
    };

    return statusColors[status] || 'gray';
  }

  /**
   * Calculate order summary statistics
   */
  async getOrderStatistics(): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
  }> {
    try {
      this.logger.debug('Calculating order statistics');
      
      // Get all orders to calculate statistics
      const allOrdersResponse = await this.getOrders({ size: 1000 }); // Large size to get all
      const orders = allOrdersResponse.content;

      const stats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: orders.filter(order => order.status === 'PENDING').length,
        deliveredOrders: orders.filter(order => order.status === 'DELIVERED').length,
      };

      this.logger.debug('Order statistics calculated:', stats);
      return stats;
    } catch (error) {
      this.logger.error('Failed to calculate order statistics:', error);
      throw error;
    }
  }

  /**
   * Get order timeline/tracking information
   */
  getOrderTimeline(order: OrderDetails): Array<{
    status: OrderStatus;
    date: string;
    description: string;
    completed: boolean;
  }> {
    const timeline = [
      {
        status: 'PENDING' as OrderStatus,
        date: order.orderDate,
        description: 'Order placed',
        completed: true,
      },
      {
        status: 'CONFIRMED' as OrderStatus,
        date: order.orderDate, // In real app, this would be a separate timestamp
        description: 'Order confirmed',
        completed: ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        status: 'SHIPPED' as OrderStatus,
        date: order.orderDate, // In real app, this would be a separate timestamp
        description: 'Order shipped',
        completed: ['SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        status: 'DELIVERED' as OrderStatus,
        date: order.expectedDeliveryDate || '',
        description: 'Order delivered',
        completed: order.status === 'DELIVERED',
      },
    ];

    // Handle cancelled orders
    if (order.status === 'CANCELLED') {
      timeline.push({
        status: 'CANCELLED' as OrderStatus,
        date: order.orderDate, // In real app, this would be cancellation timestamp
        description: 'Order cancelled',
        completed: true,
      });
    }

    return timeline;
  }

  /**
   * Format order number for display
   */
  formatOrderNumber(orderNumber: string): string {
    // Add formatting if needed (e.g., add dashes, prefixes)
    return orderNumber.toUpperCase();
  }

  /**
   * Calculate estimated delivery date
   */
  calculateEstimatedDelivery(shippingMethod: string): Date {
    const now = new Date();
    let daysToAdd = 7; // Default standard shipping

    switch (shippingMethod) {
      case 'EXPRESS':
        daysToAdd = 3;
        break;
      case 'OVERNIGHT':
        daysToAdd = 1;
        break;
      case 'STANDARD':
      default:
        daysToAdd = 7;
        break;
    }

    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + daysToAdd);
    return deliveryDate;
  }

  /**
   * Subscribe to order status changes
   */
  onOrderStatusChange(
    callback: (orderId: string, status: OrderStatus) => void
  ): () => void {
    this.orderListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.orderListeners.indexOf(callback);
      if (index > -1) {
        this.orderListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners about order status changes
   */
  private notifyOrderStatusChange(orderId: string, status: OrderStatus): void {
    this.orderListeners.forEach(callback => {
      try {
        callback(orderId, status);
      } catch (error) {
        this.logger.error('Error in order status change listener:', error);
      }
    });
  }

  /**
   * Sanitize query parameters
   */
  private sanitizeParams(params: OrderQueryParams): OrderQueryParams {
    const sanitized: OrderQueryParams = {};

    // Only include defined values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (sanitized as any)[key] = value;
      }
    });

    // Ensure page is not negative
    if (sanitized.page !== undefined && sanitized.page < 0) {
      sanitized.page = 0;
    }

    // Ensure size is within bounds
    if (sanitized.size !== undefined) {
      sanitized.size = Math.min(Math.max(sanitized.size, 1), 50);
    }

    return sanitized;
  }

  /**
   * Validate order data before submission
   */
  validateOrderData(orderData: CreateOrderRequest): string[] {
    const errors: string[] = [];

    if (!orderData.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      if (!orderData.shippingAddress.street) {
        errors.push('Street address is required');
      }
      if (!orderData.shippingAddress.city) {
        errors.push('City is required');
      }
      if (!orderData.shippingAddress.state) {
        errors.push('State is required');
      }
      if (!orderData.shippingAddress.zipCode) {
        errors.push('ZIP code is required');
      }
      if (!orderData.shippingAddress.country) {
        errors.push('Country is required');
      }
    }

    if (!orderData.paymentMethod) {
      errors.push('Payment method is required');
    }

    return errors;
  }
}
