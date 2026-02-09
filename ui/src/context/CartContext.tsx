'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '@/types/api';
import apiClient from '@/services/api';
import { useAuth } from './AuthContext';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'CART_LOADING' }
  | { type: 'CART_SUCCESS'; payload: Cart }
  | { type: 'CART_ERROR'; payload: string }
  | { type: 'CART_CLEAR' }
  | { type: 'CLEAR_ERROR' };

interface CartContextType extends CartState {
  addToCart: (bookId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CART_SUCCESS':
      return {
        ...state,
        cart: action.payload,
        isLoading: false,
        error: null,
      };
    case 'CART_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CART_CLEAR':
      return {
        ...state,
        cart: null,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshCart();
    } else {
      dispatch({ type: 'CART_CLEAR' });
    }
  }, [isAuthenticated, user]);

  const refreshCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: 'CART_LOADING' });
      const cart = await apiClient.getCart();
      dispatch({ type: 'CART_SUCCESS', payload: cart });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error instanceof Error ? error.message : 'Failed to load cart' });
    }
  };

  const addToCart = async (bookId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart');
    }

    try {
      dispatch({ type: 'CART_LOADING' });
      const request: AddToCartRequest = { bookId, quantity };
      const updatedCart = await apiClient.addToCart(request);
      dispatch({ type: 'CART_SUCCESS', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item to cart' });
      throw error;
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update cart items');
    }

    try {
      dispatch({ type: 'CART_LOADING' });
      const request: UpdateCartItemRequest = { quantity };
      const updatedCart = await apiClient.updateCartItem(itemId, request);
      dispatch({ type: 'CART_SUCCESS', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error instanceof Error ? error.message : 'Failed to update cart item' });
      throw error;
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to remove items from cart');
    }

    try {
      dispatch({ type: 'CART_LOADING' });
      const updatedCart = await apiClient.removeFromCart(itemId);
      dispatch({ type: 'CART_SUCCESS', payload: updatedCart });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item from cart' });
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      throw new Error('Please login to clear cart');
    }

    try {
      dispatch({ type: 'CART_LOADING' });
      await apiClient.clearCart();
      dispatch({ type: 'CART_CLEAR' });
    } catch (error) {
      dispatch({ type: 'CART_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear cart' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const getTotalItems = (): number => {
    return state.cart?.totalItems || 0;
  };

  const getTotalAmount = (): number => {
    return state.cart?.totalAmount || 0;
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    clearError,
    getTotalItems,
    getTotalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
