"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/Button";
import { useViewport } from "@/hooks/useViewport";

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  setIsSearching, 
  products = [],
  className = "",
  variant = "default" // "default", "compact", "modal"
}) => {
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { isMobile, isTablet, isDesktop, isTouchDevice } = useViewport();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setIsSearching(true);
    setShowSuggestions(false);
    setIsFocused(false);
    
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    
    // Save to recent searches
    if (typeof window !== 'undefined') {
      const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setIsFocused(false);
    }, 200);
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.title);
    setShowSuggestions(false);
    setIsFocused(false);
    router.push(`/listings/${product.id}`);
  };

  const suggestions = searchQuery.length > 0 
    ? products
        .filter(product => 
          product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Responsive sizing based on device and variant
  const getInputClasses = () => {
    const baseClasses = "flex-1 border border-input bg-background focus:ring-2 focus:ring-ring focus:border-transparent theme-transition";
    
    if (variant === "modal") {
      return `${baseClasses} px-4 py-3 text-base rounded-md`;
    }
    
    if (variant === "compact") {
      return `${baseClasses} px-3 py-2 text-sm rounded-l-md rounded-r-none border-r-0`;
    }
    
    // Default variant - responsive sizing
    if (isMobile) {
      return `${baseClasses} px-4 py-3 text-base rounded-l-md rounded-r-none border-r-0`;
    } else if (isTablet) {
      return `${baseClasses} px-3 py-2.5 text-sm rounded-l-md rounded-r-none border-r-0`;
    } else {
      return `${baseClasses} px-3 py-2 text-sm rounded-l-md rounded-r-none border-r-0`;
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "rounded-l-none";
    
    if (variant === "modal") {
      return `${baseClasses} px-6 py-3 min-h-[48px]`;
    }
    
    if (variant === "compact") {
      return `${baseClasses} px-3`;
    }
    
    // Default variant - responsive sizing
    if (isMobile) {
      return `${baseClasses} px-4 min-h-[48px]`;
    } else {
      return `${baseClasses} px-4`;
    }
  };

  const getSuggestionsClasses = () => {
    const baseClasses = "absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto";
    
    if (variant === "modal") {
      return `${baseClasses} max-h-80`;
    }
    
    return baseClasses;
  };

  const getSuggestionItemClasses = () => {
    const baseClasses = "w-full text-left hover:bg-accent hover:text-accent-foreground theme-transition flex items-center gap-3 border-b border-border last:border-b-0";
    
    if (isTouchDevice || isMobile) {
      return `${baseClasses} px-4 py-3 min-h-[56px]`;
    } else {
      return `${baseClasses} px-4 py-2`;
    }
  };

  return (
    <div className={`relative w-full ${variant === "modal" ? "max-w-none" : "max-w-md"} ${className}`}>
      <form onSubmit={handleSearch} className="flex">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={variant === "compact" ? "Search..." : "Search products, categories..."}
            className={getInputClasses()}
            aria-label="Search for products or categories"
            disabled={isSearching}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {/* Search icon for better visual feedback */}
          {variant !== "modal" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          className={getButtonClasses()}
          disabled={isSearching || !searchQuery.trim()}
          loading={isSearching}
          aria-label="Search"
        >
          {variant === "compact" ? (
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
          ) : (
            isSearching ? "Searching..." : "Search"
          )}
        </Button>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className={getSuggestionsClasses()}>
          {suggestions.map((product, index) => (
            <button
              key={product.id || index}
              className={getSuggestionItemClasses()}
              onClick={() => handleSuggestionClick(product)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              <div className={`bg-muted rounded flex-shrink-0 flex items-center justify-center ${
                isMobile ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
              }`}>
                📦
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                  {product.title}
                </div>
                <div className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-xs'}`}>
                  {product.category}
                </div>
              </div>
              <div className={`font-medium text-primary ${isMobile ? 'text-base' : 'text-sm'}`}>
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