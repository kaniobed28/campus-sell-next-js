// Simple initialization utility for categories
// This can be run from the browser console or as a one-time setup

import { initializeCategories } from '@/scripts/initializeCategories.js';

// Function to initialize categories from browser console
window.initializeCategories = async () => {
  try {
    console.log('Starting category initialization...');
    await initializeCategories();
    console.log('Categories initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize categories:', error);
  }
};

// Auto-initialize if categories don't exist
export const autoInitializeCategories = async () => {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    // This will be called when the app loads
    const { db } = await import('@/lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');
    
    const categoriesRef = collection(db, 'categories');
    const existingCategories = await getDocs(categoriesRef);
    
    if (existingCategories.empty) {
      console.log('No categories found, initializing default categories...');
      await initializeCategories();
      console.log('Default categories initialized!');
    }
  } catch (error) {
    console.warn('Could not auto-initialize categories:', error);
  }
};