// __tests__/services/productModerationService.test.js
import { productModerationService } from '@/services/productModerationService';
import { PRODUCT_STATUS } from '@/types/admin';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
}));

describe('ProductModerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveProducts', () => {
    it('should retrieve active products with default parameters', async () => {
      const mockProducts = [
        {
          id: 'product1',
          data: () => ({
            title: 'Test Product',
            description: 'Test Description',
            status: PRODUCT_STATUS.ACTIVE,
            createdAt: { toDate: () => new Date('2024-01-01') }
          })
        }
      ];

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: mockProducts });

      const result = await productModerationService.getActiveProducts();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'product1',
        title: 'Test Product',
        status: PRODUCT_STATUS.ACTIVE
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        status: PRODUCT_STATUS.BLOCKED,
        category: 'electronics',
        limit: 10
      };

      const { getDocs, query, where, limit } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });

      await productModerationService.getActiveProducts(filters);

      expect(where).toHaveBeenCalledWith('status', '==', PRODUCT_STATUS.BLOCKED);
      expect(where).toHaveBeenCalledWith('category', '==', 'electronics');
      expect(limit).toHaveBeenCalledWith(10);
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