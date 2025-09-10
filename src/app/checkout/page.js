"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useBasketStore } from '@/stores/useBasketStore';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const { items, totalItems, totalPrice } = useBasketStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  const handleCheckout = async () => {
    setIsProcessing(true);
    // Simulate checkout process
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to success page or clear basket
      alert('Order placed successfully!');
      router.push('/');
    }, 2000);
  };
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
          <div className="bg-card rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">Your basket is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some items to your basket before checking out
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="Doe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span>{item.title}</span>
                      <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4 pt-4 border-t border-border">
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
                disabled={isProcessing}
                loading={isProcessing}
                variant="primary"
                className="w-full"
              >
                Place Order
              </Button>
              
              <Button asChild variant="outline" className="w-full mt-2">
                <Link href="/basket">Back to Basket</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;