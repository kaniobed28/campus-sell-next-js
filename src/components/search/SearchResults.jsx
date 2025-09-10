/**
 * SearchResults Component
 * Displays search results
 */

import React from 'react';
import ProductGrid from '@/components/ProductGrid';
import Loading from '@/components/Loading';
import NotFound from '@/components/NotFound';

const SearchResults = ({ 
  results, 
  isLoading, 
  error, 
  totalCount,
  onProductClick 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-center text-destructive font-medium">
          {error}
        </p>
        <p className="text-center text-muted-foreground mt-2">
          Please try again later
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <NotFound 
          title="No results found"
          message="Try adjusting your search filters or search terms"
        />
      </div>
    );
  }

  return (
    <div className="search-results">
      {/* Results summary */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {results.length} of {totalCount} results
        </p>
      </div>
      
      {/* Product grid */}
      <ProductGrid 
        products={results.map(product => ({
          ...product,
          link: `/listings/${product.id}`
        }))}
        onProductClick={onProductClick}
      />
    </div>
  );
};

export default SearchResults;