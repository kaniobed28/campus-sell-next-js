/**
 * useSearch Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import useSearch from '@/hooks/useSearch';

// Mock the search service
jest.mock('@/services/searchService', () => ({
  __esModule: true,
  default: {
    searchProducts: jest.fn().mockResolvedValue({
      products: [],
      totalCount: 0,
      hasNextPage: false,
      lastDoc: null
    }),
    normalizeProduct: jest.fn(product => product),
    getFacetCounts: jest.fn().mockResolvedValue({
      categories: {},
      conditions: {},
      priceRange: { min: 0, max: 1000 }
    })
  }
}));

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSearch());
    
    expect(result.current.filters).toEqual({
      query: '',
      categories: [],
      priceRange: { min: null, max: null },
      condition: [],
      tags: [],
      sellerId: null,
      dateRange: { start: null, end: null },
      inStock: false,
      onSale: false
    });
    
    expect(result.current.sortOptions).toEqual({
      field: 'createdAt',
      direction: 'desc'
    });
    
    expect(result.current.pagination).toEqual({
      page: 1,
      limit: 20,
      lastDoc: null
    });
    
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should update filters correctly', () => {
    const { result } = renderHook(() => useSearch());
    
    act(() => {
      result.current.updateFilters({ query: 'test search' });
    });
    
    expect(result.current.filters.query).toBe('test search');
  });

  it('should update sort options correctly', () => {
    const { result } = renderHook(() => useSearch());
    
    act(() => {
      result.current.updateSort({ field: 'price', direction: 'asc' });
    });
    
    expect(result.current.sortOptions).toEqual({
      field: 'price',
      direction: 'asc'
    });
  });

  it('should reset search correctly', () => {
    const { result } = renderHook(() => useSearch({
      query: 'initial query'
    }));
    
    // Verify initial state
    expect(result.current.filters.query).toBe('initial query');
    
    act(() => {
      result.current.resetSearch();
    });
    
    // Verify reset state
    expect(result.current.filters.query).toBe('');
    expect(result.current.results).toEqual([]);
  });
});