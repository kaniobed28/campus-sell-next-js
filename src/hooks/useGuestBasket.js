"use client";

import { useState, useEffect, useCallback } from "react";

const GUEST_BASKET_KEY = "campus-sell-guest-basket";

/**
 * Hook for managing guest user basket in localStorage
 */
export const useGuestBasket = () => {
  const [guestItems, setGuestItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load guest basket from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GUEST_BASKET_KEY);
      if (stored) {
        const basketData = JSON.parse(stored);
        setGuestItems(basketData.items || []);
      }
    } catch (error) {
      console.error("Error loading guest basket:", error);
    }
  }, []);

  // Save guest basket to localStorage
  const saveToStorage = useCallback((items) => {
    try {
      const basketData = {
        items,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(GUEST_BASKET_KEY, JSON.stringify(basketData));
    } catch (error) {
      console.error("Error saving guest basket:", error);
    }
  }, []);

  // Add item to guest basket
  const addToGuestBasket = useCallback((product, quantity = 1) => {
    setIsLoading(true);
    
    try {
      setGuestItems(currentItems => {
        // Check if item already exists
        const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);
        
        let newItems;
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          newItems = currentItems.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          const newItem = {
            id: `guest-${Date.now()}-${Math.random()}`,
            productId: product.id,
            quantity,
            timestamp: new Date().toISOString(),
            product: {
              id: product.id,
              title: product.title || product.name,
              price: product.price,
              image: product.image || product.imageUrls?.[0]
            }
          };
          newItems = [...currentItems, newItem];
        }
        
        saveToStorage(newItems);
        return newItems;
      });
    } catch (error) {
      console.error("Error adding to guest basket:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveToStorage]);

  // Update item quantity in guest basket
  const updateGuestQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) {
      return removeFromGuestBasket(itemId);
    }

    setGuestItems(currentItems => {
      const newItems = currentItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  // Remove item from guest basket
  const removeFromGuestBasket = useCallback((itemId) => {
    setGuestItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== itemId);
      saveToStorage(newItems);
      return newItems;
    });
  }, [saveToStorage]);

  // Clear guest basket
  const clearGuestBasket = useCallback(() => {
    setGuestItems([]);
    localStorage.removeItem(GUEST_BASKET_KEY);
  }, []);

  // Get guest basket summary
  const getGuestBasketSummary = useCallback(() => {
    const totalItems = guestItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = guestItems.reduce((sum, item) => {
      const price = typeof item.product.price === 'string' 
        ? parseFloat(item.product.price) || 0 
        : item.product.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    return {
      items: guestItems,
      totalItems,
      totalPrice,
      uniqueProducts: guestItems.length
    };
  }, [guestItems]);

  // Export guest basket data (for migration to authenticated user)
  const exportGuestBasket = useCallback(() => {
    return {
      items: guestItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        timestamp: item.timestamp
      })),
      exportedAt: new Date().toISOString()
    };
  }, [guestItems]);

  return {
    guestItems,
    isLoading,
    addToGuestBasket,
    updateGuestQuantity,
    removeFromGuestBasket,
    clearGuestBasket,
    getGuestBasketSummary,
    exportGuestBasket
  };
};

/**
 * Hook for migrating guest basket to authenticated user
 */
export const useBasketMigration = () => {
  const { exportGuestBasket, clearGuestBasket } = useGuestBasket();

  const migrateGuestBasket = useCallback(async (userId, addToCartFunction) => {
    try {
      const guestData = exportGuestBasket();
      
      if (guestData.items.length === 0) {
        return { migrated: 0, errors: [] };
      }

      const errors = [];
      let migrated = 0;

      // Migrate each item
      for (const item of guestData.items) {
        try {
          await addToCartFunction({
            id: item.productId,
            // We'll need to fetch full product data or pass it along
          }, item.quantity);
          migrated++;
        } catch (error) {
          console.error(`Error migrating item ${item.productId}:`, error);
          errors.push({
            productId: item.productId,
            error: error.message
          });
        }
      }

      // Clear guest basket after successful migration
      if (migrated > 0) {
        clearGuestBasket();
      }

      return { migrated, errors };
    } catch (error) {
      console.error("Error during basket migration:", error);
      throw error;
    }
  }, [exportGuestBasket, clearGuestBasket]);

  return { migrateGuestBasket };
};

export default useGuestBasket;