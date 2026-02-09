/**
 * Shopping Cart Store using Zustand
 * Manages shopping cart state across the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, BookSummary } from '@/types/api';
import { getCartService } from '@/lib/container';

interface CartState {
  // State
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCart: () => Promise<void>;
  addToCart: (bookId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getItemCount: () => number;
  getTotalAmount: () => number;
  isItemInCart: (bookId: string) => boolean;
  getItemQuantity: (bookId: string) => number;
  getCartItem: (bookId: string) => CartItem | undefined;
  isEmpty: () => boolean;
}

export const useCartStore = create<CartState>()(n  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,

      // Actions
      loadCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const cartService = getCartService();
          const cart = await cartService.getCart();
          
          set({
            cart,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to load cart',
          });
          throw error;
        }
      },

      addToCart: async (bookId: string, quantity = 1) => {
        set({ isLoading: true, error: null });
        
        try {
          const cartService = getCartService();
          const updatedCart = await cartService.addToCart(bookId, quantity);
          
          set({
            cart: updatedCart,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to add item to cart',
          });
          throw error;
        }
      },

      updateCartItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const cartService = getCartService();
          const updatedCart = await cartService.updateCartItem(itemId, quantity);
          
          set({
            cart: updatedCart,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to update cart item',
          });
          throw error;
        }
      },

      removeFromCart: async (itemId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const cartService = getCartService();
          const updatedCart = await cartService.removeFromCart(itemId);
          
          set({
            cart: updatedCart,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to remove item from cart',
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const cartService = getCartService();
          await cartService.clearCart();
          
          set({
            cart: {
              id: '',
              userId: '',
              items: [],
              totalAmount: 0,
              itemCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to clear cart',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Computed properties
      getItemCount: () => {
        const { cart } = get();
        return cart?.itemCount || 0;
      },

      getTotalAmount: () => {
        const { cart } = get();
        return cart?.totalAmount || 0;
      },

      isItemInCart: (bookId: string) => {
        const { cart } = get();
        return !!cart?.items.find(item => item.book.id === bookId);
      },

      getItemQuantity: (bookId: string) => {
        const { cart } = get();
        const item = cart?.items.find(item => item.book.id === bookId);
        return item?.quantity || 0;
      },

      getCartItem: (bookId: string) => {
        const { cart } = get();
        return cart?.items.find(item => item.book.id === bookId);
      },

      isEmpty: () => {
        const { cart } = get();
        return !cart || cart.items.length === 0;
      },
    }),
    {
      name: 'bookstore-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// Selectors for better performance
export const useCart = () => useCartStore((state) => ({
  cart: state.cart,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useCartActions = () => useCartStore((state) => ({
  loadCart: state.loadCart,
  addToCart: state.addToCart,
  updateCartItem: state.updateCartItem,
  removeFromCart: state.removeFromCart,
  clearCart: state.clearCart,
  clearError: state.clearError,
  setLoading: state.setLoading,
  setError: state.setError,
}));

export const useCartComputed = () => useCartStore((state) => ({
  getItemCount: state.getItemCount,
  getTotalAmount: state.getTotalAmount,
  isItemInCart: state.isItemInCart,
  getItemQuantity: state.getItemQuantity,
  getCartItem: state.getCartItem,
  isEmpty: state.isEmpty,
}));

// Convenience hooks
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());
export const useCartTotal = () => useCartStore((state) => state.getTotalAmount());
export const useIsCartEmpty = () => useCartStore((state) => state.isEmpty());
