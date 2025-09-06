// __tests__/services/realtimeProductService.test.js
/**
 * @jest-environment node
 */
import { realtimeProductService } from '@/services/realtimeProductService';
import { PRODUCT_STATUS } from '@/types/admin';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((field, operator, value) => ({ field, operator, value })),
  onSnapshot: jest.fn((query, callback, errorCallback) => {
    callback({ docs: [] });
    return jest.fn();
  }),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  doc: jest.fn()
}));

describe('realtimeProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribeToActiveProducts', () => {
    it('should construct query with only valid status values', () => {
      const mockCallback = jest.fn();
      const collectionMock = jest.fn();
      
      require('firebase/firestore').collection.mockImplementation(() => collectionMock);
      require('firebase/firestore').query.mockImplementation((...args) => args);
      require('firebase/firestore').where.mockImplementation((field, operator, value) => ({ field, operator, value }));

      realtimeProductService.subscribeToActiveProducts(mockCallback);

      // Check that query was called with correct parameters
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'status', 
        'in', 
        [PRODUCT_STATUS.ACTIVE]
      );
    });

    it('should apply category filter when provided', () => {
      const mockCallback = jest.fn();
      const filters = { category: 'electronics' };
      
      realtimeProductService.subscribeToActiveProducts(mockCallback, filters);

      // Check that category filter was applied
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'category', 
        '==', 
        'electronics'
      );
    });

    it('should apply sellerId filter when provided', () => {
      const mockCallback = jest.fn();
      const filters = { sellerId: 'user123' };
      
      realtimeProductService.subscribeToActiveProducts(mockCallback, filters);

      // Check that sellerId filter was applied
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        'sellerId', 
        '==', 
        'user123'
      );
    });
  });
});