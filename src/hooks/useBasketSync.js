"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { useAuth } from "@/app/stores/useAuth";

/**
 * Hook for real-time basket synchronization across tabs and network changes
 */
export const useBasketSync = () => {
  const basketStore = useBasketStore();
  const { user } = useAuth();
  const syncTimeoutRef = useRef(null);
  const lastSyncRef = useRef(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Debounced sync function
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      if (user && navigator.onLine) {
        basketStore.syncWithFirebase();
        lastSyncRef.current = Date.now();
      }
    }, 1000); // 1 second debounce
  }, [user, basketStore]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      console.log('App came online - syncing basket');
      
      // Sync immediately when coming back online
      if (user) {
        basketStore.syncWithFirebase();
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      console.log('App went offline - basket changes will be queued');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, basketStore]);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && navigator.onLine) {
        // Tab became visible - check if we need to sync
        const timeSinceLastSync = lastSyncRef.current ? Date.now() - lastSyncRef.current : Infinity;
        
        // Sync if it's been more than 30 seconds since last sync
        if (timeSinceLastSync > 30000) {
          console.log('Tab became visible - syncing basket');
          basketStore.syncWithFirebase();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, basketStore]);

  // Handle storage events (cross-tab communication)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Handle guest basket changes across tabs
      if (e.key === 'campus-sell-guest-basket' && !user) {
        console.log('Guest basket changed in another tab - syncing');
        // Reload guest basket from localStorage
        const guestBasket = JSON.parse(e.newValue || '{"items": [], "savedItems": []}');
        basketStore.set({
          guestItems: guestBasket.items || [],
          isGuestMode: true
        });
        basketStore.computeValues();
      }
      
      // Handle cross-tab sync signals for authenticated users
      if (e.key === 'campus-sell-basket-sync' && user) {
        const syncData = JSON.parse(e.newValue || '{}');
        if (syncData.userId === user.uid && syncData.timestamp > (lastSyncRef.current || 0)) {
          console.log('Basket changed in another tab - syncing');
          debouncedSync();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, basketStore, debouncedSync]);

  // Periodic sync for authenticated users
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (navigator.onLine && !document.hidden) {
        const timeSinceLastSync = lastSyncRef.current ? Date.now() - lastSyncRef.current : Infinity;
        
        // Sync every 5 minutes if no recent activity
        if (timeSinceLastSync > 300000) {
          console.log('Periodic basket sync');
          basketStore.syncWithFirebase();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, basketStore]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOnline: isOnlineRef.current,
    lastSync: lastSyncRef.current,
    forceSync: () => {
      if (user && navigator.onLine) {
        basketStore.syncWithFirebase();
      }
    }
  };
};

/**
 * Hook for broadcasting basket changes to other tabs
 */
export const useBasketBroadcast = () => {
  const { user } = useAuth();

  const broadcastChange = useCallback((changeType, data = {}) => {
    if (typeof window === 'undefined') return;

    try {
      // For authenticated users, broadcast via localStorage
      if (user) {
        const syncData = {
          userId: user.uid,
          changeType,
          timestamp: Date.now(),
          data
        };
        localStorage.setItem('campus-sell-basket-sync', JSON.stringify(syncData));
        
        // Remove the item immediately to trigger storage event
        setTimeout(() => {
          localStorage.removeItem('campus-sell-basket-sync');
        }, 100);
      }
      
      // For guest users, the basket store already handles localStorage updates
    } catch (error) {
      console.error('Error broadcasting basket change:', error);
    }
  }, [user]);

  return { broadcastChange };
};

/**
 * Hook for handling network connectivity changes
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
        // Trigger any pending sync operations
        console.log('Network restored - ready to sync');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
    isReconnecting: wasOffline && isOnline
  };
};

export default useBasketSync;