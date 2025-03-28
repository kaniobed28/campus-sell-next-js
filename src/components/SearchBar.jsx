"use client";

import React from "react";
import { useRouter } from "next/navigation";

const SearchBar = ({ searchQuery, setSearchQuery, isSearching, setIsSearching, products }) => {
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setIsSearching(true);
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
  };

  return (
    <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-6">
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Search for products, categories..."
        className="w-full px-4 py-2 rounded-l-lg border border-primary focus:outline-none focus:ring-2 focus:ring-secondary shadow-sm dark:border-primary-dark dark:bg-background-dark dark:text-foreground-dark"
        aria-label="Search for products or categories"
        disabled={isSearching}
      />
      <button
        type="submit"
        className="px-6 bg-accent text-foreground rounded-r-lg hover:bg-accent-dark transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSearching}
        aria-label="Submit search"
      >
        {isSearching ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;