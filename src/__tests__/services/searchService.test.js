/**
 * Search Service Tests
 */

import searchService from '@/services/searchService';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((...args) => args),
  orderBy: jest.fn((...args) => args),
  limit: jest.fn((...args) => args),
  startAfter: jest.fn((...args) => args),
  getDocs: jest.fn(),
  getCountFromServer: jest.fn()
}));

describe('SearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchProducts', () => {
    it('should construct a basic query with active status filter', async () => {
      const mockSnapshot = {
        docs: [],
        empty: true
      };
      
      require('firebase/firestore').getDocs.mockResolvedValue(mockSnapshot);
      
      const filters = {};
      const sortOptions = {};
      const pagination = {};
      
      const result = await searchService.searchProducts(filters, sortOptions, pagination);
      
      expect(result).toEqual({
        products: [],
        totalCount: 0,
        hasNextPage: false,
        lastDoc: null
      });
    });

    it('should apply category filter when categories are provided', async () => {
      const mockSnapshot = {
        docs: [],
        empty: true
      };
      
      require('firebase/firestore').getDocs.mockResolvedValue(mockSnapshot);
      
      const filters = { categories: ['electronics'] };
      const sortOptions = {};
      const pagination = {};
      
      await searchService.searchProducts(filters, sortOptions, pagination);
      
      // Verify that the where clause for categories was added
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        expect.anything(),
        'in',
        ['electronics']
      );
    });

    it('should apply price range filters when provided', async () => {
      const mockSnapshot = {
        docs: [],
        empty: true
      };
      
      require('firebase/firestore').getDocs.mockResolvedValue(mockSnapshot);
      
      const filters = { 
        priceRange: { min: 10, max: 100 } 
      };
      const sortOptions = {};
      const pagination = {};
      
      await searchService.searchProducts(filters, sortOptions, pagination);
      
      // Verify that the where clauses for price range were added
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        expect.anything(),
        '>=',
        10
      );
      
      expect(require('firebase/firestore').where).toHaveBeenCalledWith(
        expect.anything(),
        '<=',
        100
      );
    });
  });

  describe('normalizeProduct', () => {
    it('should normalize product data correctly', () => {
      const rawProduct = {
        id: '123',
        title: 'Test Product',
        price: '29.99',
        category: 'electronics',
        condition: 'new',
        tags: ['featured', 'popular'],
        sellerId: 'seller123',
        imageUrls: ['image1.jpg', 'image2.jpg'],
        viewCount: 100,
        inquiryCount: 5,
        favoriteCount: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        quantity: 5,
        isOnSale: true,
        salePrice: '19.99'
      };

      const normalized = searchService.normalizeProduct(rawProduct);

      expect(normalized).toEqual({
        id: '123',
        title: 'Test Product',
        description: '',
        price: 29.99,
        category: 'electronics',
        condition: 'new',
        tags: ['featured', 'popular'],
        sellerId: 'seller123',
        image: 'image1.jpg',
        images: ['image1.jpg', 'image2.jpg'],
        viewCount: 100,
        inquiryCount: 5,
        favoriteCount: 10,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        quantity: 5,
        isOnSale: true,
        salePrice: '19.99'
      });
    });

    it('should handle missing fields with default values', () => {
      const rawProduct = {
        id: '123'
      };

      const normalized = searchService.normalizeProduct(rawProduct);

      expect(normalized).toEqual({
        id: '123',
        title: 'Untitled Product',
        description: '',
        price: 0,
        category: 'Uncategorized',
        condition: 'new',
        tags: [],
        sellerId: '',
        image: '/default-image.jpg',
        images: ['/default-image.jpg'],
        viewCount: 0,
        inquiryCount: 0,
        favoriteCount: 0,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        quantity: 0,
        isOnSale: false,
        salePrice: null
      });
    });
  });
});