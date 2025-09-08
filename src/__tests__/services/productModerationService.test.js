// __tests__/services/productModerationService.test.js
import { productModerationService } from '@/services/productModerationService';
import { PRODUCT_STATUS } from '@/types/admin';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  updateDoc: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((field, operator, value) => ({ field, operator, value })),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  limit: jest.fn((count) => ({ count })),
  startAfter: jest.fn((value) => ({ value })),
  serverTimestamp: jest.fn()
}));

describe('productModerationService', () => {
  let productModerationService;

  beforeEach(() => {
    jest.resetModules();
    productModerationService = require('@/services/productModerationService').default;
    jest.clearAllMocks();
  });

  describe('getActiveProducts', () => {
    it('should construct query with only valid status values when not including all', async () => {
      await productModerationService.getActiveProducts({ includeAll: false });

      // Check that query was called with correct parameters
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'status', 
        'in', 
        [PRODUCT_STATUS.ACTIVE]
      );
    });

    it('should not apply status filter when including all products', async () => {
      await productModerationService.getActiveProducts({ includeAll: true });

      // Check that status filter was not applied
      const whereCalls = require('firebase/firestore').where.mock.calls;
      const statusFilters = whereCalls.filter(call => call[0] === 'status');
      expect(statusFilters).toHaveLength(0);
    });

    it('should apply status filter when specific status is provided', async () => {
      const filters = { status: PRODUCT_STATUS.BLOCKED };
      await productModerationService.getActiveProducts(filters);

      // Check that status filter was applied
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'status', 
        '==', 
        PRODUCT_STATUS.BLOCKED
      );
    });

    it('should apply category filter when provided', async () => {
      const filters = { category: 'electronics' };
      await productModerationService.getActiveProducts(filters);

      // Check that category filter was applied
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'category', 
        '==', 
        'electronics'
      );
    });

    it('should apply sellerId filter when provided', async () => {
      const filters = { sellerId: 'user123' };
      await productModerationService.getActiveProducts(filters);

      // Check that sellerId filter was applied
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'sellerId', 
        '==', 
        'user123'
      );
    });
  });

  describe('getProductDetails', () => {
    it('should retrieve product details by ID', async () => {
      const mockProduct = {
        id: 'product1',
        exists: () => true,
        data: () => ({
          title: 'Test Product',
          description: 'Test Description',
          status: PRODUCT_STATUS.ACTIVE,
          createdAt: { toDate: () => new Date('2024-01-01') }
        })
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue(mockProduct);

      const result = await productModerationService.getProductDetails('product1');

      expect(result).toMatchObject({
        id: 'product1',
        title: 'Test Product',
        status: PRODUCT_STATUS.ACTIVE
      });
    });

    it('should return null for non-existent product', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({ exists: () => false });

      const result = await productModerationService.getProductDetails('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('blockProduct', () => {
    it('should block product successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock product exists
      getDoc.mockResolvedValueOnce({ exists: () => true });
      
      // Mock updated product data
      getDoc.mockResolvedValueOnce({
        id: 'product1',
        exists: () => true,
        data: () => ({
          title: 'Test Product',
          status: PRODUCT_STATUS.BLOCKED,
          blockReason: 'Inappropriate content',
          blockedBy: 'admin@example.com'
        })
      });

      updateDoc.mockResolvedValue();

      const result = await productModerationService.blockProduct(
        'product1', 
        'Inappropriate content', 
        'admin@example.com'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(PRODUCT_STATUS.BLOCKED);
      expect(result.blockReason).toBe('Inappropriate content');
    });

    it('should throw error for non-existent product', async () => {
      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(
        productModerationService.blockProduct('nonexistent', 'reason', 'admin')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('unblockProduct', () => {
    it('should unblock product successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock product exists
      getDoc.mockResolvedValueOnce({ exists: () => true });
      
      // Mock updated product data
      getDoc.mockResolvedValueOnce({
        id: 'product1',
        exists: () => true,
        data: () => ({
          title: 'Test Product',
          status: PRODUCT_STATUS.ACTIVE,
          blockReason: null,
          unblockedBy: 'admin@example.com'
        })
      });

      updateDoc.mockResolvedValue();

      const result = await productModerationService.unblockProduct('product1', 'admin@example.com');

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(PRODUCT_STATUS.ACTIVE);
      expect(result.blockReason).toBeNull();
    });
  });

  describe('removeProduct', () => {
    it('should remove product successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock product exists
      getDoc.mockResolvedValueOnce({ exists: () => true });
      
      // Mock updated product data
      getDoc.mockResolvedValueOnce({
        id: 'product1',
        exists: () => true,
        data: () => ({
          title: 'Test Product',
          status: PRODUCT_STATUS.REMOVED,
          removeReason: 'Severe violation',
          removedBy: 'admin@example.com'
        })
      });

      updateDoc.mockResolvedValue();

      const result = await productModerationService.removeProduct(
        'product1', 
        'Severe violation', 
        'admin@example.com'
      );

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(PRODUCT_STATUS.REMOVED);
      expect(result.removeReason).toBe('Severe violation');
    });
  });

  describe('searchProducts', () => {
    it('should return empty array for short search terms', async () => {
      const result = await productModerationService.searchProducts('a');
      expect(result).toEqual([]);
    });

    it('should search products by title', async () => {
      const mockProducts = [
        {
          id: 'product1',
          data: () => ({
            title: 'Test Product',
            description: 'Test Description'
          })
        }
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockProducts });

      const result = await productModerationService.searchProducts('test');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Product');
    });
  });

  describe('bulkUpdateProductStatus', () => {
    it('should update multiple products successfully', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue();

      const productIds = ['product1', 'product2', 'product3'];
      const result = await productModerationService.bulkUpdateProductStatus(
        productIds,
        PRODUCT_STATUS.BLOCKED,
        'Bulk block',
        'admin@example.com'
      );

      expect(updateDoc).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(3);
    });
  });

  describe('autoApproveProduct', () => {
    it('should auto-approve product successfully', async () => {
      const { getDoc, updateDoc } = require('firebase/firestore');
      
      // Mock updated product data
      getDoc.mockResolvedValue({
        id: 'product1',
        exists: () => true,
        data: () => ({
          title: 'Test Product',
          status: PRODUCT_STATUS.ACTIVE,
          autoApproved: true
        })
      });

      updateDoc.mockResolvedValue();

      const result = await productModerationService.autoApproveProduct('product1');

      expect(updateDoc).toHaveBeenCalled();
      expect(result.status).toBe(PRODUCT_STATUS.ACTIVE);
      expect(result.autoApproved).toBe(true);
    });
  });
});