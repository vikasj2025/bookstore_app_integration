import { apiClient } from './api-client';
import {
  OrderResponse,
  OrderPageResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrderSearchParams,
  OrderStatus,
  PaymentStatus,
  ApiResponse,
} from '@/types/api';

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
}

export class OrderService {
  private readonly basePath = '/orders';

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<OrderResponse>(this.basePath, orderData);
  }

  /**
   * Get user's orders with pagination and filtering
   */
  async getOrders(params: OrderSearchParams = {}): Promise<ApiResponse<OrderPageResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.set('page', params.page.toString());
    if (params.size !== undefined) queryParams.set('size', params.size.toString());
    if (params.status) queryParams.set('status', params.status);

    const url = queryParams.toString() ? `${this.basePath}?${queryParams}` : this.basePath;
    return apiClient.get<OrderPageResponse>(url);
  }

  /**
   * Get a specific order by ID
   */
  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.get<OrderResponse>(`${this.basePath}/${orderId}`);
  }

  /**
   * Update order status (Admin only)
   */
  async updateOrderStatus(
    orderId: string,
    statusUpdate: UpdateOrderStatusRequest
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.put<OrderResponse>(`${this.basePath}/${orderId}`, statusUpdate);
  }

  /**
   * Cancel an order (if status allows)
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<OrderResponse>> {
    return this.updateOrderStatus(orderId, {
      status: 'CANCELLED',
      notes: reason,
    });
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    status: OrderStatus,
    params: Omit<OrderSearchParams, 'status'> = {}
  ): Promise<ApiResponse<OrderPageResponse>> {
    return this.getOrders({ ...params, status });
  }

  /**
   * Get pending orders
   */
  async getPendingOrders(params: Omit<OrderSearchParams, 'status'> = {}): Promise<ApiResponse<OrderPageResponse>> {
    return this.getOrdersByStatus('PENDING', params);
  }

  /**
   * Get completed orders
   */
  async getCompletedOrders(params: Omit<OrderSearchParams, 'status'> = {}): Promise<ApiResponse<OrderPageResponse>> {
    return this.getOrdersByStatus('DELIVERED', params);
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 5): Promise<ApiResponse<OrderPageResponse>> {
    return this.getOrders({ page: 0, size: limit });
  }

  /**
   * Get order summary statistics
   */
  async getOrderSummary(): Promise<OrderSummary> {
    try {
      // Get all orders to calculate summary
      // In a real implementation, this would be a separate endpoint
      const response = await this.getOrders({ size: 1000 });
      const orders = response.data.content;
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
      const completedOrders = orders.filter(order => order.status === 'DELIVERED').length;
      const totalSpent = orders
        .filter(order => order.paymentStatus === 'COMPLETED')
        .reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent: Math.round(totalSpent * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting order summary:', error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
      };
    }
  }

  /**
   * Track order status
   */
  async trackOrder(orderNumber: string): Promise<OrderResponse | null> {
    try {
      // In a real implementation, this might be a separate endpoint
      const response = await this.getOrders({ size: 100 });
      const order = response.data.content.find(o => o.orderNumber === orderNumber);
      return order || null;
    } catch (error) {
      console.error('Error tracking order:', error);
      return null;
    }
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: OrderResponse): boolean {
    const cancellableStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  }

  /**
   * Check if order can be returned
   */
  canReturnOrder(order: OrderResponse): boolean {
    if (order.status !== 'DELIVERED') {
      return false;
    }
    
    // Allow returns within 30 days of delivery
    const deliveryDate = new Date(order.updatedAt);
    const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    
    return deliveryDate > thirtyDaysAgo;
  }

  /**
   * Get order status display information
   */
  getOrderStatusInfo(status: OrderStatus): { label: string; color: string; description: string } {
    const statusMap = {
      PENDING: {
        label: 'Pending',
        color: 'yellow',
        description: 'Order is being processed',
      },
      CONFIRMED: {
        label: 'Confirmed',
        color: 'blue',
        description: 'Order has been confirmed and is being prepared',
      },
      SHIPPED: {
        label: 'Shipped',
        color: 'purple',
        description: 'Order has been shipped and is on its way',
      },
      DELIVERED: {
        label: 'Delivered',
        color: 'green',
        description: 'Order has been delivered successfully',
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'red',
        description: 'Order has been cancelled',
      },
    };
    
    return statusMap[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown status',
    };
  }

  /**
   * Get payment status display information
   */
  getPaymentStatusInfo(status: PaymentStatus): { label: string; color: string; description: string } {
    const statusMap = {
      PENDING: {
        label: 'Pending',
        color: 'yellow',
        description: 'Payment is being processed',
      },
      COMPLETED: {
        label: 'Paid',
        color: 'green',
        description: 'Payment has been completed successfully',
      },
      FAILED: {
        label: 'Failed',
        color: 'red',
        description: 'Payment has failed',
      },
      REFUNDED: {
        label: 'Refunded',
        color: 'blue',
        description: 'Payment has been refunded',
      },
    };
    
    return statusMap[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown payment status',
    };
  }

  /**
   * Calculate order totals
   */
  calculateOrderTotals(order: OrderResponse): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  } {
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = order.taxAmount;
    const shipping = order.shippingCost;
    const total = order.totalAmount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Validate order creation data
   */
  validateOrderData(orderData: CreateOrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate shipping address
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
    
    // Validate billing address if provided
    if (orderData.billingAddress) {
      if (!orderData.billingAddress.street) {
        errors.push('Billing street address is required');
      }
      if (!orderData.billingAddress.city) {
        errors.push('Billing city is required');
      }
      if (!orderData.billingAddress.state) {
        errors.push('Billing state is required');
      }
      if (!orderData.billingAddress.zipCode) {
        errors.push('Billing ZIP code is required');
      }
      if (!orderData.billingAddress.country) {
        errors.push('Billing country is required');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format order date for display
   */
  formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  /**
   * Generate order receipt data
   */
  generateReceiptData(order: OrderResponse): {
    orderNumber: string;
    date: string;
    items: Array<{
      title: string;
      quantity: number;
      price: string;
      total: string;
    }>;
    totals: {
      subtotal: string;
      tax: string;
      shipping: string;
      total: string;
    };
  } {
    const totals = this.calculateOrderTotals(order);
    
    return {
      orderNumber: order.orderNumber,
      date: this.formatOrderDate(order.createdAt),
      items: order.items.map(item => ({
        title: item.book.title,
        quantity: item.quantity,
        price: this.formatPrice(item.unitPrice),
        total: this.formatPrice(item.totalPrice),
      })),
      totals: {
        subtotal: this.formatPrice(totals.subtotal),
        tax: this.formatPrice(totals.tax),
        shipping: this.formatPrice(totals.shipping),
        total: this.formatPrice(totals.total),
      },
    };
  }
}

// Create singleton instance
export const orderService = new OrderService();
export default orderService;
