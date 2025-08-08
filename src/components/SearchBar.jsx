"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

const SearchBar = ({ searchQuery, setSearchQuery, isSearching, setIsSearching, products }) => {
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setIsSearching(true);
    setShowSuggestions(false);
    
    const filteredProducts = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    console.log("Search Results:", filteredProducts);
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const suggestions = products
    .filter(product => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Search products, categories..."
          className="input-base flex-1 rounded-l-md rounded-r-none border-r-0 focus:ring-0 focus:border-input"
          aria-label="Search for products or categories"
          disabled={isSearching}
        />
        <Button
          type="submit"
          variant="primary"
          className="rounded-l-none px-4"
          disabled={isSearching || !searchQuery.trim()}
          loading={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((product, index) => (
            <button
              key={product.id || index}
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground theme-transition flex items-center gap-3"
              onClick={() => {
                setSearchQuery(product.title);
                setShowSuggestions(false);
                router.push(`/listings/${product.id}`);
              }}
            >
              <div className="w-8 h-8 bg-muted rounded flex-shrink-0 flex items-center justify-center text-xs">
                📦
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{product.title}</div>
                <div className="text-xs text-muted-foreground">{product.category}</div>
              </div>
              <div className="text-sm font-medium text-primary">
                ${product.price}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;