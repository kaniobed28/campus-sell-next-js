// lib/store/cartStore.js
"use client";

import { useBasketStore } from "./useBasketStore";

// Legacy cart store - delegates to basket store for backward compatibility
export const useCartStore = () => {
  const basketStore = useBasketStore();
  
  return {
    // Map basket store to legacy cart store interface
    cart: basketStore.getAllItems(),
    isLoading: basketStore.isLoading,
    error: basketStore.error,
    
    // Legacy methods that delegate to basket store
    addToCart: basketStore.addToBasket,
    clearCart: basketStore.clearBasket,
    getCartCount: basketStore.getItemCount,
  };
};


