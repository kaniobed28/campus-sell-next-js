/**
 * SearchPage Component
 * Main search page component using new search components
 */

"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useSearch from '@/hooks/useSearch';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';
import SearchSort from '@/components/search/SearchSort';
import SearchPagination from '@/components/search/SearchPagination';
import { useResponsiveSpacing } from '@/hooks/useViewport';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const spacing = useResponsiveSpacing();

  const {
    filters,
    sortOptions,
    pagination,
    results,
    totalCount,
    hasNextPage,
    isLoading,
    error,
    facetCounts,
    updateFilters,
    updateSort,
    updatePagination,
    executeSearch,
    loadFacetCounts,
    resetSearch
  } = useSearch();

  // Refs to track previous values
  const prevFilters = useRef(null);
  const prevSortOptions = useRef(null);
  const prevPagination = useRef(null);

  // Execute initial search
  useEffect(() => {
    const initSearch = async () => {
      if (initialQuery) {
        updateFilters({ query: initialQuery });
      }
      
      // Perform initial search
      await executeSearch();
      await loadFacetCounts();
      
      // Set initial refs after first search
      prevFilters.current = JSON.stringify(filters);
      prevSortOptions.current = JSON.stringify(sortOptions);
      prevPagination.current = JSON.stringify(pagination);
    };
    
    initSearch();
  }, []); // Empty dependency array to run only once on mount

  // Handle search when filters, sort options, or pagination change
  useEffect(() => {
    // Skip on initial render
    if (prevFilters.current === null) return;
    
    const currentFilters = JSON.stringify(filters);
    const currentSortOptions = JSON.stringify(sortOptions);
    const currentPagination = JSON.stringify(pagination);
    
    // Check if any relevant values have actually changed
    const filtersChanged = prevFilters.current !== currentFilters;
    const sortOptionsChanged = prevSortOptions.current !== currentSortOptions;
    const paginationChanged = prevPagination.current !== currentPagination;
    
    // Update refs
    prevFilters.current = currentFilters;
    prevSortOptions.current = currentSortOptions;
    prevPagination.current = currentPagination;
    
    // Only execute search if something actually changed
    if (filtersChanged || sortOptionsChanged || paginationChanged) {
      executeSearch();
    }
  }, [filters, sortOptions, pagination, executeSearch]);

  // Handle facet counts when filters change
  useEffect(() => {
    // Skip on initial render
    if (prevFilters.current === null) return;
    
    const currentFilters = JSON.stringify(filters);
    const filtersChanged = prevFilters.current !== currentFilters;
    
    if (filtersChanged) {
      loadFacetCounts();
    }
    
    // Update refs
    prevFilters.current = currentFilters;
  }, [filters, loadFacetCounts]);

  const handlePageChange = (newPage) => {
    updatePagination({
      page: newPage,
      lastDoc: newPage === 1 ? null : pagination.lastDoc
    });
  };

  const handleLimitChange = (newLimit) => {
    updatePagination({
      limit: newLimit,
      page: 1,
      lastDoc: null
    });
  };

  const handleProductClick = (product) => {
    // Handle product click if needed
    console.log('Product clicked:', product);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    updateFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (newSort) => {
    updateSort(newSort);
  };

  return (
    <div className={`container mx-auto ${spacing.container} py-8 md:py-16`}>
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Search Results
        </h1>
        {filters.query && (
          <p className="text-base sm:text-lg text-muted-foreground">
            Showing results for "{filters.query}"
          </p>
        )}
        {!isLoading && !error && (
          <p className="text-sm text-muted-foreground mt-1">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-1/4">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            facetCounts={facetCounts}
          />
        </div>

        {/* Main content area */}
        <div className="lg:w-3/4">
          {/* Sort controls */}
          <div className="flex justify-between items-center mb-6">
            <SearchSort
              sortOptions={sortOptions}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Search results */}
          <SearchResults
            results={results}
            isLoading={isLoading}
            error={error}
            totalCount={totalCount}
            onProductClick={handleProductClick}
          />

          {/* Pagination */}
          {results.length > 0 && (
            <SearchPagination
              currentPage={pagination.page}
              totalPages={Math.ceil(totalCount / pagination.limit)}
              hasNextPage={hasNextPage}
              onPageChange={handlePageChange}
              limit={pagination.limit}
              onLimitChange={handleLimitChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Export with Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}