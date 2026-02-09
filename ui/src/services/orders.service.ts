import { api } from '@/lib/api-client';
import {
  OrderResponse,
  OrderPageResponse,
  CreateOrderRequest,
  PageRequest,
} from '@/types';

export class OrdersService {
  /**
   * Get user's orders with pagination
   */
  static async getOrders(params?: PageRequest): Promise<OrderPageResponse> {
    const response = await api.get<OrderPageResponse>('/orders', { params });
    return response.data;
  }

  /**
   * Get a specific order by ID
   */
  static async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Create a new order from cart items
   */
  static async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>('/orders', data);
    return response.data;
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.put<OrderResponse>(`/orders/${orderId}/cancel`);
    return response.data;
  }

  /**
   * Check if order can be cancelled
   */
  static canCancelOrder(order: OrderResponse): boolean {
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  }

  /**
   * Get order status display information
   */
  static getOrderStatusInfo(status: OrderResponse['status']): {
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
        description: 'Order has been confirmed',
      },
      PROCESSING: {
        label: 'Processing',
        color: 'purple',
        description: 'Order is being prepared',
      },
      SHIPPED: {
        label: 'Shipped',
        color: 'indigo',
        description: 'Order has been shipped',
      },
      DELIVERED: {
        label: 'Delivered',
        color: 'green',
        description: 'Order has been delivered',
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
   * Calculate order totals including tax and shipping
   */
  static calculateOrderTotals(order: OrderResponse): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  } {
    const subtotal = order.totalAmount;
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    return {
      subtotal,
      tax,
      shipping,
      total,
    };
  }

  /**
   * Format order number for display
   */
  static formatOrderNumber(orderNumber: string): string {
    return `#${orderNumber}`;
  }

  /**
   * Get estimated delivery date
   */
  static getEstimatedDeliveryDate(order: OrderResponse): Date | null {
    const createdAt = new Date(order.createdAt);
    const businessDays = 5; // 5 business days
    
    let deliveryDate = new Date(createdAt);
    let addedDays = 0;
    
    while (addedDays < businessDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Skip weekends
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return deliveryDate;
  }

  /**
   * Get order progress percentage
   */
  static getOrderProgress(status: OrderResponse['status']): number {
    const progressMap = {
      PENDING: 20,
      CONFIRMED: 40,
      PROCESSING: 60,
      SHIPPED: 80,
      DELIVERED: 100,
      CANCELLED: 0,
    };

    return progressMap[status] || 0;
  }

  /**
   * Check if order is in final state
   */
  static isOrderFinal(order: OrderResponse): boolean {
    const finalStatuses = ['DELIVERED', 'CANCELLED'];
    return finalStatuses.includes(order.status);
  }

  /**
   * Get next expected status
   */
  static getNextStatus(currentStatus: OrderResponse['status']): string | null {
    const statusFlow = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
      DELIVERED: null,
      CANCELLED: null,
    };

    return statusFlow[currentStatus] || null;
  }

  /**
   * Format address for display
   */
  static formatAddress(address: OrderResponse['shippingAddress']): string {
    return [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodDisplay(paymentMethod: string): string {
    const methodMap: Record<string, string> = {
      CREDIT_CARD: 'Credit Card',
      DEBIT_CARD: 'Debit Card',
      PAYPAL: 'PayPal',
    };

    return methodMap[paymentMethod] || paymentMethod;
  }

  /**
   * Generate order invoice data
   */
  static generateInvoiceData(order: OrderResponse) {
    const totals = this.calculateOrderTotals(order);
    
    return {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      items: order.items.map(item => ({
        title: item.book.title,
        author: item.book.author,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      shippingAddress: this.formatAddress(order.shippingAddress),
      billingAddress: order.billingAddress
        ? this.formatAddress(order.billingAddress)
        : this.formatAddress(order.shippingAddress),
      paymentMethod: this.getPaymentMethodDisplay(order.paymentMethod),
      totals,
    };
  }

  /**
   * Search orders by order number or book title
   */
  static filterOrders(
    orders: OrderResponse[],
    searchTerm: string
  ): OrderResponse[] {
    if (!searchTerm.trim()) {
      return orders;
    }

    const term = searchTerm.toLowerCase();
    
    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(term) ||
      order.items.some(item => 
        item.book.title.toLowerCase().includes(term) ||
        item.book.author.toLowerCase().includes(term)
      )
    );
  }
}

export default OrdersService;
