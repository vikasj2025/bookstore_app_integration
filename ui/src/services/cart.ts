/**
 * Cart Service for the Online Bookstore Application
 * Handles shopping cart operations with local storage persistence
 */

import {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  BookSummary,
} from '@/types/api';
import { ApiClient } from '@/services/api/client';
import { StorageService } from '@/services/storage';
import { LoggerService } from '@/services/logger';
import { appConfig, apiEndpoints } from '@/config/app';

export class CartService {
  private apiClient: ApiClient;
  private storage: StorageService;
  private logger: LoggerService;
  private currentCart: Cart | null = null;
  private cartListeners: Array<(cart: Cart | null) => void> = [];
  private isOnline: boolean = true;

  constructor(
    apiClient: ApiClient,
    storage: StorageService,
    logger: LoggerService
  ) {
    this.apiClient = apiClient;
    this.storage = storage;
    this.logger = logger.createChild('CartService');
    this.initializeCart();
    this.setupNetworkListener();
  }

  /**
   * Initialize cart state from storage or server
   */
  private async initializeCart(): Promise<void> {
    try {
      // Try to load cart from server if authenticated
      if (this.apiClient.isAuthenticated()) {
        await this.syncWithServer();
      } else {
        // Load from local storage for guest users
        this.loadFromLocalStorage();
      }
    } catch (error) {
      this.logger.warn('Failed to initialize cart from server, using local storage:', error);
      this.loadFromLocalStorage();
    }
  }

  /**
   * Load cart from local storage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedCart = this.storage.getLocalJSON<Cart>(appConfig.cart.storageKey);
      if (storedCart) {
        this.currentCart = storedCart;
        this.notifyCartChange();
        this.logger.debug('Cart loaded from local storage');
      } else {
        this.createEmptyCart();
      }
    } catch (error) {
      this.logger.error('Failed to load cart from storage:', error);
      this.createEmptyCart();
    }
  }

  /**
   * Create empty cart
   */
  private createEmptyCart(): void {
    this.currentCart = {
      id: this.generateCartId(),
      userId: '',
      items: [],
      totalAmount: 0,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    this.notifyCartChange();
  }

  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    try {
      if (this.apiClient.isAuthenticated() && this.isOnline) {
        const serverCart = await this.apiClient.get<Cart>(apiEndpoints.cart.get);
        this.currentCart = serverCart;
        this.saveToLocalStorage();
        this.notifyCartChange();
        return serverCart;
      }
    } catch (error) {
      this.logger.warn('Failed to fetch cart from server, using local cart:', error);
    }

    return this.currentCart || this.createEmptyCartSync();
  }

