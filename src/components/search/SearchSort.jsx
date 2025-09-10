/**
 * SearchSort Component
 * Provides sorting options UI
 */

import React from 'react';

const SearchSort = ({ sortOptions, onSortChange }) => {
  const sortOptionsList = [
    { id: 'relevance', name: 'Relevance', field: 'createdAt', direction: 'desc' },
    { id: 'price-asc', name: 'Price: Low to High', field: 'price', direction: 'asc' },
    { id: 'price-desc', name: 'Price: High to Low', field: 'price', direction: 'desc' },
    { id: 'newest', name: 'Newest First', field: 'createdAt', direction: 'desc' },
    { id: 'popular', name: 'Most Popular', field: 'viewCount', direction: 'desc' }
  ];

  const handleSortChange = (e) => {
    const selectedOption = sortOptionsList.find(option => option.id === e.target.value);
    if (selectedOption) {
      onSortChange({
        field: selectedOption.field,
        direction: selectedOption.direction
      });
    }
  };

  // Find the current selected option ID
  const currentSortId = sortOptionsList.find(
    option => option.field === sortOptions.field && option.direction === sortOptions.direction
  )?.id || 'relevance';

  return (
    <div className="search-sort flex items-center">
      <label htmlFor="sort-select" className="mr-2 text-sm font-medium">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={currentSortId}
        onChange={handleSortChange}
        className="border border-input bg-background rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        {sortOptionsList.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchSort;