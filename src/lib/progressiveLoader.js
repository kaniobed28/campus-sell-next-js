/**
 * ProgressiveLoader - Manages seamless transitions from fallback to real data
 * Provides immediate functionality while real data loads in the background
 */

import { autoSetupManager } from './autoSetup';
import { fallbackDataProvider } from './fallbackData';

class ProgressiveLoader {
  constructor() {
    this.loadedData = new Map();
    this.subscribers = new Map();
    this.loadingStates = new Map();
  }

  /**
   * Load data with immediate fallback, update when real data is available
   */
  async loadWithFallback(key, realDataLoader, fallbackData) {
    // Return fallback data immediately
    const fallback = fallbackData || this.getFallbackForKey(key);
    
    // Start loading real data in background if not already loading
    if (!this.loadingStates.get(key)) {
      this.loadingStates.set(key, true);
      this.loadRealDataInBackground(key, realDataLoader);
    }
    
    // Return cached real data if available, otherwise fallback
    return this.loadedData.get(key) || fallback;
  }

  /**
   * Load real data in background and notify subscribers when ready
   */
  async loadRealDataInBackground(key, loader) {
    try {
      // Ensure system is ready first
      await autoSetupManager.ensureSystemReady();
      
      // Load the real data
      const realData = await loader();
      
      // Cache the real data
      this.loadedData.set(key, realData);
      this.loadingStates.set(key, false);
      
      // Notify subscribers
      this.notifySubscribers(key, realData);
      
      console.log(`Real data loaded for ${key}`);
      
    } catch (error) {
      console.warn(`Failed to load real data for ${key}, using fallback:`, error);
      this.loadingStates.set(key, false);
    }
  }

  /**
   * Subscribe to data updates for a specific key
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key).add(callback);
    
    // If real data is already loaded, call callback immediately
    if (this.loadedData.has(key)) {
      try {
        callback(this.loadedData.get(key));
      } catch (error) {
        console.error(`Error in subscriber callback for ${key}:`, error);
      }
    }
    
    // Return unsubscribe function
    return () => {
      const keySubscribers = this.subscribers.get(key);
      if (keySubscribers) {
        keySubscribers.delete(callback);
      }
    };
  }

  /**
   * Notify all subscribers for a key
   */
  notifySubscribers(key, data) {
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      keySubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Get fallback data for a specific key
   */
  getFallbackForKey(key) {
    switch (key) {
      case 'categories':
        return fallbackDataProvider.getDefaultCategories();
      case 'categoryOptions':
        return fallbackDataProvider.getCategoryOptions();
      case 'settings':
        return fallbackDataProvider.getPlaceholderData().settings;
      default:
        return null;
    }
  }

  /**
   * Check if real data is loaded for a key
   */
  hasRealData(key) {
    return this.loadedData.has(key);
  }

  /**
   * Check if data is currently loading for a key
   */
  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  /**
   * Get current data (real or fallback) for a key
   */
  getCurrentData(key) {
    return this.loadedData.get(key) || this.getFallbackForKey(key);
  }

  /**
   * Force reload real data for a key
   */
  async reloadData(key, loader) {
    this.loadedData.delete(key);
    this.loadingStates.set(key, false);
    return this.loadRealDataInBackground(key, loader);
  }

  /**
   * Clear all cached data (for testing or reset)
   */
  clearCache() {
    this.loadedData.clear();
    this.loadingStates.clear();
  }

  /**
   * Get loading status for all keys
   */
  getLoadingStatus() {
    const status = {};
    this.loadingStates.forEach((isLoading, key) => {
      status[key] = {
        isLoading,
        hasRealData: this.loadedData.has(key),
        hasFallback: this.getFallbackForKey(key) !== null
      };
    });
    return status;
  }
}

// Create singleton instance
export const progressiveLoader = new ProgressiveLoader();

// Convenience functions for common data types
export async function loadCategories() {
  return progressiveLoader.loadWithFallback(
    'categories',
    async () => {
      // Load categories from Firebase directly
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categories = [];
      snapshot.docs.forEach(doc => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      // Build category tree
      return buildCategoryTree(categories);
    }
  );
}

// Helper function to build category tree
function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // First pass: create all categories with children array
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build the tree structure
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id);
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryWithChildren);
      }
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });

  // Sort categories by displayOrder
  const sortByDisplayOrder = (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0);
  
  rootCategories.sort(sortByDisplayOrder);
  rootCategories.forEach(category => {
    if (category.children) {
      category.children.sort(sortByDisplayOrder);
    }
  });

  return rootCategories;
}

export async function loadCategoryOptions() {
  return progressiveLoader.loadWithFallback(
    'categoryOptions',
    async () => {
      const categories = await loadCategories();
      return convertCategoriesToOptions(categories);
    }
  );
}

export function subscribeToCategories(callback) {
  return progressiveLoader.subscribe('categories', callback);
}

export function subscribeToSettings(callback) {
  return progressiveLoader.subscribe('settings', callback);
}

// Helper function to convert categories to select options
function convertCategoriesToOptions(categories) {
  const options = [];
  
  categories.forEach(parent => {
    options.push({
      value: parent.id,
      label: parent.name,
      slug: parent.slug,
      icon: parent.icon,
      isParent: true
    });
    
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach(child => {
        options.push({
          value: child.id,
          label: `  ${child.name}`,
          slug: child.slug,
          icon: child.icon,
          parentId: parent.id
        });
      });
    }
  });
  
  return options;
}

export default ProgressiveLoader;