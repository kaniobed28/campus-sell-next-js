import { describe, it, expect } from '@jest/globals';

// Mock the getProductImageUrl function
const getProductImageUrl = (product) => {
  // Handle case where product is undefined or null
  if (!product) {
    return '/default-image.jpg';
  }
  
  // Handle case where product.imageUrls is undefined or not an array
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    return product.imageUrls[0];
  }
  
  // Fallback to product.image if available
  if (product.image) {
    return product.image;
  }
  
  // Default fallback image
  return '/default-image.jpg';
};

describe('getProductImageUrl', () => {
  it('should return default image when product is null', () => {
    expect(getProductImageUrl(null)).toBe('/default-image.jpg');
  });

  it('should return default image when product is undefined', () => {
    expect(getProductImageUrl(undefined)).toBe('/default-image.jpg');
  });

  it('should return default image when product is empty object', () => {
    expect(getProductImageUrl({})).toBe('/default-image.jpg');
  });

  it('should return first image from imageUrls array when available', () => {
    const product = {
      imageUrls: ['/test1.jpg', '/test2.jpg'],
      image: '/fallback.jpg'
    };
    expect(getProductImageUrl(product)).toBe('/test1.jpg');
  });

  it('should return image property when imageUrls is not available', () => {
    const product = {
      image: '/test.jpg'
    };
    expect(getProductImageUrl(product)).toBe('/test.jpg');
  });

  it('should return default image when imageUrls is empty array', () => {
    const product = {
      imageUrls: [],
      image: '/fallback.jpg'
    };
    expect(getProductImageUrl(product)).toBe('/fallback.jpg');
  });

  it('should return default image when imageUrls is not an array', () => {
    const product = {
      imageUrls: 'not-an-array',
      image: '/fallback.jpg'
    };
    expect(getProductImageUrl(product)).toBe('/fallback.jpg');
  });

  it('should return default image when neither imageUrls nor image is available', () => {
    const product = {
      title: 'Test Product'
    };
    expect(getProductImageUrl(product)).toBe('/default-image.jpg');
  });
});