// services/realtimeProductService.js
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { PRODUCT_STATUS } from '@/types/admin';
import { convertTimestamp } from '@/utils/timestampUtils';
import { cleanQueryArray } from '@/utils/firebaseUtils';

class RealtimeProductService {
  constructor() {
    this.productsCollection = collection(db, 'products');
    this.listeners = new Map(); // Track active listeners
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
  }
}

// Export singleton instance
export const realtimeProductService = new RealtimeProductService();
export default realtimeProductService;