// services/realtimeProductService.js
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDocs } from 'firebase/firestore';
import { PRODUCT_STATUS } from '@/types/admin';
import { convertTimestamp } from '@/utils/timestampUtils';
import { cleanQueryArray } from '@/utils/firebaseUtils';
import { CategoryService } from '@/services/CategoryService';

class RealtimeProductService {
  constructor() {
    this.productsCollection = collection(db, 'products');
    this.listeners = new Map(); // Track active listeners
    this.isCountSyncActive = false;
    this.productCache = new Map(); // Cache product data to track changes
  }

  /**
   * Subscribe to real-time updates for active products
   * @param {Function} callback - Function to call when products update
   * @param {Object} filters - Optional filters for the products query
   * @returns {Function} Unsubscribe function
   */
  subscribeToActiveProducts(callback, filters = {}) {
    // Create query for active products
    // Fix: Remove undefined and null values from the status array
    let q = query(
      this.productsCollection,
      where('status', 'in', cleanQueryArray([PRODUCT_STATUS.ACTIVE]))
    );

    // Apply additional filters if provided
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters.sellerId) {
      q = query(q, where('sellerId', '==', filters.sellerId));
    }

    // Order by creation date (most recent first)
    q = query(q, orderBy('createdAt', 'desc'));

    // Create listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          title: data.title || data.name || 'Untitled Product',
          price: data.price || 0,
          category: data.category || data.categoryNames?.[0] || 'Uncategorized',
          image: data.image || '/default-image.jpg',
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : data.imageUrls ? [data.imageUrls] : [],
          likes: data.likes || 0,
          views: data.views || 0,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          blockedAt: convertTimestamp(data.blockedAt),
          removedAt: convertTimestamp(data.removedAt)
        };
      });
      
      callback(products);
    }, (error) => {
      console.error('Real-time product subscription error:', error);
      callback([], error);
    });

    // Store listener reference
    const listenerId = `active-${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to real-time updates for all products (admin view)
   * @param {Function} callback - Function to call when products update
   * @returns {Function} Unsubscribe function
   */
  subscribeToAllProducts(callback) {
    // Create query for all products
    const q = query(
      this.productsCollection,
      orderBy('updatedAt', 'desc')
    );

    // Create listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const products = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          title: data.title || data.name || 'Untitled Product',
          price: data.price || 0,
          category: data.category || data.categoryNames?.[0] || 'Uncategorized',
          image: data.image || '/default-image.jpg',
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : data.imageUrls ? [data.imageUrls] : [],
          likes: data.likes || 0,
          views: data.views || 0,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          blockedAt: convertTimestamp(data.blockedAt),
          removedAt: convertTimestamp(data.removedAt)
        };
      });
      
      callback(products);
    }, (error) => {
      console.error('Real-time all products subscription error:', error);
      callback([], error);
    });

    // Store listener reference
    const listenerId = `all-${Date.now()}`;
    this.listeners.set(listenerId, unsubscribe);
    
    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to real-time updates for a specific product
   * @param {string} productId - ID of the product to subscribe to
   * @param {Function} callback - Function to call when product updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToProduct(productId, callback) {
    if (!productId) {
      console.error('Product ID is required for subscription');
      return () => {};
    }

    const productDoc = doc(this.productsCollection, productId);
    
    // Create listener
    const unsubscribe = onSnapshot(productDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const product = {
          id: docSnapshot.id,
          ...data,
          title: data.title || data.name || 'Untitled Product',
          price: data.price || 0,
          category: data.category || data.categoryNames?.[0] || 'Uncategorized',
          image: data.image || '/default-image.jpg',
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : data.imageUrls ? [data.imageUrls] : [],
          likes: data.likes || 0,
          views: data.views || 0,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          blockedAt: convertTimestamp(data.blockedAt),
          removedAt: convertTimestamp(data.removedAt)
        };
        callback(product);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Real-time product subscription error for ${productId}:`, error);
      callback(null, error);
    });

    // Store listener reference
    const listenerId = `product-${productId}`;
    this.listeners.set(listenerId, unsubscribe);
    
    // Return unsubscribe function
    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Subscribe to product count changes for automatic category count updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToProductCountChanges() {
    // Prevent multiple subscriptions
    if (this.isCountSyncActive) {
      console.log('Product count synchronization is already active');
      return () => {};
    }
    
    this.isCountSyncActive = true;
    
    // Listen to product collection changes for count updates
    const q = query(this.productsCollection);
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Track categories that need updates
      const categoriesToUpdate = new Set();
      
      // Process each change
      snapshot.docChanges().forEach(change => {
        const productId = change.doc.id;
        const productData = change.doc.data();
        
        if (change.type === 'added') {
          // New product added
          this.productCache.set(productId, { ...productData });
          if (productData.categoryId && productData.status === PRODUCT_STATUS.ACTIVE) {
            categoriesToUpdate.add(productData.categoryId);
          }
        } else if (change.type === 'modified') {
          // Product modified
          const previousData = this.productCache.get(productId) || {};
          this.productCache.set(productId, { ...productData });
          
          // Check if category or status changed
          const oldCategory = previousData.categoryId;
          const newCategory = productData.categoryId;
          const oldStatus = previousData.status;
          const newStatus = productData.status;
          
          // Update old category if product was previously counted
          if (oldCategory && oldStatus === PRODUCT_STATUS.ACTIVE) {
            categoriesToUpdate.add(oldCategory);
          }
          
          // Update new category if product should now be counted
          if (newCategory && newStatus === PRODUCT_STATUS.ACTIVE) {
            categoriesToUpdate.add(newCategory);
          }
          
          // Special case: if category changed but status is still active
          if (oldCategory && newCategory && oldCategory !== newCategory && newStatus === PRODUCT_STATUS.ACTIVE) {
            categoriesToUpdate.add(oldCategory); // Update old category
            categoriesToUpdate.add(newCategory); // Update new category
          }
        } else if (change.type === 'removed') {
          // Product deleted
          const previousData = this.productCache.get(productId) || {};
          this.productCache.delete(productId);
          
          // Update category if product was counted
          if (previousData.categoryId && previousData.status === PRODUCT_STATUS.ACTIVE) {
            categoriesToUpdate.add(previousData.categoryId);
          }
        }
      });
      
      // Update all affected categories
      for (const categoryId of categoriesToUpdate) {
        try {
          await this.updateCategoryProductCount(categoryId);
        } catch (error) {
          console.error(`Error updating product count for category ${categoryId}:`, error);
        }
      }
    }, (error) => {
      console.error('Product count monitoring error:', error);
    });
    
    console.log('Product count synchronization started');
    
    return () => {
      unsubscribe();
      this.isCountSyncActive = false;
      this.productCache.clear();
      console.log('Product count synchronization stopped');
    };
  }

  /**
   * Update category product count by querying all active products in the category
   * @param {string} categoryId - The category ID
   */
  async updateCategoryProductCount(categoryId) {
    try {
      // Query all active products in this category
      const q = query(
        this.productsCollection,
        where('categoryId', '==', categoryId),
        where('status', '==', PRODUCT_STATUS.ACTIVE)
      );
      
      const querySnapshot = await getDocs(q);
      const productCount = querySnapshot.size;
      
      // Update the category's productCount metadata
      const categoryService = new CategoryService();
      await categoryService.updateCategoryProductCount(categoryId, productCount);
      
      console.log(`Updated product count for category ${categoryId}: ${productCount}`);
    } catch (error) {
      console.error(`Error updating product count for category ${categoryId}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from all active listeners
   */
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn(`Error unsubscribing from listener ${key}:`, error);
      }
    });
    this.listeners.clear();
    
    // Clean up count sync if active
    if (this.isCountSyncActive) {
      this.isCountSyncActive = false;
      this.productCache.clear();
    }
  }
}

// Export singleton instance
export const realtimeProductService = new RealtimeProductService();
export default realtimeProductService;