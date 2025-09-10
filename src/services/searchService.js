/**
 * Search Service
 * Handles all search operations and business logic for complex product search
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer
} from 'firebase/firestore';
import { PRODUCT_STATUS } from '@/types/store';

class SearchService {
  constructor() {
    this.collections = {
      products: 'products',
      searchSuggestions: 'searchSuggestions'
    };
  }

  /**
   * Search products with filters, sorting, and pagination
   * @param {Object} filters - Search filters
   * @param {Object} sortOptions - Sorting options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Search results with metadata
   */
  async searchProducts(filters, sortOptions, pagination) {
    try {
      const {
        query: searchTerm = '',
        categories = [],
        priceRange = { min: null, max: null },
        condition = [],
        tags = [],
        sellerId = null,
        dateRange = { start: null, end: null },
        inStock = false,
        onSale = false
      } = filters;

      const {
        field = 'createdAt',
        direction = 'desc'
      } = sortOptions;

      const {
        page = 1,
        limit: limitCount = 20,
        lastDoc = null
      } = pagination;

      // Start with basic query for active products
      let q = query(
        collection(db, this.collections.products),
        where('status', '==', PRODUCT_STATUS.ACTIVE)
      );

      // Add category filter
      if (categories.length > 0) {
        q = query(q, where('category', 'in', categories));
      }

      // Add price range filters
      if (priceRange.min !== null) {
        q = query(q, where('price', '>=', priceRange.min));
      }
      if (priceRange.max !== null) {
        q = query(q, where('price', '<=', priceRange.max));
      }

      // Add condition filter
      if (condition.length > 0) {
        q = query(q, where('condition', 'in', condition));
      }

      // Add tags filter
      if (tags.length > 0) {
        // Firestore doesn't support array-contains-any with more than 10 elements
        // We'll need to handle this on the client side for larger arrays
        if (tags.length <= 10) {
          q = query(q, where('tags', 'array-contains-any', tags));
        }
      }

      // Add seller filter
      if (sellerId) {
        q = query(q, where('sellerId', '==', sellerId));
      }

      // Add date range filters
      if (dateRange.start) {
        q = query(q, where('createdAt', '>=', dateRange.start));
      }
      if (dateRange.end) {
        q = query(q, where('createdAt', '<=', dateRange.end));
      }

      // Add inStock filter
      if (inStock) {
        q = query(q, where('quantity', '>', 0));
      }

      // Add onSale filter
      if (onSale) {
        q = query(q, where('isOnSale', '==', true));
      }

      // Add sorting
      // Note: Firestore requires that all orderBy fields be included in the query
      if (field === 'price') {
        q = query(q, orderBy('price', direction));
      } else if (field === 'createdAt') {
        q = query(q, orderBy('createdAt', direction));
      } else if (field === 'viewCount') {
        q = query(q, orderBy('viewCount', direction));
      } else {
        // Default to createdAt if field is not supported
        q = query(q, orderBy('createdAt', direction));
      }

      // Add pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      let products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply client-side filters for text search and complex tag filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        products = products.filter(product =>
          (product.title?.toLowerCase() || '').includes(searchLower) ||
          (product.description?.toLowerCase() || '').includes(searchLower) ||
          (product.category?.toLowerCase() || '').includes(searchLower)
        );
      }

      // Apply client-side tag filtering for large arrays
      if (tags.length > 10) {
        products = products.filter(product =>
          tags.some(tag => (product.tags || []).includes(tag))
        );
      }

      return {
        products,
        totalCount: products.length, // This should be replaced with actual count query in production
        hasNextPage: products.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get search suggestions for autocomplete
   * @param {string} searchTerm - Search query
   * @returns {Promise<Array>} Suggested search terms
   */
  async getSearchSuggestions(searchTerm) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      // In a real implementation, this would query a suggestions collection
      // or use a more sophisticated algorithm
      // For now, we'll return some mock suggestions
      const suggestions = [
        'laptop',
        'phone',
        'book',
        'shoes',
        'jacket',
        'backpack',
        'headphones',
        'camera',
        'bike',
        'furniture'
      ];

      // Filter suggestions based on the search term
      return suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get facet counts for filter options
   * @param {Object} filters - Current filters (excluding the one we're counting for)
   * @returns {Promise<Object>} Facet counts
   */
  async getFacetCounts(filters) {
    try {
      // This is a simplified implementation
      // In a production environment, you might want to use aggregation queries
      // or maintain separate count collections for better performance
      return {
        categories: {},
        conditions: {},
        priceRange: { min: 0, max: 1000 }
      };
    } catch (error) {
      console.error('Error getting facet counts:', error);
      return {
        categories: {},
        conditions: {},
        priceRange: { min: 0, max: 1000 }
      };
    }
  }

  /**
   * Normalize product data for display
   * @param {Object} product - Raw product data from Firestore
   * @returns {Object} Normalized product data
   */
  normalizeProduct(product) {
    return {
      id: product.id,
      title: product.title || 'Untitled Product',
      description: product.description || '',
      price: typeof product.price === 'string' 
        ? parseFloat(product.price) || 0 
        : product.price || 0,
      category: product.category || 'Uncategorized',
      condition: product.condition || 'new',
      tags: Array.isArray(product.tags) ? product.tags : [],
      sellerId: product.sellerId || product.createdBy || '',
      image: Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : product.image || '/default-image.jpg',
      images: Array.isArray(product.imageUrls) 
        ? product.imageUrls 
        : product.image ? [product.image] : ['/default-image.jpg'],
      viewCount: product.viewCount || 0,
      inquiryCount: product.inquiryCount || 0,
      favoriteCount: product.favoriteCount || 0,
      createdAt: product.createdAt || new Date(),
      updatedAt: product.updatedAt || new Date(),
      quantity: product.quantity || 0,
      isOnSale: product.isOnSale || false,
      salePrice: product.salePrice || null
    };
  }
}

// Create and export singleton instance
const searchService = new SearchService();
export default searchService;