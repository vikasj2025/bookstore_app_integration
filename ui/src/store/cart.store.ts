import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartResponse, CartItem, Book } from '@/types/api';
import { cartService } from '@/services/cart.service';

interface CartStore {
  // State
  cart: CartResponse | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  lastUpdated: number;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (bookId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  incrementItem: (bookId: string) => Promise<void>;
  decrementItem: (bookId: string) => Promise<void>;
  setItemQuantity: (bookId: string, quantity: number) => Promise<void>;
  
  // UI Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Utility Actions
  syncCart: () => Promise<void>;
  validateCart: () => Promise<{ isValid: boolean; errors: string[] }>;
  getItemQuantity: (bookId: string) => number;
  isItemInCart: (bookId: string) => boolean;
  getCartSummary: () => {
    totalItems: number;
    totalAmount: number;
    itemCount: number;
  };
  clearError: () => void;
}

export const useCartStore = create<CartStore>()()
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,
      isOpen: false,
      lastUpdated: 0,

      // Actions
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await cartService.getCart();
          set({
            cart: response.data,
            isLoading: false,
            lastUpdated: Date.now(),
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to fetch cart',
          });
        }
      },

      addItem: async (bookId: string, quantity = 1) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await cartService.addItem({ bookId, quantity });
          set({
            cart: response.data,
            isLoading: false,
            lastUpdated: Date.now(),
          });
          
          // Optionally open cart drawer after adding item
          // get().openCart();
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to add item to cart',
          });
          throw error;
        }
      },

      updateItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await cartService.updateItem(itemId, { quantity });
          set({
            cart: response.data,
            isLoading: false,
            lastUpdated: Date.now(),
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to update item',
          });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await cartService.removeItem(itemId);
          
          // Update cart by removing the item locally and then syncing
          const currentCart = get().cart;
          if (currentCart) {
            const updatedItems = currentCart.items.filter(item => item.id !== itemId);
            const updatedCart = {
              ...currentCart,
              items: updatedItems,
              totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
              totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
            };
            
            set({
              cart: updatedCart,
              isLoading: false,
              lastUpdated: Date.now(),
            });
          }
          
          // Sync with server to get accurate data
          get().syncCart();
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to remove item',
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        
        try {
          await cartService.clearCart();
          set({
            cart: null,
            isLoading: false,
            lastUpdated: Date.now(),
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to clear cart',
          });
          throw error;
        }
      },

      incrementItem: async (bookId: string) => {
        const currentCart = get().cart;
        const item = currentCart?.items.find(item => item.book.id === bookId);
        
        if (item) {
          await get().updateItem(item.id, item.quantity + 1);
        } else {
          await get().addItem(bookId, 1);
        }
      },

      decrementItem: async (bookId: string) => {
        const currentCart = get().cart;
        const item = currentCart?.items.find(item => item.book.id === bookId);
        
        if (item) {
          if (item.quantity > 1) {
            await get().updateItem(item.id, item.quantity - 1);
          } else {
            await get().removeItem(item.id);
          }
        }
      },

      setItemQuantity: async (bookId: string, quantity: number) => {
        const currentCart = get().cart;
        const item = currentCart?.items.find(item => item.book.id === bookId);
        
        if (quantity <= 0) {
          if (item) {
            await get().removeItem(item.id);
          }
          return;
        }
        
        if (item) {
          await get().updateItem(item.id, quantity);
        } else {
          await get().addItem(bookId, quantity);
        }
      },

      // UI Actions
      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      // Utility Actions
      syncCart: async () => {
        try {
          const response = await cartService.syncCart();
          set({
            cart: response.data,
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },

      validateCart: async () => {
        try {
          return await cartService.validateCart();
        } catch (error) {
          return {
            isValid: false,
            errors: ['Unable to validate cart'],
          };
        }
      },

      getItemQuantity: (bookId: string) => {
        const currentCart = get().cart;
        const item = currentCart?.items.find(item => item.book.id === bookId);
        return item?.quantity || 0;
      },

      isItemInCart: (bookId: string) => {
        const currentCart = get().cart;
        return currentCart?.items.some(item => item.book.id === bookId) || false;
      },

      getCartSummary: () => {
        const currentCart = get().cart;
        
        if (!currentCart) {
          return {
            totalItems: 0,
            totalAmount: 0,
            itemCount: 0,
          };
        }
        
        return {
          totalItems: currentCart.totalItems,
          totalAmount: currentCart.totalAmount,
          itemCount: currentCart.items.length,
        };
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Auto-sync cart when the app loads
if (typeof window !== 'undefined') {
  // Sync cart on page load
  const store = useCartStore.getState();
  if (store.cart) {
    store.syncCart();
  }
  
  // Sync cart periodically (every 5 minutes)
  setInterval(() => {
    const currentStore = useCartStore.getState();
    if (currentStore.cart) {
      currentStore.syncCart();
    }
  }, 5 * 60 * 1000);
  
  // Sync cart when the page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const currentStore = useCartStore.getState();
      if (currentStore.cart) {
        currentStore.syncCart();
      }
    }
  });
}

// Selectors for common use cases
export const useCart = () => {
  const store = useCartStore();
  return {
    cart: store.cart,
    isLoading: store.isLoading,
    error: store.error,
    summary: store.getCartSummary(),
  };
};

export const useCartActions = () => {
  const store = useCartStore();
  return {
    addItem: store.addItem,
    updateItem: store.updateItem,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    incrementItem: store.incrementItem,
    decrementItem: store.decrementItem,
    setItemQuantity: store.setItemQuantity,
    fetchCart: store.fetchCart,
    syncCart: store.syncCart,
    validateCart: store.validateCart,
  };
};

export const useCartUI = () => {
  const store = useCartStore();
  return {
    isOpen: store.isOpen,
    openCart: store.openCart,
    closeCart: store.closeCart,
    toggleCart: store.toggleCart,
  };
};

export const useCartUtils = () => {
  const store = useCartStore();
  return {
    getItemQuantity: store.getItemQuantity,
    isItemInCart: store.isItemInCart,
    getCartSummary: store.getCartSummary,
    clearError: store.clearError,
  };
};

export default useCartStore;
