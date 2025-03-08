// src/components/HeroSection.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For navigation to search results

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState([]); // Mock product list
  const router = useRouter();

  // Mock product data (replace with Firebase fetch later)
  useEffect(() => {
    // Simulate fetching products from Firebase
    const mockProducts = [
      { id: "5kztIYBg2MLeVlwIXine", title: "54y4t", price: 45, category: "Home" },
      { id: "CLvDfuyypdTaIbHU3SZA", title: "Laptop", price: 800, category: "Electronics" },
      // Add more mock data as needed
    ];
    setProducts(mockProducts);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return; // Prevent empty searches
    }

    setIsSearching(true);
    // Filter products based on search query (case-insensitive)
    const filteredProducts = products.filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Navigate to a search results page (e.g., /search?q={searchQuery})
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    // For now, log the results (replace with actual navigation logic)
    console.log("Search Results:", filteredProducts);
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <section className="bg-background text-foreground py-16 dark:bg-primary-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Campus Sell
        </h1>
        <p className="text-lg mb-6">
          Buy, sell, and trade within your campus community.
        </p>
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto shadow-lg rounded-md">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search for products, categories..."
            className="w-full px-4 py-3 rounded-l-md focus:outline-none bg-background text-foreground border border-gray-300 dark:bg-background-dark dark:text-foreground-dark dark:border-gray-700 focus:ring-2 focus:ring-accent focus:border-transparent transition"
            aria-label="Search for products or categories"
            disabled={isSearching}
          />
          <button
            type="submit"
            className="absolute right-0 px-4 py-3 bg-accent text-white rounded-r-md hover:bg-secondary dark:bg-accent-dark dark:hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={isSearching}
            aria-label="Submit search"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>
        {isSearching && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</p>
        )}
      </div>
    </section>
  );
};

export default HeroSection;