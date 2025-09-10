"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useBasketStore } from '@/stores/useBasketStore';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const BasketPage = () => {
  const { items, totalItems, totalPrice, removeFromBasket, updateQuantity } = useBasketStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromBasket(itemId);
    } else {
      updateQuantity(itemId, parseInt(newQuantity));
    }
  };
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Redirect to checkout page
    router.push('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Basket</h1>
          <div className="bg-card rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">Your basket is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding some products to your basket
            </p>
            <Button asChild variant="primary">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Basket</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basket Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center p-4 border-b border-border last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium text-card-foreground">{item.title}</h3>
                    <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-accent"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-sm font-medium hover:bg-accent"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Item Total */}
                  <div className="ml-4 w-20 text-right font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromBasket(item.id)}
                    className="ml-4 text-muted-foreground hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                loading={isCheckingOut}
                variant="primary"
                className="w-full"
              >
                Proceed to Checkout
              </Button>
              
              <Button asChild variant="outline" className="w-full mt-2">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;