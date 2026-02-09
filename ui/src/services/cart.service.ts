import { httpClient } from '@/lib/http-client';
import {
  CartResponse,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@/types/api';

/**
 * Cart Service
 * Handles shopping cart operations
 */
export class CartService {
  private readonly basePath = '/cart';

  /**
   * Get current user's shopping cart
   */
  async getCart(): Promise<CartResponse> {
    try {
      const response = await httpClient.get<CartResponse>(this.basePath);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to load cart');
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(request: AddToCartRequest): Promise<CartItem> {
    try {
      const response = await httpClient.post<CartItem>(
        `${this.basePath}/items`,
        request
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to add item to cart');
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    itemId: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    try {
      const response = await httpClient.put<CartItem>(
        `${this.basePath}/items/${itemId}`,
        request
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update cart item');
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<void> {
    try {
      await httpClient.delete(`${this.basePath}/items/${itemId}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to remove item from cart');
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      await httpClient.delete(this.basePath);
    } catch (error) {
      throw this.handleError(error, 'Failed to clear cart');
    }
  }

  /**
   * Calculate cart totals (client-side utility)
   */
  calculateTotals(items: CartItem[]): { totalItems: number; totalAmount: number } {
    return items.reduce(
      (totals, item) => ({
        totalItems: totals.totalItems + item.quantity,
        totalAmount: totals.totalAmount + item.subtotal,
      }),
      { totalItems: 0, totalAmount: 0 }
    );
  }

  /**
   * Validate cart item quantity
   */
  validateQuantity(quantity: number): { isValid: boolean; error?: string } {
    if (quantity < 1) {
      return { isValid: false, error: 'Quantity must be at least 1' };
    }
    
    if (quantity > 10) {
      return { isValid: false, error: 'Maximum quantity is 10 per item' };
    }
    
    if (!Number.isInteger(quantity)) {
      return { isValid: false, error: 'Quantity must be a whole number' };
    }
    
    return { isValid: true };
  }

  /**
   * Check if item can be added to cart
   */
  canAddToCart(
    bookStockQuantity: number,
    requestedQuantity: number,
    currentCartQuantity = 0
  ): { canAdd: boolean; error?: string; maxQuantity?: number } {
    const totalQuantity = currentCartQuantity + requestedQuantity;
    
    if (bookStockQuantity === 0) {
      return { canAdd: false, error: 'This item is out of stock' };
    }
    
    if (totalQuantity > bookStockQuantity) {
      return {
        canAdd: false,
        error: `Only ${bookStockQuantity} items available in stock`,
        maxQuantity: bookStockQuantity - currentCartQuantity,
      };
    }
    
    if (totalQuantity > 10) {
      return {
        canAdd: false,
        error: 'Maximum 10 items per product',
        maxQuantity: 10 - currentCartQuantity,
      };
    }
    
    return { canAdd: true };
  }

  /**
   * Format cart item for display
   */
  formatCartItem(item: CartItem) {
    return {
      ...item,
      formattedPrice: this.formatPrice(item.price),
      formattedSubtotal: this.formatPrice(item.subtotal),
      formattedAddedAt: this.formatDate(item.addedAt),
    };
  }

  /**
   * Format cart summary for display
   */
  formatCartSummary(cart: CartResponse) {
    return {
      ...cart,
      formattedTotalAmount: this.formatPrice(cart.totalAmount),
      formattedUpdatedAt: this.formatDate(cart.updatedAt),
      isEmpty: cart.items.length === 0,
    };
  }

  /**
   * Get cart item by book ID
   */
  findItemByBookId(cart: CartResponse, bookId: string): CartItem | undefined {
    return cart.items.find(item => item.book.id === bookId);
  }

  /**
   * Check if book is in cart
   */
  isBookInCart(cart: CartResponse, bookId: string): boolean {
    return cart.items.some(item => item.book.id === bookId);
  }

  /**
   * Get quantity of specific book in cart
   */
  getBookQuantityInCart(cart: CartResponse, bookId: string): number {
    const item = this.findItemByBookId(cart, bookId);
    return item ? item.quantity : 0;
  }

  /**
   * Calculate estimated shipping cost (placeholder implementation)
   */
  calculateShipping(totalAmount: number): number {
    // Free shipping over $50
    if (totalAmount >= 50) return 0;
    
    // Flat rate shipping
    return 5.99;
  }

  /**
   * Calculate estimated tax (placeholder implementation)
   */
  calculateTax(subtotal: number, taxRate = 0.08): number {
    return subtotal * taxRate;
  }

  /**
   * Calculate order total with shipping and tax
   */
  calculateOrderTotal(
    subtotal: number,
    shippingCost?: number,
    taxRate = 0.08
  ): {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  } {
    const shipping = shippingCost ?? this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal, taxRate);
    const total = subtotal + shipping + tax;
    
    return {
      subtotal,
      shipping,
      tax,
      total,
    };
  }

  /**
   * Handle service errors with user-friendly messages
   */
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 404) {
      return new Error('Cart item not found');
    }
    
    if (error.response?.status === 409) {
      return new Error('Item already in cart');
    }
    
    if (error.response?.status === 400) {
      return new Error('Invalid cart operation');
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
        month: 'short',
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
export const cartService = new CartService();
export default cartService;
