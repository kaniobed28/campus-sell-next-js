"use client";

import { useEffect, useCallback } from "react";
import { useAuth } from "@/app/stores/useAuth";
import { useCartStore } from "@/app/stores/useCartStore";
import { useGuestBasket, useBasketMigration } from "./useGuestBasket";

/**
 * Unified basket hook that handles both guest and authenticated users
 */
export const useUnifiedBasket = () => {
  const { user, loading: authLoading } = useAuth();
  const cartStore = useCartStore();
  const guestBasket = useGuestBasket();
  const { migrateGuestBasket } = useBasketMigration();

  // Determine if user is in guest mode
  const isGuestMode = !user && !authLoading;
  const isAuthenticatedMode = !!user;

  // Handle basket migration when user logs in
  useEffect(() => {
    const handleMigration = async () => {
      if (user && guestBasket.guestItems.length > 0) {
        try {
          console.log("Migrating guest basket to authenticated user...");
          const result = await migrateGuestBasket(user.uid, cartStore.addToCart);
          
          if (result.migrated > 0) {
            console.log(`Successfully migrated ${result.migrated} items`);
            // You could show a notification here
          }
          
          if (result.errors.length > 0) {
            console.warn("Some items failed to migrate:", result.errors);
            // You could show error notifications here
          }
        } catch (error) {
          console.error("Failed to migrate guest basket:", error);
        }
      }
    };

    if (!authLoading && user) {
      handleMigration();
    }
  }, [user, authLoading, guestBasket.guestItems.length, migrateGuestBasket, cartStore.addToCart]);

  // Unified add to basket function
  const addToBasket = useCallback(async (product, quantity = 1) => {
    if (isGuestMode) {
      return guestBasket.addToGuestBasket(product, quantity);
    } else if (isAuthenticatedMode) {
      return cartStore.addToCart(product, quantity);
    } else {
      throw new Error("Cannot add to basket while authentication is loading");
    }
  }, [isGuestMode, isAuthenticatedMode, guestBasket, cartStore]);

  // Unified remove from basket function
  const removeFromBasket = useCallback(async (itemId) => {
    if (isGuestMode) {
      return guestBasket.removeFromGuestBasket(itemId);
    } else if (isAuthenticatedMode) {
      // For authenticated users, we'd need to implement this in cartStore
      console.log("Remove from authenticated basket:", itemId);
      // This would need to be implemented in the cart store
    }
  }, [isGuestMode, isAuthenticatedMode, guestBasket]);

  // Unified update quantity function
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (isGuestMode) {
      return guestBasket.updateGuestQuantity(itemId, newQuantity);
    } else if (isAuthenticatedMode) {
      // For authenticated users, we'd need to implement this in cartStore
      console.log("Update quantity in authenticated basket:", itemId, newQuantity);
      // This would need to be implemented in the cart store
    }
  }, [isGuestMode, isAuthenticatedMode, guestBasket]);

  // Unified clear basket function
  const clearBasket = useCallback(async () => {
    if (isGuestMode) {
      return guestBasket.clearGuestBasket();
    } else if (isAuthenticatedMode) {
      return cartStore.clearCart();
    }
  }, [isGuestMode, isAuthenticatedMode, guestBasket, cartStore]);

  // Get unified basket data
  const getBasketData = useCallback(() => {
    if (isGuestMode) {
      return guestBasket.getGuestBasketSummary();
    } else if (isAuthenticatedMode) {
      return {
        items: cartStore.cart,
        totalItems: cartStore.getCartCount(),
        totalPrice: 0, // Would need to calculate this
        uniqueProducts: cartStore.cart.length
      };
    } else {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        uniqueProducts: 0
      };
    }
  }, [isGuestMode, isAuthenticatedMode, guestBasket, cartStore]);

  const basketData = getBasketData();

  return {
    // Mode indicators
    isGuestMode,
    isAuthenticatedMode,
    isLoading: authLoading || guestBasket.isLoading || cartStore.isLoading,
    
    // Basket data
    items: basketData.items,
    totalItems: basketData.totalItems,
    totalPrice: basketData.totalPrice,
    uniqueProducts: basketData.uniqueProducts,
    
    // Actions
    addToBasket,
    removeFromBasket,
    updateQuantity,
    clearBasket,
    
    // Error state
    error: cartStore.error,
    
    // Raw stores (for advanced usage)
    guestBasket,
    cartStore
  };
};

export default useUnifiedBasket;