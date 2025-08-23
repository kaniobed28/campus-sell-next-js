"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faMagnifyingGlass, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Button } from "./ui/Button";

/**
 * SearchModal component for mobile search experience
 * Provides full-screen search interface with touch-friendly interactions
 */
const SearchModal = ({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  isSearching, 
  setIsSearching, 
  products = [] 
}) => {
  const router = useRouter();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading recent searches:', error);
        }
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    saveRecentSearch(searchQuery);
    
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    onClose();
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.title);
    setShowSuggestions(false);
    saveRecentSearch(product.title);
    router.push(`/listings/${product.id}`);
    onClose();
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  };

  // Filter suggestions based on search query
  const suggestions = searchQuery.length > 0 
    ? products
        .filter(product => 
          product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <button
          className="p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus-ring theme-transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={onClose}
          aria-label="Close Search"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Search</h2>
        <div className="w-[44px]" /> {/* Spacer for centering */}
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-border bg-card">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search products, categories..."
              className="w-full px-4 py-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-ring focus:border-transparent theme-transition"
              aria-label="Search for products or categories"
              disabled={isSearching}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            className="px-6 py-3 min-h-[48px]"
            disabled={isSearching || !searchQuery.trim()}
            loading={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-card">
            <div className="px-4 py-2 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground">Suggestions</h3>
            </div>
            {suggestions.map((product, index) => (
              <button
                key={product.id || index}
                className="w-full px-4 py-4 text-left hover:bg-accent hover:text-accent-foreground theme-transition flex items-center gap-3 border-b border-border last:border-b-0 min-h-[56px]"
                onClick={() => handleSuggestionClick(product)}
              >
                <div className="w-10 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center text-sm">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base truncate">{product.title}</div>
                  <div className="text-sm text-muted-foreground">{product.category}</div>
                </div>
                <div className="text-base font-medium text-primary">
                  ${product.price}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {!showSuggestions && recentSearches.length > 0 && (
          <div className="bg-card">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Searches</h3>
              <button
                className="text-sm text-primary hover:text-accent theme-transition"
                onClick={clearRecentSearches}
              >
                Clear
              </button>
            </div>
            {recentSearches.map((query, index) => (
              <button
                key={index}
                className="w-full px-4 py-4 text-left hover:bg-accent hover:text-accent-foreground theme-transition flex items-center gap-3 border-b border-border last:border-b-0 min-h-[56px]"
                onClick={() => handleRecentSearchClick(query)}
              >
                <div className="w-10 h-10 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-base truncate">{query}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!showSuggestions && recentSearches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground text-sm">
              Find products, categories, and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;