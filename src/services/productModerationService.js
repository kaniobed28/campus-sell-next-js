// services/productModerationService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { PRODUCT_STATUS } from '@/types/admin';

class ProductModerationService {
  constructor() {
    this.productsCollection = collection(db, 'products');
    this.reportsCollection = collection(db, 'product_reports');
  }

  /**
   * Get all active products with filtering and pagination
   */
  async getActiveProducts(filters = {}) {
    try {
      let q = query(this.productsCollection);

      // Filter for active products by default
      if (!filters.includeAll) {
        q = query(q, where('status', 'in', [PRODUCT_STATUS.ACTIVE, undefined, null]));
      }

      // Apply additional filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.sellerId) {
        q = query(q, where('sellerId', '==', filters.sellerId));
      }

      if (filters.title) {
        q = query(q, where('title', '>=', filters.title), where('title', '<=', filters.title + '\uf8ff'));
      }

      // Order by creation date (most recent first)
      q = query(q, orderBy('createdAt', 'desc'));

      // Apply pagination
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      if (filters.startAfter) {
        q = query(q, startAfter(filters.startAfter));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
        blockedAt: doc.data().blockedAt?.toDate() || null,
        removedAt: doc.data().removedAt?.toDate() || null
      }));
    } catch (error) {
      console.error('Failed to get active products:', error);
      throw new Error('Failed to retrieve active products');
    }
  }

  /**
   * Get reported products
   */
  async getReportedProducts(limit = 50) {
    try {
      // First get all reports
      const reportsQuery = query(
        this.reportsCollection,
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const reportsSnapshot = await getDocs(reportsQuery);
      const reports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null
      }));

      // Get unique product IDs from reports
      const productIds = [...new Set(reports.map(report => report.productId))];
      
      // Get product details for reported products
      const reportedProducts = [];
      for (const productId of productIds) {
        try {
          const product = await this.getProductDetails(productId);
          if (product) {
            const productReports = reports.filter(report => report.productId === productId);
            reportedProducts.push({
              ...product,
              reports: productReports,
              reportCount: productReports.length
            });
          }
        } catch (err) {
          console.warn(`Failed to get details for product ${productId}:`, err);
        }
      }

      return reportedProducts.sort((a, b) => b.reportCount - a.reportCount);
    } catch (error) {
      console.error('Failed to get reported products:', error);
      throw new Error('Failed to retrieve reported products');
    }
  }

  /**
   * Get product details by ID
   */
  async getProductDetails(productId) {
    try {
      const productDoc = doc(this.productsCollection, productId);
      const productSnapshot = await getDoc(productDoc);
      
      if (productSnapshot.exists()) {
        const productData = productSnapshot.data();
        return {
          id: productSnapshot.id,
          ...productData,
          createdAt: productData.createdAt?.toDate() || null,
          updatedAt: productData.updatedAt?.toDate() || null,
          blockedAt: productData.blockedAt?.toDate() || null,
          removedAt: productData.removedAt?.toDate() || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get product details:', error);
      throw new Error('Failed to retrieve product details');
    }
  }

  /**
   * Block product from public view
   */
  async blockProduct(productId, reason, blockedBy) {
    try {
      const productDoc = doc(this.productsCollection, productId);
      
      // Check if product exists
      const productSnapshot = await getDoc(productDoc);
      if (!productSnapshot.exists()) {
        throw new Error('Product not found');
      }

      const updateData = {
        status: PRODUCT_STATUS.BLOCKED,
        blockReason: reason,
        blockedBy,
        blockedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(productDoc, updateData);
      
      return await this.getProductDetails(productId);
    } catch (error) {
      console.error('Failed to block product:', error);
      throw new Error(`Failed to block product: ${error.message}`);
    }
  }

  /**
   * Unblock product (restore to active)
   */
  async unblockProduct(productId, unblockedBy) {
    try {
      const productDoc = doc(this.productsCollection, productId);
      
      // Check if product exists
      const productSnapshot = await getDoc(productDoc);
      if (!productSnapshot.exists()) {
        throw new Error('Product not found');
      }

      const updateData = {
        status: PRODUCT_STATUS.ACTIVE,
        blockReason: null,
        blockedBy: null,
        blockedAt: null,
        unblockedBy,
        unblockedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(productDoc, updateData);
      
      return await this.getProductDetails(productId);
    } catch (error) {
      console.error('Failed to unblock product:', error);
      throw new Error(`Failed to unblock product: ${error.message}`);
    }
  }

  /**
   * Remove product permanently
   */
  async removeProduct(productId, reason, removedBy) {
    try {
      const productDoc = doc(this.productsCollection, productId);
      
      // Check if product exists
      const productSnapshot = await getDoc(productDoc);
      if (!productSnapshot.exists()) {
        throw new Error('Product not found');
      }

      const updateData = {
        status: PRODUCT_STATUS.REMOVED,
        removeReason: reason,
        removedBy,
        removedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(productDoc, updateData);
      
      return await this.getProductDetails(productId);
    } catch (error) {
      console.error('Failed to remove product:', error);
      throw new Error(`Failed to remove product: ${error.message}`);
    }
  }

  /**
   * Restore removed product
   */
  async restoreProduct(productId, restoredBy) {
    try {
      const productDoc = doc(this.productsCollection, productId);
      
      // Check if product exists
      const productSnapshot = await getDoc(productDoc);
      if (!productSnapshot.exists()) {
        throw new Error('Product not found');
      }

      const updateData = {
        status: PRODUCT_STATUS.ACTIVE,
        removeReason: null,
        removedBy: null,
        removedAt: null,
        restoredBy,
        restoredAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(productDoc, updateData);
      
      return await this.getProductDetails(productId);
    } catch (error) {
      console.error('Failed to restore product:', error);
      throw new Error(`Failed to restore product: ${error.message}`);
    }
  }

  /**
   * Get products by status
   */
  async getProductsByStatus(status, limit = 50) {
    try {
      const q = query(
        this.productsCollection,
        where('status', '==', status),
        orderBy('updatedAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null,
        blockedAt: doc.data().blockedAt?.toDate() || null,
        removedAt: doc.data().removedAt?.toDate() || null
      }));
    } catch (error) {
      console.error('Failed to get products by status:', error);
      throw new Error('Failed to retrieve products by status');
    }
  }

  /**
   * Search products
   */
  async searchProducts(searchTerm, limit = 20) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // Search by title
      const titleQuery = query(
        this.productsCollection,
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(limit)
      );

      // Search by description (if indexed)
      const descQuery = query(
        this.productsCollection,
        where('description', '>=', searchTerm),
        where('description', '<=', searchTerm + '\uf8ff'),
        limit(limit)
      );

      const [titleResults, descResults] = await Promise.all([
        getDocs(titleQuery),
        getDocs(descQuery)
      ]);

      // Combine and deduplicate results
      const productMap = new Map();
      
      titleResults.docs.forEach(doc => {
        productMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null,
          updatedAt: doc.data().updatedAt?.toDate() || null
        });
      });

      descResults.docs.forEach(doc => {
        if (!productMap.has(doc.id)) {
          productMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || null,
            updatedAt: doc.data().updatedAt?.toDate() || null
          });
        }
      });

      return Array.from(productMap.values()).slice(0, limit);
    } catch (error) {
      console.error('Failed to search products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get product moderation statistics
   */
  async getModerationStats() {
    try {
      // Get all products (sample)
      const allProducts = await this.getActiveProducts({ includeAll: true, limit: 1000 });
      
      const stats = {
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter(p => p.status === PRODUCT_STATUS.ACTIVE || !p.status).length,
        blockedProducts: allProducts.filter(p => p.status === PRODUCT_STATUS.BLOCKED).length,
        removedProducts: allProducts.filter(p => p.status === PRODUCT_STATUS.REMOVED).length,
        recentProducts: allProducts.filter(p => {
          if (!p.createdAt) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return p.createdAt > weekAgo;
        }).length,
        statusDistribution: {}
      };

      // Calculate status distribution
      allProducts.forEach(product => {
        const status = product.status || PRODUCT_STATUS.ACTIVE;
        stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
      });

      // Get report statistics
      const reportsQuery = query(this.reportsCollection, limit(100));
      const reportsSnapshot = await getDocs(reportsQuery);
      stats.totalReports = reportsSnapshot.docs.length;

      return stats;
    } catch (error) {
      console.error('Failed to get moderation statistics:', error);
      throw new Error('Failed to retrieve moderation statistics');
    }
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateProductStatus(productIds, newStatus, reason, updatedBy) {
    try {
      const updatePromises = productIds.map(async (productId) => {
        const productDoc = doc(this.productsCollection, productId);
        
        const updateData = {
          status: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy
        };

        if (newStatus === PRODUCT_STATUS.BLOCKED) {
          updateData.blockReason = reason;
          updateData.blockedBy = updatedBy;
          updateData.blockedAt = serverTimestamp();
        } else if (newStatus === PRODUCT_STATUS.REMOVED) {
          updateData.removeReason = reason;
          updateData.removedBy = updatedBy;
          updateData.removedAt = serverTimestamp();
        } else if (newStatus === PRODUCT_STATUS.ACTIVE) {
          updateData.blockReason = null;
          updateData.blockedBy = null;
          updateData.blockedAt = null;
          updateData.removeReason = null;
          updateData.removedBy = null;
          updateData.removedAt = null;
          updateData.restoredBy = updatedBy;
          updateData.restoredAt = serverTimestamp();
        }

        return updateDoc(productDoc, updateData);
      });

      await Promise.all(updatePromises);
      
      return {
        success: true,
        updatedCount: productIds.length
      };
    } catch (error) {
      console.error('Failed to bulk update products:', error);
      throw new Error('Failed to bulk update product status');
    }
  }

  /**
   * Auto-approve new listings (default behavior)
   */
  async autoApproveProduct(productId) {
    try {
      const productDoc = doc(this.productsCollection, productId);
      
      const updateData = {
        status: PRODUCT_STATUS.ACTIVE,
        autoApproved: true,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(productDoc, updateData);
      
      return await this.getProductDetails(productId);
    } catch (error) {
      console.error('Failed to auto-approve product:', error);
      throw new Error('Failed to auto-approve product');
    }
  }
}

// Export singleton instance
export const productModerationService = new ProductModerationService();
export default productModerationService;