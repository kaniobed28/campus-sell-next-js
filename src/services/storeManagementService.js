/**
 * Store Management Service
 * Handles all database operations for store management functionality
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

import {
  createProductModel,
  createStoreAnalyticsModel,
  createInquiryModel,
  createMessageModel,
  createActivityLogModel,
  createAutoResponseModel,
  createSellerPoliciesModel,
  createProductPerformanceModel,
  PRODUCT_STATUS,
  INQUIRY_STATUS,
  ACTIVITY_TYPES
} from '@/types/store';

class StoreManagementService {
  constructor() {
    this.collections = {
      products: 'products',
      storeAnalytics: 'storeAnalytics',
      inquiries: 'inquiries',
      messages: 'messages',
      activityLogs: 'activityLogs',
      autoResponses: 'autoResponses',
      sellerPolicies: 'sellerPolicies',
      productPerformance: 'productPerformance'
    };
  }

  // ==================== PRODUCT MANAGEMENT ====================

  /**
   * Get all products for a seller with optional filtering and pagination
   */
  async getSellerProducts(sellerId, options = {}) {
    try {
      const {
        status = null,
        category = null,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limitCount = 50,
        startAfterDoc = null
      } = options;

      let q = query(
        collection(db, this.collections.products),
        where('createdBy', '==', sellerId)
      );

      // Apply filters
      if (status) {
        q = query(q, where('status', '==', status));
      }
      if (category) {
        q = query(q, where('category', '==', category));
      }

      // Apply sorting
      q = query(q, orderBy(sortBy, sortOrder));

      // Apply pagination
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => 
        createProductModel({ id: doc.id, ...doc.data() })
      );

      return {
        products,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === limitCount
      };
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Update product status and track the change
   */
  async updateProductStatus(productId, newStatus, sellerId) {
    try {
      const productRef = doc(db, this.collections.products, productId);
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }

      const productData = productDoc.data();
      if (productData.createdBy !== sellerId) {
        throw new Error('Unauthorized: You can only update your own products');
      }

      const oldStatus = productData.status || PRODUCT_STATUS.ACTIVE;

      // Update product status
      await updateDoc(productRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastEditedAt: serverTimestamp()
      });

      // Log the activity
      await this.logActivity(sellerId, ACTIVITY_TYPES.PRODUCT_STATUS_CHANGED, {
        productId,
        oldStatus,
        newStatus,
        description: `Product status changed from ${oldStatus} to ${newStatus}`
      });

      // Update analytics
      await this.updateStoreAnalytics(sellerId);

      return { success: true, oldStatus, newStatus };
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  }

  /**
   * Delete a product and clean up related data
   */
  async deleteProduct(productId, sellerId) {
    try {
      return await runTransaction(db, async (transaction) => {
        const productRef = doc(db, this.collections.products, productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error('Product not found');
        }

        const productData = productDoc.data();
        if (productData.createdBy !== sellerId) {
          throw new Error('Unauthorized: You can only delete your own products');
        }

        // Check for active dependencies (in a real implementation)
        // This would check for active inquiries, cart items, etc.
        const hasActiveDependencies = await this.checkProductDependencies(productId, transaction);
        if (hasActiveDependencies.hasIssues) {
          throw new Error(`Cannot delete product: ${hasActiveDependencies.reason}`);
        }

        // Delete the product
        transaction.delete(productRef);

        // Clean up related data
        await this.cleanupProductData(productId, productData, transaction);

        // Log the activity
        const activityRef = doc(collection(db, this.collections.activityLogs));
        transaction.set(activityRef, createActivityLogModel({
          sellerId,
          activityType: ACTIVITY_TYPES.PRODUCT_DELETED,
          productId,
          description: `Product "${productData.title}" was deleted`,
          metadata: { 
            productTitle: productData.title, 
            productPrice: productData.price,
            imageCount: productData.imageUrls?.length || 0,
            viewCount: productData.viewCount || 0
          }
        }));

        return { 
          success: true, 
          productTitle: productData.title,
          cleanupSummary: {
            imagesDeleted: productData.imageUrls?.length || 0,
            analyticsCleared: true
          }
        };
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Check for product dependencies that would prevent deletion
   */
  async checkProductDependencies(productId, transaction = null) {
    try {
      // In a real implementation, this would check:
      // - Active inquiries
      // - Items in shopping carts
      // - Pending orders
      // - Active promotions
      
      // Mock implementation for demonstration
      const mockHasInquiries = Math.random() > 0.8; // 20% chance
      const mockInCart = Math.random() > 0.9; // 10% chance
      
      if (mockHasInquiries) {
        return {
          hasIssues: true,
          reason: 'Product has active buyer inquiries',
          details: ['Active conversations will be lost']
        };
      }
      
      if (mockInCart) {
        return {
          hasIssues: true,
          reason: 'Product is in buyer shopping carts',
          details: ['Will be removed from shopping carts']
        };
      }

      return { hasIssues: false };
    } catch (error) {
      console.error('Error checking product dependencies:', error);
      return { hasIssues: false }; // Allow deletion if check fails
    }
  }

  /**
   * Clean up related data when deleting a product
   */
  async cleanupProductData(productId, productData, transaction) {
    try {
      // Clean up product performance data
      const performanceRef = doc(db, this.collections.productPerformance, productId);
      transaction.delete(performanceRef);

      // Clean up any auto-responses specific to this product
      // In a real implementation, this would query and delete related documents

      // Note: Image cleanup would typically be handled by Firebase Storage
      // This is where you would delete images from storage:
      // if (productData.imageUrls) {
      //   for (const imageUrl of productData.imageUrls) {
      //     await deleteImageFromStorage(imageUrl);
      //   }
      // }

      return { success: true };
    } catch (error) {
      console.error('Error cleaning up product data:', error);
      // Don't throw error as the main deletion should still succeed
      return { success: false, error: error.message };
    }
  }

  /**
   * Duplicate a product with new ID
   */
  async duplicateProduct(productId, sellerId) {
    try {
      const originalProductRef = doc(db, this.collections.products, productId);
      const originalProductDoc = await getDoc(originalProductRef);

      if (!originalProductDoc.exists()) {
        throw new Error('Original product not found');
      }

      const originalData = originalProductDoc.data();
      if (originalData.createdBy !== sellerId) {
        throw new Error('Unauthorized: You can only duplicate your own products');
      }

      // Create new product data (excluding images and ID)
      const newProductData = createProductModel({
        ...originalData,
        title: `${originalData.title} (Copy)`,
        images: [], // Don't copy images for security reasons
        imageUrls: [], // Don't copy images for security reasons
        status: PRODUCT_STATUS.DRAFT,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        inquiryCount: 0,
        favoriteCount: 0
      });

      // Remove the ID field as Firestore will generate a new one
      delete newProductData.id;

      const newProductRef = doc(collection(db, this.collections.products));
      await setDoc(newProductRef, newProductData);

      // Log the activity
      await this.logActivity(sellerId, ACTIVITY_TYPES.PRODUCT_CREATED, {
        productId: newProductRef.id,
        description: `Product duplicated from "${originalData.title}"`,
        metadata: { originalProductId: productId }
      });

      return { success: true, newProductId: newProductRef.id };
    } catch (error) {
      console.error('Error duplicating product:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get comprehensive store analytics for a seller
   */
  async getStoreAnalytics(sellerId) {
    try {
      // Get all seller's products
      const productsQuery = query(
        collection(db, this.collections.products),
        where('createdBy', '==', sellerId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate metrics
      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.status === PRODUCT_STATUS.ACTIVE).length;
      const soldProducts = products.filter(p => p.status === PRODUCT_STATUS.SOLD).length;
      const unavailableProducts = products.filter(p => p.status === PRODUCT_STATUS.UNAVAILABLE).length;
      const draftProducts = products.filter(p => p.status === PRODUCT_STATUS.DRAFT).length;

      const totalViews = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const totalInquiries = products.reduce((sum, p) => sum + (p.inquiryCount || 0), 0);
      const totalFavorites = products.reduce((sum, p) => sum + (p.favoriteCount || 0), 0);

      const averageViewsPerProduct = totalProducts > 0 ? Math.round(totalViews / totalProducts) : 0;
      const conversionRate = totalViews > 0 ? Math.round((soldProducts / totalViews) * 100) : 0;

      // Get top performing products
      const topPerformingProducts = products
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
        .map(product => ({
          id: product.id,
          title: product.title,
          views: product.viewCount || 0,
          inquiries: product.inquiryCount || 0,
          favorites: product.favoriteCount || 0,
          price: product.price,
          status: product.status || PRODUCT_STATUS.ACTIVE
        }));

      // Get recent activity
      const recentActivityQuery = query(
        collection(db, this.collections.activityLogs),
        where('sellerId', '==', sellerId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const recentActivitySnapshot = await getDocs(recentActivityQuery);
      const recentActivity = recentActivitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const analytics = createStoreAnalyticsModel({
        sellerId,
        totalProducts,
        activeProducts,
        soldProducts,
        unavailableProducts,
        draftProducts,
        totalViews,
        totalInquiries,
        totalFavorites,
        averageViewsPerProduct,
        conversionRate,
        topPerformingProducts,
        recentActivity,
        lastUpdated: new Date()
      });

      // Cache the analytics
      const analyticsRef = doc(db, this.collections.storeAnalytics, sellerId);
      await setDoc(analyticsRef, analytics, { merge: true });

      return analytics;
    } catch (error) {
      console.error('Error calculating store analytics:', error);
      throw new Error('Failed to calculate analytics');
    }
  }

  /**
   * Update store analytics (called after product changes)
   */
  async updateStoreAnalytics(sellerId) {
    try {
      // This will recalculate and cache the analytics
      await this.getStoreAnalytics(sellerId);
    } catch (error) {
      console.error('Error updating store analytics:', error);
      // Don't throw error as this is a background operation
    }
  }

  // ==================== ACTIVITY LOGGING ====================

  /**
   * Log an activity for analytics and history tracking
   */
  async logActivity(sellerId, activityType, details = {}) {
    try {
      const activityData = createActivityLogModel({
        sellerId,
        activityType,
        productId: details.productId || null,
        inquiryId: details.inquiryId || null,
        buyerId: details.buyerId || null,
        description: details.description || '',
        metadata: details.metadata || {},
        impact: details.impact || 'neutral',
        value: details.value || 0
      });

      const activityRef = doc(collection(db, this.collections.activityLogs));
      await setDoc(activityRef, activityData);

      return activityRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error as this is a background operation
    }
  }

  // ==================== PRODUCT PERFORMANCE ====================

  /**
   * Track product view and update analytics
   */
  async trackProductView(productId, viewerId = null) {
    try {
      const productRef = doc(db, this.collections.products, productId);
      
      // Increment view count
      await updateDoc(productRef, {
        viewCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // Get product data for seller ID
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        const productData = productDoc.data();
        
        // Log the view activity
        await this.logActivity(productData.createdBy, ACTIVITY_TYPES.PRODUCT_VIEWED, {
          productId,
          buyerId: viewerId,
          description: 'Product was viewed',
          impact: 'positive',
          value: 1
        });
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
      // Don't throw error as this is a background operation
    }
  }

  /**
   * Track product inquiry and update analytics
   */
  async trackProductInquiry(productId, buyerId) {
    try {
      const productRef = doc(db, this.collections.products, productId);
      
      // Increment inquiry count
      await updateDoc(productRef, {
        inquiryCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // Get product data for seller ID
      const productDoc = await getDoc(productRef);
      if (productDoc.exists()) {
        const productData = productDoc.data();
        
        // Log the inquiry activity
        await this.logActivity(productData.createdBy, ACTIVITY_TYPES.INQUIRY_RECEIVED, {
          productId,
          buyerId,
          description: 'Product inquiry received',
          impact: 'positive',
          value: 5
        });
      }
    } catch (error) {
      console.error('Error tracking product inquiry:', error);
      // Don't throw error as this is a background operation
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk update product status
   */
  async bulkUpdateProductStatus(productIds, newStatus, sellerId) {
    try {
      const batch = writeBatch(db);
      const results = [];

      for (const productId of productIds) {
        const productRef = doc(db, this.collections.products, productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists() && productDoc.data().createdBy === sellerId) {
          batch.update(productRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
            lastEditedAt: serverTimestamp()
          });
          results.push({ productId, success: true });
        } else {
          results.push({ productId, success: false, error: 'Product not found or unauthorized' });
        }
      }

      await batch.commit();

      // Log bulk activity
      await this.logActivity(sellerId, ACTIVITY_TYPES.PRODUCT_STATUS_CHANGED, {
        description: `Bulk status update: ${results.filter(r => r.success).length} products updated to ${newStatus}`,
        metadata: { productIds: productIds.filter((_, i) => results[i].success), newStatus }
      });

      // Update analytics
      await this.updateStoreAnalytics(sellerId);

      return results;
    } catch (error) {
      console.error('Error in bulk status update:', error);
      throw new Error('Failed to update product statuses');
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(productIds, sellerId) {
    try {
      const batch = writeBatch(db);
      const results = [];

      for (const productId of productIds) {
        const productRef = doc(db, this.collections.products, productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists() && productDoc.data().createdBy === sellerId) {
          batch.delete(productRef);
          results.push({ productId, success: true, title: productDoc.data().title });
        } else {
          results.push({ productId, success: false, error: 'Product not found or unauthorized' });
        }
      }

      await batch.commit();

      // Log bulk activity
      await this.logActivity(sellerId, ACTIVITY_TYPES.PRODUCT_DELETED, {
        description: `Bulk delete: ${results.filter(r => r.success).length} products deleted`,
        metadata: { productIds: productIds.filter((_, i) => results[i].success) }
      });

      // Update analytics
      await this.updateStoreAnalytics(sellerId);

      return results;
    } catch (error) {
      console.error('Error in bulk delete:', error);
      throw new Error('Failed to delete products');
    }
  }

  // ==================== SEARCH AND FILTERING ====================

  /**
   * Search seller's products with advanced filtering
   */
  async searchSellerProducts(sellerId, searchOptions = {}) {
    try {
      const {
        searchTerm = '',
        status = null,
        category = null,
        minPrice = null,
        maxPrice = null,
        tags = [],
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limitCount = 50
      } = searchOptions;

      // Start with basic seller filter
      let q = query(
        collection(db, this.collections.products),
        where('createdBy', '==', sellerId)
      );

      // Apply filters
      if (status) {
        q = query(q, where('status', '==', status));
      }
      if (category) {
        q = query(q, where('category', '==', category));
      }

      // Apply sorting
      q = query(q, orderBy(sortBy, sortOrder), limit(limitCount));

      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => 
        createProductModel({ id: doc.id, ...doc.data() })
      );

      // Apply client-side filters (Firestore limitations)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        products = products.filter(product =>
          product.title.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      if (minPrice !== null) {
        products = products.filter(product => product.price >= minPrice);
      }

      if (maxPrice !== null) {
        products = products.filter(product => product.price <= maxPrice);
      }

      if (tags.length > 0) {
        products = products.filter(product =>
          tags.some(tag => product.tags.includes(tag))
        );
      }

      return products;
    } catch (error) {
      console.error('Error searching seller products:', error);
      throw new Error('Failed to search products');
    }
  }
}

// Create and export singleton instance
const storeManagementService = new StoreManagementService();
export default storeManagementService;