  /**
   * Add item to cart
   */
  async addToCart(bookId: string, quantity: number = 1): Promise<Cart> {
    try {
      this.logger.debug('Adding item to cart:', { bookId, quantity });

      const request: AddToCartRequest = { bookId, quantity };

      if (this.apiClient.isAuthenticated() && this.isOnline) {
        // Add to server cart
        const updatedCart = await this.apiClient.post<Cart>(
          apiEndpoints.cart.add,
          request
        );
        this.currentCart = updatedCart;
      } else {
        // Add to local cart
        await this.addToLocalCart(bookId, quantity);
      }

      this.saveToLocalStorage();
      this.notifyCartChange();
      this.logger.info('Item added to cart successfully');
      
      return this.currentCart!;
    } catch (error) {
      this.logger.error('Failed to add item to cart:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    try {
      this.logger.debug('Updating cart item:', { itemId, quantity });

      if (quantity <= 0) {
        return await this.removeFromCart(itemId);
      }

      const request: UpdateCartItemRequest = { quantity };

      if (this.apiClient.isAuthenticated() && this.isOnline) {
        // Update on server
        const updatedCart = await this.apiClient.put<Cart>(
          apiEndpoints.cart.update(itemId),
          request
        );
        this.currentCart = updatedCart;
      } else {
        // Update local cart
        this.updateLocalCartItem(itemId, quantity);
      }

      this.saveToLocalStorage();
      this.notifyCartChange();
      this.logger.info('Cart item updated successfully');
      
      return this.currentCart!;
    } catch (error) {
      this.logger.error('Failed to update cart item:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<Cart> {
    try {
      this.logger.debug('Removing item from cart:', itemId);

      if (this.apiClient.isAuthenticated() && this.isOnline) {
        // Remove from server
        const updatedCart = await this.apiClient.delete<Cart>(
          apiEndpoints.cart.remove(itemId)
        );
        this.currentCart = updatedCart;
      } else {
        // Remove from local cart
        this.removeFromLocalCart(itemId);
      }

      this.saveToLocalStorage();
      this.notifyCartChange();
      this.logger.info('Item removed from cart successfully');
      
      return this.currentCart!;
    } catch (error) {
      this.logger.error('Failed to remove item from cart:', error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      this.logger.debug('Clearing cart');

      if (this.apiClient.isAuthenticated() && this.isOnline) {
        // Clear server cart
        await this.apiClient.delete(apiEndpoints.cart.clear);
      }

      // Clear local cart
      this.createEmptyCart();
      this.logger.info('Cart cleared successfully');
    } catch (error) {
      this.logger.error('Failed to clear cart:', error);
      throw error;
    }
  }

  /**
   * Get cart item count
   */
  getItemCount(): number {
    return this.currentCart?.itemCount || 0;
  }

  /**
   * Get cart total amount
   */
  getTotalAmount(): number {
    return this.currentCart?.totalAmount || 0;
  }

  /**
   * Check if item is in cart
   */
  isItemInCart(bookId: string): boolean {
    return !!this.currentCart?.items.find(item => item.book.id === bookId);
  }

  /**
   * Get item quantity in cart
   */
  getItemQuantity(bookId: string): number {
    const item = this.currentCart?.items.find(item => item.book.id === bookId);
    return item?.quantity || 0;
  }

  /**
   * Subscribe to cart changes
   */
  onCartChange(callback: (cart: Cart | null) => void): () => void {
    this.cartListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.cartListeners.indexOf(callback);
      if (index > -1) {
        this.cartListeners.splice(index, 1);
      }
    };
  }

  /**
   * Sync local cart with server
   */
  async syncWithServer(): Promise<void> {
    if (!this.apiClient.isAuthenticated() || !this.isOnline) {
      return;
    }

    try {
      this.logger.debug('Syncing cart with server');
      
      const serverCart = await this.apiClient.get<Cart>(apiEndpoints.cart.get);
      const localCart = this.currentCart;

      if (localCart && localCart.items.length > 0 && serverCart.items.length === 0) {
        // Merge local cart items to server
        for (const item of localCart.items) {
          await this.apiClient.post<Cart>(apiEndpoints.cart.add, {
            bookId: item.book.id,
            quantity: item.quantity,
          });
        }
        
        // Get updated server cart
        const mergedCart = await this.apiClient.get<Cart>(apiEndpoints.cart.get);
        this.currentCart = mergedCart;
      } else {
        this.currentCart = serverCart;
      }

      this.saveToLocalStorage();
      this.notifyCartChange();
      this.logger.info('Cart synced with server successfully');
    } catch (error) {
      this.logger.error('Failed to sync cart with server:', error);
    }
  }

  /**
   * Add item to local cart
   */
  private async addToLocalCart(bookId: string, quantity: number): Promise<void> {
    if (!this.currentCart) {
      this.createEmptyCart();
    }

    // Find existing item
    const existingItemIndex = this.currentCart!.items.findIndex(
      item => item.book.id === bookId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = this.currentCart!.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > appConfig.cart.maxItems) {
        throw new Error(`Maximum quantity of ${appConfig.cart.maxItems} exceeded`);
      }

      existingItem.quantity = newQuantity;
      existingItem.totalPrice = existingItem.unitPrice * newQuantity;
    } else {
      // Add new item (we need book details for this)
      // In a real implementation, you might fetch book details here
      const newItem: CartItem = {
        id: this.generateItemId(),
        book: await this.getBookSummary(bookId),
        quantity,
        unitPrice: 0, // Will be set when book details are fetched
        totalPrice: 0,
        addedAt: new Date().toISOString(),
      };
      
      newItem.totalPrice = newItem.unitPrice * quantity;
      this.currentCart!.items.push(newItem);
    }

    this.recalculateCartTotals();
  }

  /**
   * Update local cart item
   */
  private updateLocalCartItem(itemId: string, quantity: number): void {
    if (!this.currentCart) return;

    const itemIndex = this.currentCart.items.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const item = this.currentCart.items[itemIndex];
      item.quantity = quantity;
      item.totalPrice = item.unitPrice * quantity;
      this.recalculateCartTotals();
    }
  }

  /**
   * Remove item from local cart
   */
  private removeFromLocalCart(itemId: string): void {
    if (!this.currentCart) return;

    this.currentCart.items = this.currentCart.items.filter(item => item.id !== itemId);
    this.recalculateCartTotals();
  }

  /**
   * Recalculate cart totals
   */
  private recalculateCartTotals(): void {
    if (!this.currentCart) return;

    this.currentCart.itemCount = this.currentCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    
    this.currentCart.totalAmount = this.currentCart.items.reduce(
      (total, item) => total + item.totalPrice,
      0
    );
    
    this.currentCart.updatedAt = new Date().toISOString();
  }

  /**
   * Save cart to local storage
   */
  private saveToLocalStorage(): void {
    if (this.currentCart) {
      this.storage.setLocalJSON(appConfig.cart.storageKey, this.currentCart);
    }
  }

  /**
   * Notify cart change listeners
   */
  private notifyCartChange(): void {
    this.cartListeners.forEach(callback => {
      try {
        callback(this.currentCart);
      } catch (error) {
        this.logger.error('Error in cart change listener:', error);
      }
    });
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncWithServer();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  /**
   * Generate unique cart ID
   */
  private generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique item ID
   */
  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create empty cart synchronously
   */
  private createEmptyCartSync(): Cart {
    const cart: Cart = {
      id: this.generateCartId(),
      userId: '',
      items: [],
      totalAmount: 0,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.currentCart = cart;
    this.saveToLocalStorage();
    return cart;
  }

  /**
   * Get book summary (placeholder - in real app, this would fetch from book service)
   */
  private async getBookSummary(bookId: string): Promise<BookSummary> {
    // This is a placeholder implementation
    // In a real app, you would inject the BookService or make an API call
    return {
      id: bookId,
      title: 'Unknown Book',
      author: 'Unknown Author',
      price: 0,
      category: 'Unknown',
      rating: 0,
      inStock: true,
      stockQuantity: 0,
    };
  }
}
