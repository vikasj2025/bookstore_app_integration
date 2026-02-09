import { api } from '@/lib/api-client';
import {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@/types';

export class CartService {
  /**
   * Get user's current cart
   */
  static async getCart(): Promise<CartResponse> {
    const response = await api.get<CartResponse>('/cart');
    return response.data;
  }

  /**
   * Add item to cart
   */
  static async addToCart(data: AddToCartRequest): Promise<CartResponse> {
    const response = await api.post<CartResponse>('/cart/items', data);
    return response.data;
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<CartResponse> {
    const response = await api.put<CartResponse>(`/cart/items/${itemId}`, data);
    return response.data;
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(itemId: string): Promise<void> {
    await api.delete(`/cart/items/${itemId}`);
  }

  /**
   * Clear entire cart
   */
  static async clearCart(): Promise<void> {
    await api.delete('/cart');
  }

  /**
   * Calculate cart totals
   */
  static calculateTotals(cart: CartResponse): {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  } {
    const subtotal = cart.totalAmount;
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
   * Check if cart qualifies for free shipping
   */
  static qualifiesForFreeShipping(cart: CartResponse): boolean {
    return cart.totalAmount >= 50;
  }

  /**
   * Get amount needed for free shipping
   */
  static getAmountForFreeShipping(cart: CartResponse): number {
    const threshold = 50;
    return Math.max(0, threshold - cart.totalAmount);
  }

  /**
   * Validate cart item quantity
   */
  static validateQuantity(quantity: number): {
    isValid: boolean;
    error?: string;
  } {
    if (quantity < 1) {
      return {
        isValid: false,
        error: 'Quantity must be at least 1',
      };
    }

    if (quantity > 10) {
      return {
        isValid: false,
        error: 'Maximum quantity is 10',
      };
    }

    return { isValid: true };
  }

  /**
   * Check if item is already in cart
   */
  static isItemInCart(cart: CartResponse, bookId: string): boolean {
    return cart.items.some(item => item.book.id === bookId);
  }

  /**
   * Get cart item by book ID
   */
  static getCartItemByBookId(cart: CartResponse, bookId: string) {
    return cart.items.find(item => item.book.id === bookId);
  }

  /**
   * Format cart summary for display
   */
  static formatCartSummary(cart: CartResponse): string {
    if (cart.totalItems === 0) {
      return 'Your cart is empty';
    }

    if (cart.totalItems === 1) {
      return '1 item in cart';
    }

    return `${cart.totalItems} items in cart`;
  }

  /**
   * Get cart storage key for local persistence
   */
  static getStorageKey(userId?: string): string {
    return userId ? `cart_${userId}` : 'cart_guest';
  }

  /**
   * Save cart to local storage (for offline support)
   */
  static saveToLocalStorage(cart: CartResponse, userId?: string): void {
    try {
      const key = this.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (error) {
      console.warn('Failed to save cart to local storage:', error);
    }
  }

  /**
   * Load cart from local storage
   */
  static loadFromLocalStorage(userId?: string): CartResponse | null {
    try {
      const key = this.getStorageKey(userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load cart from local storage:', error);
      return null;
    }
  }

  /**
   * Clear cart from local storage
   */
  static clearFromLocalStorage(userId?: string): void {
    try {
      const key = this.getStorageKey(userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear cart from local storage:', error);
    }
  }

  /**
   * Merge local cart with server cart (after login)
   */
  static async mergeLocalCart(localCart: CartResponse): Promise<CartResponse> {
    let mergedCart = await this.getCart();

    for (const localItem of localCart.items) {
      const existingItem = this.getCartItemByBookId(mergedCart, localItem.book.id);
      
      if (existingItem) {
        // Update quantity if item exists
        const newQuantity = Math.min(10, existingItem.quantity + localItem.quantity);
        mergedCart = await this.updateCartItem(existingItem.id, {
          quantity: newQuantity,
        });
      } else {
        // Add new item
        mergedCart = await this.addToCart({
          bookId: localItem.book.id,
          quantity: localItem.quantity,
        });
      }
    }

    return mergedCart;
  }
}

export default CartService;
