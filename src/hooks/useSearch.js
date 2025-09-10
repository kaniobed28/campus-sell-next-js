/**
 * useSearch Hook
 * Custom hook for managing search state and UI interactions
 */

import { useState, useCallback } from 'react';
import searchService from '@/services/searchService';

export const useSearch = (initialFilters = {}) => {
  // Search filters state
  const [filters, setFilters] = useState({
    query: '',
    categories: [],
    priceRange: { min: null, max: null },
    condition: [],
    tags: [],
    sellerId: null,
    dateRange: { start: null, end: null },
    inStock: false,
    onSale: false,
    ...initialFilters
  });

  // Sorting state
  const [sortOptions, setSortOptions] = useState({
    field: 'createdAt',
    direction: 'desc'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    lastDoc: null
  });

  // Search results state
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Facet counts for filters
  const [facetCounts, setFacetCounts] = useState({
    categories: {},
    conditions: {},
    priceRange: { min: 0, max: 1000 }
  });

  /**
   * Update search filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, page: 1, lastDoc: null }));
  }, []);

  /**
   * Update sorting option
   * @param {Object} sortOption - New sort option
   */
  const updateSort = useCallback((sortOption) => {
    setSortOptions(sortOption);
    
    // Reset pagination when sort changes
    setPagination(prev => ({ ...prev, page: 1, lastDoc: null }));
  }, []);

  /**
   * Update pagination
   * @param {Object} newPagination - New pagination values
   */
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  /**
   * Execute search operation
   */
  const executeSearch = useCallback(async () => {
    // Don't search if we're already loading
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchService.searchProducts(
        filters,
        sortOptions,
        pagination
      );
      
      setResults(searchResults.products.map(searchService.normalizeProduct));
      setTotalCount(searchResults.totalCount);
      setHasNextPage(searchResults.hasNextPage);
      setLastDoc(searchResults.lastDoc);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to execute search');
      // Reset results on error
      setResults([]);
      setTotalCount(0);
      setHasNextPage(false);
      setLastDoc(null);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortOptions, pagination, isLoading]);

  /**
   * Reset all search parameters
   */
  const resetSearch = useCallback(() => {
    setFilters({
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
    setSortOptions({
      field: 'createdAt',
      direction: 'desc'
    });
    setPagination({
      page: 1,
      limit: 20,
      lastDoc: null
    });
    setResults([]);
    setTotalCount(0);
    setHasNextPage(false);
    setLastDoc(null);
  }, []);

  /**
   * Get facet counts for filter options
   */
  const loadFacetCounts = useCallback(async () => {
    try {
      const counts = await searchService.getFacetCounts(filters);
      setFacetCounts(counts);
    } catch (err) {
      console.error('Error loading facet counts:', err);
    }
  }, [filters]);

  return {
    // State
    filters,
    sortOptions,
    pagination,
    results,
    totalCount,
    hasNextPage,
    lastDoc,
    isLoading,
    error,
    facetCounts,
    
    // Actions
    updateFilters,
    updateSort,
    updatePagination,
    executeSearch,
    resetSearch,
    loadFacetCounts
  };
};

export default useSearch;