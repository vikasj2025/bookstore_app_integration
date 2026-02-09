import { httpClient } from '@/lib/http-client';
import {
  Order,
  OrderDetailsResponse,
  CreateOrderRequest,
  OrdersSearchParams,
  PagedResponse,
  OrderStatus,
} from '@/types/api';

/**
 * Orders Service
 * Handles order management operations
 */
export class OrdersService {
  private readonly basePath = '/orders';

  /**
   * Get paginated list of user's orders
   */
  async getOrders(params: OrdersSearchParams = {}): Promise<PagedResponse<Order>> {
    try {
      const queryParams = this.buildQueryParams(params);
      const response = await httpClient.get<PagedResponse<Order>>(
        `${this.basePath}${queryParams ? `?${queryParams}` : ''}`
      );
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch orders');
    }
  }

  /**
   * Get detailed information about a specific order
   */
  async getOrderById(orderId: string): Promise<OrderDetailsResponse> {
    try {
      const response = await httpClient.get<OrderDetailsResponse>(
        `${this.basePath}/${orderId}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch order details');
    }
  }

  /**
   * Create a new order from current cart
   */
  async createOrder(orderData: CreateOrderRequest): Promise<OrderDetailsResponse> {
    try {
      const response = await httpClient.post<OrderDetailsResponse>(
        this.basePath,
        orderData
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create order');
    }
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await httpClient.post<Order>(
        `${this.basePath}/${orderId}/cancel`
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to cancel order');
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    status: OrderStatus,
    params: Omit<OrdersSearchParams, 'status'> = {}
  ): Promise<PagedResponse<Order>> {
    try {
      const statusParams: OrdersSearchParams = {
        ...params,
        status,
      };
      
      return await this.getOrders(statusParams);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch ${status.toLowerCase()} orders`);
    }
  }

  /**
   * Get recent orders (last 30 days)
   */
  async getRecentOrders(limit = 10): Promise<Order[]> {
    try {
      const response = await this.getOrders({
        size: limit,
        page: 0,
      });
      
      // Filter orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return response.content.filter(order => 
        new Date(order.createdAt) >= thirtyDaysAgo
      );
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch recent orders');
    }
  }

  /**
   * Check if order can be cancelled
   */
  canCancelOrder(order: Order): boolean {
    const cancellableStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  }

  /**
   * Get order status display information
   */
  getOrderStatusInfo(status: OrderStatus): {
    label: string;
    color: string;
    description: string;
  } {
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
      label: status,
      color: 'gray',
      description: 'Unknown status',
    };
  }

  /**
   * Format order for display
   */
  formatOrder(order: Order) {
    const statusInfo = this.getOrderStatusInfo(order.status);
    
    return {
      ...order,
      formattedTotalAmount: this.formatPrice(order.totalAmount),
      formattedCreatedAt: this.formatDate(order.createdAt),
      formattedUpdatedAt: this.formatDate(order.updatedAt),
      statusInfo,
      canCancel: this.canCancelOrder(order),
    };
  }

  /**
   * Format order details for display
   */
  formatOrderDetails(order: OrderDetailsResponse) {
    const statusInfo = this.getOrderStatusInfo(order.status);
    
    return {
      ...order,
      formattedTotalAmount: this.formatPrice(order.totalAmount),
      formattedCreatedAt: this.formatDate(order.createdAt),
      formattedUpdatedAt: this.formatDate(order.updatedAt),
      statusInfo,
      canCancel: this.canCancelOrder(order),
      formattedItems: order.items.map(item => ({
        ...item,
        formattedPrice: this.formatPrice(item.price),
        formattedSubtotal: this.formatPrice(item.subtotal),
      })),
    };
  }

  /**
   * Calculate order summary
   */
  calculateOrderSummary(order: OrderDetailsResponse) {
    const itemsTotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping = 5.99; // Placeholder - should come from order data
    const tax = itemsTotal * 0.08; // Placeholder - should come from order data
    
    return {
      itemsTotal,
      shipping,
      tax,
      total: order.totalAmount,
      formattedItemsTotal: this.formatPrice(itemsTotal),
      formattedShipping: this.formatPrice(shipping),
      formattedTax: this.formatPrice(tax),
      formattedTotal: this.formatPrice(order.totalAmount),
    };
  }

  /**
   * Validate order data before submission
   */
  validateOrderData(orderData: CreateOrderRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Validate shipping address
    if (!orderData.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      if (!orderData.shippingAddress.street?.trim()) {
        errors.push('Street address is required');
      }
      if (!orderData.shippingAddress.city?.trim()) {
        errors.push('City is required');
      }
      if (!orderData.shippingAddress.state?.trim()) {
        errors.push('State is required');
      }
      if (!orderData.shippingAddress.postalCode?.trim()) {
        errors.push('Postal code is required');
      }
      if (!orderData.shippingAddress.country?.trim()) {
        errors.push('Country is required');
      }
    }
    
    // Validate payment method if provided
    if (orderData.paymentMethod) {
      const validPaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'];
      if (!validPaymentMethods.includes(orderData.paymentMethod)) {
        errors.push('Invalid payment method');
      }
    }
    
    // Validate notes length if provided
    if (orderData.notes && orderData.notes.length > 500) {
      errors.push('Order notes must be 500 characters or less');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Build query parameters string from search params
   */
  private buildQueryParams(params: OrdersSearchParams): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Handle service errors with user-friendly messages
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 404) {
      return new Error('Order not found');
    }
    
    if (error.response?.status === 403) {
      return new Error('You do not have permission to access this order');
    }
    
    if (error.response?.status === 400) {
      return new Error('Invalid order data or empty cart');
    }
    
    return new Error(error.message || defaultMessage);
  }

  /**
   * Utility method to format price
   */
  private formatPrice(price: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  /**
   * Utility method to format date
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return dateString;
    }
  }
}

// Create and export service instance
export const ordersService = new OrdersService();
export default ordersService;
