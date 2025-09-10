import { useEffect } from 'react';
import { useBasketStore } from '@/stores/useBasketStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { basketService } from '@/services/basketService';

export const useBasketInitialization = () => {
  const { loadBasket, syncBasket, items } = useBasketStore();
  
  useEffect(() => {
    // Load initial basket (guest basket from localStorage)
    loadBasket();
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          // Load user's basket from Firestore
          await loadBasket(user.uid);
          
          // If there were items in guest basket, merge them
          // Note: This would require additional logic to handle the merge
          // For now, we'll just load the user's basket
        } catch (error) {
          console.error('Error loading user basket:', error);
        }
      } else {
        // User is signed out, load guest basket
        loadBasket();
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [loadBasket]);
  
  // Sync basket changes to Firestore for authenticated users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && items.length > 0) {
        // Sync basket to Firestore
        syncBasket(user.uid);
      }
    });
    
    return () => unsubscribe();
  }, [items, syncBasket]);
};