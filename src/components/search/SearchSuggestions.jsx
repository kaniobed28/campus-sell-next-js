/**
 * SearchSuggestions Component
 * Displays search suggestions for autocomplete
 */

import React from 'react';

const SearchSuggestions = ({ suggestions, onSelect, isVisible }) => {
  if (!isVisible || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;