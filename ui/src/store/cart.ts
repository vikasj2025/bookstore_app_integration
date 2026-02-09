import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState, Cart, CartItem } from '@/types';
import { CartService } from '@/services/cart.service';
import { useAuth } from './auth';

interface CartStore extends CartState {
  // Actions
  setCart: (cart: Cart | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCart: () => Promise<void>;
  addToCart: (bookId: string, quantity: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
  // Optimistic updates
  optimisticAddToCart: (item: CartItem) => void;
  optimisticUpdateQuantity: (itemId: string, quantity: number) => void;
  optimisticRemoveItem: (itemId: string) => void;
  // Local cart management
  syncWithServer: () => Promise<void>;
}

export const cartStore = create<CartStore>()(n  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,

      // Actions
      setCart: (cart) => {
        set({ cart });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          const cart = await CartService.getCart();
          set({ cart });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart';
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: async (bookId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          
          const cart = await CartService.addToCart({ bookId, quantity });
          set({ cart });
          
          // Save to local storage for offline support
          const { user } = useAuth.getState();
          CartService.saveToLocalStorage(cart, user?.id);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartItem: async (itemId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          
          const cart = await CartService.updateCartItem(itemId, { quantity });
          set({ cart });
          
          // Save to local storage
          const { user } = useAuth.getState();
          CartService.saveToLocalStorage(cart, user?.id);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update cart item';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeCartItem: async (itemId) => {
        try {
          set({ isLoading: true, error: null });
          
          await CartService.removeCartItem(itemId);
          
          // Update local state
          const { cart } = get();
          if (cart) {
            const updatedItems = cart.items.filter(item => item.id !== itemId);
            const updatedCart = {
              ...cart,
              items: updatedItems,
              totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
              totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
            };
            set({ cart: updatedCart });
            
            // Save to local storage
            const { user } = useAuth.getState();
            CartService.saveToLocalStorage(updatedCart, user?.id);
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          
          await CartService.clearCart();
          set({ cart: null });
          
          // Clear local storage
          const { user } = useAuth.getState();
          CartService.clearFromLocalStorage(user?.id);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Optimistic updates for better UX
      optimisticAddToCart: (newItem) => {
        const { cart } = get();
        if (!cart) return;

        const existingItemIndex = cart.items.findIndex(item => item.book.id === newItem.book.id);
        
        let updatedItems;
        if (existingItemIndex >= 0) {
          // Update existing item
          updatedItems = [...cart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
            totalPrice: updatedItems[existingItemIndex].unitPrice * 
              (updatedItems[existingItemIndex].quantity + newItem.quantity),
          };
        } else {
          // Add new item
          updatedItems = [...cart.items, newItem];
        }

        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        };

        set({ cart: updatedCart });
      },

      optimisticUpdateQuantity: (itemId, quantity) => {
        const { cart } = get();
        if (!cart) return;

        const updatedItems = cart.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity,
            };
          }
          return item;
        });

        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        };

        set({ cart: updatedCart });
      },

      optimisticRemoveItem: (itemId) => {
        const { cart } = get();
        if (!cart) return;

        const updatedItems = cart.items.filter(item => item.id !== itemId);
        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
        };

        set({ cart: updatedCart });
      },

      syncWithServer: async () => {
        try {
          const { user } = useAuth.getState();
          
          if (!user) {
            // User not authenticated, keep local cart
            return;
          }

          // Load local cart
          const localCart = CartService.loadFromLocalStorage(user.id);
          
          if (localCart && localCart.items.length > 0) {
            // Merge local cart with server cart
            const mergedCart = await CartService.mergeLocalCart(localCart);
            set({ cart: mergedCart });
            
            // Clear local storage after successful merge
            CartService.clearFromLocalStorage(user.id);
          } else {
            // No local cart, fetch from server
            await get().fetchCart();
          }
          
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
          // Fallback to fetching cart
          await get().fetchCart();
        }
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist cart data for offline support
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// Helper hooks
export const useCart = () => {
  const store = cartStore();
  return {
    cart: store.cart,
    isLoading: store.isLoading,
    error: store.error,
    addToCart: store.addToCart,
    updateCartItem: store.updateCartItem,
    removeCartItem: store.removeCartItem,
    clearCart: store.clearCart,
    clearError: store.clearError,
  };
};

export const useCartActions = () => {
  const store = cartStore();
  return {
    fetchCart: store.fetchCart,
    addToCart: store.addToCart,
    updateCartItem: store.updateCartItem,
    removeCartItem: store.removeCartItem,
    clearCart: store.clearCart,
    syncWithServer: store.syncWithServer,
  };
};

export const useCartItems = () => {
  return cartStore((state) => state.cart?.items || []);
};

export const useCartTotal = () => {
  return cartStore((state) => state.cart?.totalAmount || 0);
};

export const useCartItemCount = () => {
  return cartStore((state) => state.cart?.totalItems || 0);
};

export default cartStore;
