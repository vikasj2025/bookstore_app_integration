import { apiClient } from './api-client';
import {
  CartResponse,
  CartItem,
  AddCartItemRequest,
  UpdateCartItemRequest,
  ApiResponse,
} from '@/types/api';

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  itemCount: number;
}

export class CartService {
  private readonly basePath = '/cart';
  private cartCache: CartResponse | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user's cart
   */
  async getCart(useCache: boolean = true): Promise<ApiResponse<CartResponse>> {
    // Check cache first
    if (useCache && this.cartCache && Date.now() < this.cacheExpiry) {
      return {
        data: this.cartCache,
        status: 200,
        statusText: 'OK',
        headers: {},
      };
    }

    const response = await apiClient.get<CartResponse>(this.basePath);
    
    // Update cache
    if (response.data) {
      this.cartCache = response.data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    }
    
    return response;
  }

  /**
   * Add item to cart
   */
  async addItem(request: AddCartItemRequest): Promise<ApiResponse<CartResponse>> {
    const response = await apiClient.post<CartResponse>(`${this.basePath}/items`, request);
    
    // Update cache
    if (response.data) {
      this.cartCache = response.data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    }
    
    return response;
  }

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, request: UpdateCartItemRequest): Promise<ApiResponse<CartResponse>> {
    const response = await apiClient.put<CartResponse>(`${this.basePath}/items/${itemId}`, request);
    
    // Update cache
    if (response.data) {
      this.cartCache = response.data;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    }
    
    return response;
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`${this.basePath}/items/${itemId}`);
    
    // Invalidate cache
    this.invalidateCache();
    
    return response;
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(this.basePath);
    
    // Clear cache
    this.cartCache = null;
    this.cacheExpiry = 0;
    
    return response;
  }

  /**
   * Get cart summary (total items and amount)
   */
  async getCartSummary(): Promise<CartSummary> {
    try {
      const response = await this.getCart();
      const cart = response.data;
      
      return {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        itemCount: cart.items.length,
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        totalItems: 0,
        totalAmount: 0,
        itemCount: 0,
      };
    }
  }

  /**
   * Check if item exists in cart
   */
  async isItemInCart(bookId: string): Promise<boolean> {
    try {
      const response = await this.getCart();
      return response.data.items.some(item => item.book.id === bookId);
    } catch (error) {
      console.error('Error checking if item is in cart:', error);
      return false;
    }
  }

  /**
   * Get cart item by book ID
   */
  async getCartItem(bookId: string): Promise<CartItem | null> {
    try {
      const response = await this.getCart();
      return response.data.items.find(item => item.book.id === bookId) || null;
    } catch (error) {
      console.error('Error getting cart item:', error);
      return null;
    }
  }

  /**
   * Get cart item quantity for a specific book
   */
  async getItemQuantity(bookId: string): Promise<number> {
    const item = await this.getCartItem(bookId);
    return item?.quantity || 0;
  }

  /**
   * Increment item quantity
   */
  async incrementItem(bookId: string): Promise<ApiResponse<CartResponse>> {
    const item = await this.getCartItem(bookId);
    
    if (item) {
      // Update existing item
      return this.updateItem(item.id, { quantity: item.quantity + 1 });
    } else {
      // Add new item
      return this.addItem({ bookId, quantity: 1 });
    }
  }

  /**
   * Decrement item quantity
   */
  async decrementItem(bookId: string): Promise<ApiResponse<CartResponse | void>> {
    const item = await this.getCartItem(bookId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }
    
    if (item.quantity > 1) {
      // Decrease quantity
      return this.updateItem(item.id, { quantity: item.quantity - 1 });
    } else {
      // Remove item if quantity would be 0
      return this.removeItem(item.id);
    }
  }

  /**
   * Set specific quantity for an item
   */
  async setItemQuantity(bookId: string, quantity: number): Promise<ApiResponse<CartResponse | void>> {
    if (quantity <= 0) {
      const item = await this.getCartItem(bookId);
      if (item) {
        return this.removeItem(item.id);
      }
      throw new Error('Item not found in cart');
    }
    
    const item = await this.getCartItem(bookId);
    
    if (item) {
      return this.updateItem(item.id, { quantity });
    } else {
      return this.addItem({ bookId, quantity });
    }
  }

  /**
   * Calculate cart totals
   */
  calculateTotals(items: CartItem[]): { subtotal: number; tax: number; shipping: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Calculate tax (8.5% for example)
    const taxRate = 0.085;
    const tax = subtotal * taxRate;
    
    // Calculate shipping (free over $50, otherwise $5.99)
    const shippingThreshold = 50;
    const shippingCost = 5.99;
    const shipping = subtotal >= shippingThreshold ? 0 : shippingCost;
    
    const total = subtotal + tax + shipping;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const response = await this.getCart(false); // Force fresh data
      const cart = response.data;
      
      if (!cart.items || cart.items.length === 0) {
        errors.push('Cart is empty');
        return { isValid: false, errors };
      }
      
      // Check stock availability for each item
      for (const item of cart.items) {
        if (item.quantity > item.book.stockQuantity) {
          errors.push(`${item.book.title} has insufficient stock (available: ${item.book.stockQuantity}, requested: ${item.quantity})`);
        }
        
        if (item.book.stockQuantity === 0) {
          errors.push(`${item.book.title} is out of stock`);
        }
      }
      
    } catch (error) {
      errors.push('Unable to validate cart. Please try again.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get cart items count for display
   */
  async getCartItemsCount(): Promise<number> {
    try {
      const summary = await this.getCartSummary();
      return summary.totalItems;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Sync cart with server (useful after network reconnection)
   */
  async syncCart(): Promise<ApiResponse<CartResponse>> {
    this.invalidateCache();
    return this.getCart(false);
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.cartCache = null;
    this.cacheExpiry = 0;
  }

  /**
   * Get cached cart data (if available)
   */
  getCachedCart(): CartResponse | null {
    if (this.cartCache && Date.now() < this.cacheExpiry) {
      return this.cartCache;
    }
    return null;
  }

  /**
   * Validate add to cart request
   */
  validateAddItemRequest(request: AddCartItemRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!request.bookId || request.bookId.trim().length === 0) {
      errors.push('Book ID is required');
    }
    
    if (!request.quantity || request.quantity < 1 || request.quantity > 99) {
      errors.push('Quantity must be between 1 and 99');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
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
}

// Create singleton instance
export const cartService = new CartService();
export default cartService;
