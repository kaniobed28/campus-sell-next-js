"use client";

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  getDoc,
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Helper function for exponential backoff retry
const retryWithBackoff = async (operation, retries = RETRY_CONFIG.maxRetries) => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    // Check if error is retryable (network errors, temporary Firebase errors)
    const isRetryable = 
      error.code === 'unavailable' ||
      error.code === 'deadline-exceeded' ||
      error.code === 'internal' ||
      error.message.includes('network') ||
      error.message.includes('timeout');

    if (!isRetryable) {
      throw error;
    }

    // Calculate delay with exponential backoff
    const attempt = RETRY_CONFIG.maxRetries - retries + 1;
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
      RETRY_CONFIG.maxDelay
    );

    console.warn(`Operation failed, retrying in ${delay}ms. Attempts remaining: ${retries - 1}`, error);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(operation, retries - 1);
  }
};

export class BasketService {
  /**
   * Add item to user's basket
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<string>} Document ID of created cart item
   */
  static async addItem(userId, productId, quantity) {
    if (!userId || !productId || !quantity || quantity < 1) {
      throw new Error("Invalid parameters for adding item to basket");
    }

    return retryWithBackoff(async () => {
      const cartItem = {
        userId,
        productId,
        quantity: parseInt(quantity),
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "cart"), cartItem);
      return docRef.id;
    });
  }

  /**
   * Update item quantity in basket
   * @param {string} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<void>}
   */
  static async updateItem(itemId, quantity) {
    if (!itemId || quantity < 1) {
      throw new Error("Invalid parameters for updating item");
    }

    return retryWithBackoff(async () => {
      await updateDoc(doc(db, "cart", itemId), {
        quantity: parseInt(quantity),
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Remove item from basket
   * @param {string} itemId - Cart item ID
   * @returns {Promise<void>}
   */
  static async removeItem(itemId) {
    if (!itemId) {
      throw new Error("Item ID is required for removal");
    }

    return retryWithBackoff(async () => {
      await deleteDoc(doc(db, "cart", itemId));
    });
  }

  /**
   * Get user's basket items
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of basket items
   */
  static async getUserBasket(userId) {
    if (!userId) {
      throw new Error("User ID is required to fetch basket");
    }

    return retryWithBackoff(async () => {
      const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
      const cartSnapshot = await getDocs(cartQuery);
      
      return cartSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  /**
   * Clear user's entire basket
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async clearUserBasket(userId) {
    if (!userId) {
      throw new Error("User ID is required to clear basket");
    }

    return retryWithBackoff(async () => {
      const cartQuery = query(collection(db, "cart"), where("userId", "==", userId));
      const cartSnapshot = await getDocs(cartQuery);
      
      if (cartSnapshot.empty) {
        return; // Nothing to clear
      }

      const batch = writeBatch(db);
      cartSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    });
  }

  /**
   * Save item for later
   * @param {string} itemId - Cart item ID
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<string>} Saved item document ID
   */
  static async saveItemForLater(itemId, userId, productId) {
    if (!itemId || !userId || !productId) {
      throw new Error("Invalid parameters for saving item");
    }

    return retryWithBackoff(async () => {
      const batch = writeBatch(db);
      
      // Create saved item
      const savedItemRef = doc(collection(db, "savedItems"));
      const savedItem = {
        userId,
        productId,
        savedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      };
      batch.set(savedItemRef, savedItem);
      
      // Remove from cart
      batch.delete(doc(db, "cart", itemId));
      
      await batch.commit();
      return savedItemRef.id;
    });
  }

  /**
   * Get user's saved items
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of saved items
   */
  static async getSavedItems(userId) {
    if (!userId) {
      throw new Error("User ID is required to fetch saved items");
    }

    return retryWithBackoff(async () => {
      const savedQuery = query(collection(db, "savedItems"), where("userId", "==", userId));
      const savedSnapshot = await getDocs(savedQuery);
      
      return savedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  /**
   * Move saved item back to basket
   * @param {string} savedItemId - Saved item ID
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<string>} Cart item document ID
   */
  static async moveToBasket(savedItemId, userId, productId) {
    if (!savedItemId || !userId || !productId) {
      throw new Error("Invalid parameters for moving item to basket");
    }

    return retryWithBackoff(async () => {
      const batch = writeBatch(db);
      
      // Create cart item
      const cartItemRef = doc(collection(db, "cart"));
      const cartItem = {
        userId,
        productId,
        quantity: 1,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(cartItemRef, cartItem);
      
      // Remove from saved items
      batch.delete(doc(db, "savedItems", savedItemId));
      
      await batch.commit();
      return cartItemRef.id;
    });
  }

  /**
   * Get product details for basket items
   * @param {Array<string>} productIds - Array of product IDs
   * @returns {Promise<Object>} Map of product ID to product data
   */
  static async getProductDetails(productIds) {
    if (!productIds || productIds.length === 0) {
      return {};
    }

    return retryWithBackoff(async () => {
      const productPromises = productIds.map(async (productId) => {
        try {
          const productDoc = await getDoc(doc(db, "products", productId));
          return productDoc.exists() ? { id: productId, ...productDoc.data() } : null;
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      
      return products.filter(Boolean).reduce((map, product) => {
        map[product.id] = product;
        return map;
      }, {});
    });
  }

  /**
   * Check if item exists in user's basket
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Cart item if exists, null otherwise
   */
  static async findExistingItem(userId, productId) {
    if (!userId || !productId) {
      return null;
    }

    return retryWithBackoff(async () => {
      const cartQuery = query(
        collection(db, "cart"), 
        where("userId", "==", userId),
        where("productId", "==", productId)
      );
      const cartSnapshot = await getDocs(cartQuery);
      
      if (cartSnapshot.empty) {
        return null;
      }
      
      const doc = cartSnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    });
  }

  /**
   * Batch update multiple items
   * @param {Array<Object>} updates - Array of {itemId, quantity} objects
   * @returns {Promise<void>}
   */
  static async batchUpdateItems(updates) {
    if (!updates || updates.length === 0) {
      return;
    }

    return retryWithBackoff(async () => {
      const batch = writeBatch(db);
      
      updates.forEach(({ itemId, quantity }) => {
        if (itemId && quantity >= 1) {
          batch.update(doc(db, "cart", itemId), {
            quantity: parseInt(quantity),
            updatedAt: serverTimestamp(),
          });
        }
      });
      
      await batch.commit();
    });
  }

  /**
   * Get basket statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Basket statistics
   */
  static async getBasketStats(userId) {
    if (!userId) {
      throw new Error("User ID is required for basket statistics");
    }

    return retryWithBackoff(async () => {
      const [cartItems, savedItems] = await Promise.all([
        this.getUserBasket(userId),
        this.getSavedItems(userId)
      ]);

      const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueProducts = cartItems.length;
      const savedCount = savedItems.length;

      return {
        totalItems,
        uniqueProducts,
        savedCount,
        lastUpdated: new Date().toISOString()
      };
    });
  }
}

export default BasketService;

// Additional utility functions for enhanced basket operations

/**
 * Basket operation queue for offline support
 */
class BasketOperationQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Add operation to queue
   * @param {Function} operation - Operation to queue
   * @param {Object} metadata - Operation metadata
   */
  enqueue(operation, metadata = {}) {
    this.queue.push({
      operation,
      metadata,
      timestamp: Date.now(),
      retries: 0
    });
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process queued operations
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const queuedOperation = this.queue.shift();
      
      try {
        await queuedOperation.operation();
        console.log('Queued operation completed:', queuedOperation.metadata);
      } catch (error) {
        console.error('Queued operation failed:', error, queuedOperation.metadata);
        
        // Retry logic for failed operations
        if (queuedOperation.retries < RETRY_CONFIG.maxRetries) {
          queuedOperation.retries++;
          this.queue.unshift(queuedOperation); // Put back at front
          
          // Wait before retrying
          await new Promise(resolve => 
            setTimeout(resolve, RETRY_CONFIG.baseDelay * Math.pow(2, queuedOperation.retries))
          );
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear all queued operations
   */
  clear() {
    this.queue = [];
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Global operation queue instance
const operationQueue = new BasketOperationQueue();

// Enhanced BasketService with additional methods
export class EnhancedBasketService extends BasketService {
  /**
   * Add operation to queue for offline support
   * @param {Function} operation - Operation to queue
   * @param {Object} metadata - Operation metadata
   */
  static queueOperation(operation, metadata) {
    operationQueue.enqueue(operation, metadata);
  }

  /**
   * Get operation queue status
   */
  static getQueueStatus() {
    return operationQueue.getStatus();
  }

  /**
   * Clear operation queue
   */
  static clearQueue() {
    operationQueue.clear();
  }

  /**
   * Validate basket item data
   * @param {Object} itemData - Item data to validate
   * @returns {Object} Validation result
   */
  static validateBasketItem(itemData) {
    const errors = [];
    
    if (!itemData.userId) {
      errors.push('User ID is required');
    }
    
    if (!itemData.productId) {
      errors.push('Product ID is required');
    }
    
    if (!itemData.quantity || itemData.quantity < 1) {
      errors.push('Quantity must be at least 1');
    }
    
    if (itemData.quantity > 999) {
      errors.push('Quantity cannot exceed 999');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize basket item data
   * @param {Object} itemData - Raw item data
   * @returns {Object} Sanitized item data
   */
  static sanitizeBasketItem(itemData) {
    return {
      userId: String(itemData.userId || '').trim(),
      productId: String(itemData.productId || '').trim(),
      quantity: Math.max(1, Math.min(999, parseInt(itemData.quantity) || 1)),
      timestamp: itemData.timestamp || new Date().toISOString()
    };
  }

  /**
   * Check basket limits for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Limit check result
   */
  static async checkBasketLimits(userId) {
    const MAX_ITEMS = 100; // Maximum items in basket
    const MAX_QUANTITY_PER_ITEM = 999;
    
    try {
      const basketItems = await this.getUserBasket(userId);
      const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueProducts = basketItems.length;
      
      return {
        canAddMore: uniqueProducts < MAX_ITEMS && totalItems < MAX_ITEMS * MAX_QUANTITY_PER_ITEM,
        currentItems: totalItems,
        uniqueProducts,
        maxItems: MAX_ITEMS,
        maxQuantityPerItem: MAX_QUANTITY_PER_ITEM
      };
    } catch (error) {
      console.error('Error checking basket limits:', error);
      return {
        canAddMore: true, // Default to allowing if check fails
        error: error.message
      };
    }
  }

  /**
   * Merge duplicate items in basket
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Merge result
   */
  static async mergeDuplicateItems(userId) {
    try {
      const basketItems = await this.getUserBasket(userId);
      
      // Group items by productId
      const itemGroups = basketItems.reduce((groups, item) => {
        if (!groups[item.productId]) {
          groups[item.productId] = [];
        }
        groups[item.productId].push(item);
        return groups;
      }, {});

      const mergeOperations = [];
      let mergedCount = 0;

      // Process groups with duplicates
      for (const [productId, items] of Object.entries(itemGroups)) {
        if (items.length > 1) {
          // Keep the first item, merge quantities, delete others
          const primaryItem = items[0];
          const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
          
          // Update primary item with total quantity
          mergeOperations.push(
            this.updateItem(primaryItem.id, Math.min(totalQuantity, 999))
          );
          
          // Delete duplicate items
          for (let i = 1; i < items.length; i++) {
            mergeOperations.push(this.removeItem(items[i].id));
          }
          
          mergedCount += items.length - 1;
        }
      }

      if (mergeOperations.length > 0) {
        await Promise.all(mergeOperations);
      }

      return {
        mergedCount,
        totalOperations: mergeOperations.length
      };
    } catch (error) {
      console.error('Error merging duplicate items:', error);
      throw error;
    }
  }

  /**
   * Get basket summary with pricing
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Basket summary
   */
  static async getBasketSummary(userId) {
    try {
      const basketItems = await this.getUserBasket(userId);
      
      if (basketItems.length === 0) {
        return {
          items: [],
          totalItems: 0,
          uniqueProducts: 0,
          subtotal: 0,
          isEmpty: true
        };
      }

      // Get product details
      const productIds = basketItems.map(item => item.productId);
      const products = await this.getProductDetails(productIds);

      // Calculate totals
      let subtotal = 0;
      const enrichedItems = basketItems.map(item => {
        const product = products[item.productId];
        const price = product ? (typeof product.price === 'string' ? parseFloat(product.price) || 0 : product.price || 0) : 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        return {
          ...item,
          product,
          unitPrice: price,
          totalPrice: itemTotal,
          isAvailable: !!product
        };
      });

      const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: enrichedItems,
        totalItems,
        uniqueProducts: basketItems.length,
        subtotal,
        isEmpty: false,
        unavailableItems: enrichedItems.filter(item => !item.isAvailable).length
      };
    } catch (error) {
      console.error('Error getting basket summary:', error);
      throw error;
    }
  }

  /**
   * Cleanup old basket items
   * @param {number} daysOld - Items older than this many days
   * @returns {Promise<number>} Number of items cleaned up
   */
  static async cleanupOldItems(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffTimestamp = cutoffDate.toISOString();

      // This would typically be done server-side, but for demo purposes:
      console.warn('Cleanup operation should be performed server-side for security');
      
      return 0; // Return 0 as we're not actually performing cleanup client-side
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

// Export both the original and enhanced service
export { EnhancedBasketService, operationQueue };
export default BasketService;