'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const CartPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoading,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalAmount,
  } = useCart();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityUpdate = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Card className="p-8 text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Please Sign In</h2>
          <p className="text-secondary-600 mb-6">
            You need to be signed in to view your shopping cart.
          </p>
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button fullWidth>Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" fullWidth>Create Account</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-24 bg-secondary-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  if (!cart || totalItems === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link href="/books">
              <Button variant="ghost" leftIcon={<ArrowLeft size={20} />}>
                Continue Shopping
              </Button>
            </Link>
          </div>
          
          <Card className="p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-secondary-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Your Cart is Empty</h2>
            <p className="text-lg text-secondary-600 mb-8">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Link href="/books">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/books">
              <Button variant="ghost" leftIcon={<ArrowLeft size={20} />}>
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-secondary-900">
              Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h1>
          </div>
          {totalItems > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              leftIcon={<Trash2 size={16} />}
            >
              Clear Cart
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Book Image */}
                  <div className="w-20 h-24 bg-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.book.imageUrl ? (
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-secondary-400" />
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      <Link
                        href={`/books/${item.book.id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {item.book.title}
                      </Link>
                    </h3>
                    <p className="text-secondary-600 mb-2">{item.book.author}</p>
                    <p className="text-sm text-secondary-500 mb-3">
                      {item.book.category}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-secondary-700">
                          Quantity:
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {updatingItems.has(item.id) ? '...' : item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        leftIcon={<Trash2 size={16} />}
                        className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      {formatPrice(item.totalPrice)}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {formatPrice(item.unitPrice)} each
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold text-secondary-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span className="text-success-600">Free</span>
                </div>
                
                <div className="flex justify-between text-secondary-600">
                  <span>Tax</span>
                  <span>{formatPrice(totalAmount * 0.08)}</span>
                </div>
                
                <hr className="border-secondary-200" />
                
                <div className="flex justify-between text-lg font-bold text-secondary-900">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount * 1.08)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => router.push('/books')}
                >
                  Continue Shopping
                </Button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-secondary-500">
                  Free shipping on orders over $25
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
