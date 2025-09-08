"use client";

import { useEffect } from 'react';
import { realtimeProductService } from '@/services/realtimeProductService';

const CategoryCountSync = () => {
  useEffect(() => {
    // Start monitoring product changes for count updates
    const unsubscribe = realtimeProductService.subscribeToProductCountChanges();
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  
  // This component doesn't render anything
  return null;
};

export default CategoryCountSync;