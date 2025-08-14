"use client";

import { useEffect, useState, useCallback } from "react";
import { useBasketStore } from "@/app/stores/useBasketStore";

/**
 * Hook for managing basket counter state and real-time updates
 */
export const useBasketCounter = () => {
  const basketStore = useBasketStore();
  const [previousCount, setPreviousCount] = useState(basketStore.itemCount);
  const [hasRecentUpdate, setHasRecentUpdate] = useState(false);

  // Track count changes for animations
  useEffect(() => {
    if (basketStore.itemCount !== previousCount) {
      setHasRecentUpdate(true);
      setPreviousCount(basketStore.itemCount);
      
      // Clear the recent update flag after animation
      const timer = setTimeout(() => {
        setHasRecentUpdate(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [basketStore.itemCount, previousCount]);

  // Initialize basket on mount
  useEffect(() => {
    if (!basketStore.lastSyncTime) {
      basketStore.initializeBasket();
    }
  }, [basketStore]);

  // Handle visibility change to sync when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && basketStore.hasPendingChanges) {
        basketStore.syncWithFirebase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [basketStore]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      if (basketStore.hasPendingChanges) {
        basketStore.syncWithFirebase();
      }
    };

    const handleOffline = () => {
      // Could show offline indicator
      console.log('App is offline - basket changes will be queued');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [basketStore]);

  return {
    count: basketStore.itemCount,
    isLoading: basketStore.isLoading,
    error: basketStore.error,
    hasRecentUpdate,
    totalPrice: basketStore.totalPrice,
    isEmpty: basketStore.itemCount === 0,
    
    // Actions
    refresh: basketStore.syncWithFirebase,
    clearError: basketStore.clearError,
  };
};

/**
 * Hook for basket counter animations
 */
export const useBasketCounterAnimation = (count) => {
  const [animationClass, setAnimationClass] = useState('');
  const [previousCount, setPreviousCount] = useState(count);

  useEffect(() => {
    if (count !== previousCount) {
      if (count > previousCount) {
        // Item added - bounce animation
        setAnimationClass('animate-bounce');
      } else if (count < previousCount) {
        // Item removed - shake animation
        setAnimationClass('animate-pulse');
      }
      
      setPreviousCount(count);
      
      // Clear animation after it completes
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [count, previousCount]);

  return animationClass;
};

/**
 * Hook for basket counter notifications
 */
export const useBasketCounterNotifications = () => {
  const { count, error } = useBasketCounter();
  const [lastNotificationCount, setLastNotificationCount] = useState(count);

  useEffect(() => {
    // Show notification when items are added
    if (count > lastNotificationCount) {
      const addedCount = count - lastNotificationCount;
      if (addedCount === 1) {
        // Single item added - notification handled by individual components
      } else {
        // Multiple items added
        console.log(`${addedCount} items added to basket`);
      }
    }
    
    setLastNotificationCount(count);
  }, [count, lastNotificationCount]);

  useEffect(() => {
    // Show error notifications
    if (error) {
      console.error('Basket error:', error);
    }
  }, [error]);

  return {
    count,
    error
  };
};

export default useBasketCounter;