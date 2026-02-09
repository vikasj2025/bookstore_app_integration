import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { CartItem, CartResponse, Book } from '@/types/api';
import { cartService } from '@/services/cart.service';
import { toast } from '@/utils/toast';

interface CartState {
  // State
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Actions
  loadCart: () => Promise<void>;
  addItem: (book: Book, quantity?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Computed
  getItemCount: () => number;
  getItemById: (itemId: string) => CartItem | undefined;
  getItemByBookId: (bookId: string) => CartItem | undefined;
  isItemInCart: (bookId: string) => boolean;
  
  // Local state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Shopping Cart Store with Zustand
 * Manages cart state with persistence and optimistic updates
 */
export const useCartStore = create<CartState>()()
  persist(
    immer((set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalAmount: 0,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Load cart from server
      loadCart: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const cartData = await cartService.getCart();
          
          set((state) => {
            state.items = cartData.items;
            state.totalItems = cartData.totalItems;
            state.totalAmount = cartData.totalAmount;
            state.lastUpdated = cartData.updatedAt;
            state.isLoading = false;
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load cart';
          
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          
          toast.error(errorMessage);
        }
      },

      // Add item to cart with optimistic update
      addItem: async (book: Book, quantity = 1) => {
        const existingItem = get().getItemByBookId(book.id);
        
        if (existingItem) {
          // If item already exists, update quantity
          await get().updateItemQuantity(existingItem.id, existingItem.quantity + quantity);
          return;
        }

        // Optimistic update
        const tempItem: CartItem = {
          id: `temp-${Date.now()}`,
          book,
          quantity,
          price: book.price,
          subtotal: book.price * quantity,
          addedAt: new Date().toISOString(),
        };

        set((state) => {
          state.items.push(tempItem);
          state.totalItems += quantity;
          state.totalAmount += tempItem.subtotal;
          state.isLoading = true;
        });

        try {
          const addedItem = await cartService.addToCart({
            bookId: book.id,
            quantity,
          });

          set((state) => {
            // Replace temp item with real item
            const tempIndex = state.items.findIndex(item => item.id === tempItem.id);
            if (tempIndex !== -1) {
              state.items[tempIndex] = addedItem;
            }
            state.isLoading = false;
          });

          toast.success(`${book.title} added to cart`);
        } catch (error) {
          // Revert optimistic update
          set((state) => {
            state.items = state.items.filter(item => item.id !== tempItem.id);
            state.totalItems -= quantity;
            state.totalAmount -= tempItem.subtotal;
            state.isLoading = false;
          });

          const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
          toast.error(errorMessage);
        }
      },

      // Update item quantity with optimistic update
      updateItemQuantity: async (itemId: string, quantity: number) => {
        const item = get().getItemById(itemId);
        if (!item) return;

        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        // Store original values for rollback
        const originalQuantity = item.quantity;
        const originalSubtotal = item.subtotal;
        const quantityDiff = quantity - originalQuantity;
        const subtotalDiff = (item.price * quantity) - originalSubtotal;

        // Optimistic update
        set((state) => {
          const itemIndex = state.items.findIndex(i => i.id === itemId);
          if (itemIndex !== -1) {
            state.items[itemIndex].quantity = quantity;
            state.items[itemIndex].subtotal = item.price * quantity;
            state.totalItems += quantityDiff;
            state.totalAmount += subtotalDiff;
          }
          state.isLoading = true;
        });

        try {
          const updatedItem = await cartService.updateCartItem(itemId, { quantity });

          set((state) => {
            const itemIndex = state.items.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
              state.items[itemIndex] = updatedItem;
            }
            state.isLoading = false;
          });
        } catch (error) {
          // Revert optimistic update
          set((state) => {
            const itemIndex = state.items.findIndex(i => i.id === itemId);
            if (itemIndex !== -1) {
              state.items[itemIndex].quantity = originalQuantity;
              state.items[itemIndex].subtotal = originalSubtotal;
              state.totalItems -= quantityDiff;
              state.totalAmount -= subtotalDiff;
            }
            state.isLoading = false;
          });

          const errorMessage = error instanceof Error ? error.message : 'Failed to update item quantity';
          toast.error(errorMessage);
        }
      },

      // Remove item from cart with optimistic update
      removeItem: async (itemId: string) => {
        const item = get().getItemById(itemId);
        if (!item) return;

        // Store for rollback
        const removedItem = { ...item };
        const itemIndex = get().items.findIndex(i => i.id === itemId);

        // Optimistic update
        set((state) => {
          state.items = state.items.filter(i => i.id !== itemId);
          state.totalItems -= removedItem.quantity;
          state.totalAmount -= removedItem.subtotal;
          state.isLoading = true;
        });

        try {
          await cartService.removeFromCart(itemId);
          
          set((state) => {
            state.isLoading = false;
          });

          toast.success(`${removedItem.book.title} removed from cart`);
        } catch (error) {
          // Revert optimistic update
          set((state) => {
            state.items.splice(itemIndex, 0, removedItem);
            state.totalItems += removedItem.quantity;
            state.totalAmount += removedItem.subtotal;
            state.isLoading = false;
          });

          const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
          toast.error(errorMessage);
        }
      },

      // Clear entire cart
      clearCart: async () => {
        const originalItems = [...get().items];
        const originalTotalItems = get().totalItems;
        const originalTotalAmount = get().totalAmount;

        // Optimistic update
        set((state) => {
          state.items = [];
          state.totalItems = 0;
          state.totalAmount = 0;
          state.isLoading = true;
        });

        try {
          await cartService.clearCart();
          
          set((state) => {
            state.isLoading = false;
          });

          toast.success('Cart cleared');
        } catch (error) {
          // Revert optimistic update
          set((state) => {
            state.items = originalItems;
            state.totalItems = originalTotalItems;
            state.totalAmount = originalTotalAmount;
            state.isLoading = false;
          });

          const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
          toast.error(errorMessage);
        }
      },

      // Refresh cart from server
      refreshCart: async () => {
        await get().loadCart();
      },

      // Computed getters
      getItemCount: () => {
        return get().totalItems;
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },

      getItemByBookId: (bookId: string) => {
        return get().items.find(item => item.book.id === bookId);
      },

      isItemInCart: (bookId: string) => {
        return get().items.some(item => item.book.id === bookId);
      },

      // Local state management
      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential cart data
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
        lastUpdated: state.lastUpdated,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration if cart structure changes
        if (version === 0) {
          // Migration logic for version 0 to 1
          return {
            ...persistedState,
            lastUpdated: null,
          };
        }
        return persistedState;
      },
    }
  );

// Selectors for performance optimization
export const useCartItems = () => useCartStore(state => state.items);
export const useCartTotal = () => useCartStore(state => ({
  totalItems: state.totalItems,
  totalAmount: state.totalAmount,
}));
export const useCartLoading = () => useCartStore(state => state.isLoading);
export const useCartError = () => useCartStore(state => state.error);

// Actions
export const useCartActions = () => useCartStore(state => ({
  loadCart: state.loadCart,
  addItem: state.addItem,
  updateItemQuantity: state.updateItemQuantity,
  removeItem: state.removeItem,
  clearCart: state.clearCart,
  refreshCart: state.refreshCart,
}));

// Computed selectors
export const useCartComputed = () => useCartStore(state => ({
  getItemCount: state.getItemCount,
  getItemById: state.getItemById,
  getItemByBookId: state.getItemByBookId,
  isItemInCart: state.isItemInCart,
}));
