import { create } from 'zustand';
import useSellStore from '../useSellStore';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  storage: {},
  db: {}
}));

// Mock Firebase storage functions
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn()
}));

// Mock Firebase firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-product-id' }))
}));

describe('useSellStore', () => {
  let store;

  beforeEach(() => {
    // Create a new store instance for each test
    store = useSellStore;
  });

  it('should set category with complete category object', () => {
    const categoryObject = {
      value: 'cat1',
      label: 'Electronics',
      slug: 'electronics',
      icon: '💻',
      isParent: true
    };

    store.getState().setCategory('cat1', categoryObject);

    expect(store.getState().formData.categoryId).toBe('cat1');
    expect(store.getState().selectedCategory).toEqual(categoryObject);
    expect(store.getState().selectedSubcategory).toBeNull();
  });

  it('should set subcategory with complete subcategory object', () => {
    const subcategoryObject = {
      value: 'sub1',
      label: 'Mobile Phones',
      slug: 'mobile-phones',
      icon: '📱',
      parentId: 'cat1'
    };

    store.getState().setSubcategory('sub1', subcategoryObject);

    expect(store.getState().formData.subcategoryId).toBe('sub1');
    expect(store.getState().selectedSubcategory).toEqual(subcategoryObject);
  });

  it('should clear subcategory when category changes', () => {
    // Set initial subcategory
    const subcategoryObject = {
      value: 'sub1',
      label: 'Mobile Phones',
      slug: 'mobile-phones',
      parentId: 'cat1'
    };
    store.getState().setSubcategory('sub1', subcategoryObject);

    // Change category
    const categoryObject = {
      value: 'cat1',
      label: 'Electronics',
      slug: 'electronics',
      icon: '💻',
      isParent: true
    };
    store.getState().setCategory('cat1', categoryObject);

    expect(store.getState().formData.categoryId).toBe('cat1');
    expect(store.getState().selectedCategory).toEqual(categoryObject);
    expect(store.getState().formData.subcategoryId).toBe('');
    expect(store.getState().selectedSubcategory).toBeNull();
  });

  it('should build complete category path when adding product to Firestore', async () => {
    // Set category and subcategory
    const categoryObject = {
      value: 'cat1',
      label: 'Electronics',
      slug: 'electronics',
      icon: '💻',
      isParent: true
    };
    
    const subcategoryObject = {
      value: 'sub1',
      label: 'Mobile Phones',
      slug: 'mobile-phones',
      icon: '📱',
      parentId: 'cat1'
    };

    store.getState().setCategory('cat1', categoryObject);
    store.getState().setSubcategory('sub1', subcategoryObject);

    // Mock product data
    const productData = {
      title: 'Test Product',
      description: 'Test Description',
      price: 100,
      categoryId: 'cat1',
      subcategoryId: 'sub1',
      imageUrls: ['http://example.com/image.jpg'],
      createdBy: 'user123',
      sellerEmail: 'seller@example.com',
      sellerName: 'Test Seller'
    };

    // Mock addDoc to resolve successfully
    const { addDoc } = require('firebase/firestore');
    addDoc.mockResolvedValue({ id: 'test-product-id' });

    // Call addProductToFirestore
    const result = await store.getState().addProductToFirestore(productData);

    // Verify the result
    expect(result).toBe('test-product-id');
    
    // Verify that addDoc was called with the correct data including category path
    expect(addDoc).toHaveBeenCalled();
    const callArgs = addDoc.mock.calls[0];
    const savedData = callArgs[1];
    
    expect(savedData.categoryPath).toEqual(['cat1', 'sub1']);
    expect(savedData.categoryNames).toEqual(['Electronics', 'Mobile Phones']);
    expect(savedData.categorySlugs).toEqual(['electronics', 'mobile-phones']);
    expect(savedData.categorySlug).toBe('electronics');
    expect(savedData.subcategorySlug).toBe('mobile-phones');
  });
});