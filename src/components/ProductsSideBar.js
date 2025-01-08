"use client";

import React, { useState } from "react";
import { useProductStore } from "../app/stores/useProductStore";

const ProductsSidebar = () => {
  const { filters, setFilters } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleResetFilters = () => {
    setFilters({ category: "All", priceRange: [0, 1000], search: "" });
    setSearchQuery("");
  };

  return (
    <aside className="w-1/4 p-4 bg-gray-100 h-screen">
      <h3 className="font-bold text-lg mb-4">Filters</h3>

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setFilters({ search: e.target.value });
          }}
        />
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
        >
          <option>All</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Accessories</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Price Range</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            className="w-20 rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Min"
            value={filters.priceRange[0]}
            onChange={(e) =>
              setFilters({ priceRange: [Number(e.target.value), filters.priceRange[1]] })
            }
          />
          <span>to</span>
          <input
            type="number"
            className="w-20 rounded-md border-gray-300 shadow-sm focus:ring-primary focus:border-primary"
            placeholder="Max"
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters({ priceRange: [filters.priceRange[0], Number(e.target.value)] })
            }
          />
        </div>
      </div>

      {/* Reset Button */}
      <button
        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
        onClick={handleResetFilters}
      >
        Reset Filters
      </button>
    </aside>
  );
};

export default ProductsSidebar;
