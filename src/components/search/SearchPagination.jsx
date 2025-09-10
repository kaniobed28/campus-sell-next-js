/**
 * SearchPagination Component
 * Handles pagination UI
 */

import React from 'react';
import { Button } from '@/components/ui/Button';

const SearchPagination = ({ 
  currentPage, 
  totalPages, 
  hasNextPage, 
  onPageChange,
  limit,
  onLimitChange
}) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    onLimitChange(newLimit);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="search-pagination flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* Results per page selector */}
      <div className="flex items-center">
        <label htmlFor="limit-select" className="mr-2 text-sm">
          Results per page:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={handleLimitChange}
          className="border border-input bg-background rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        
        {getPageNumbers().map(pageNumber => (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "primary" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
      
      {/* Page info */}
      <div className="text-sm text-muted-foreground">
        Page {currentPage}
      </div>
    </div>
  );
};

export default SearchPagination;