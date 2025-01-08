"use client";

import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css"; // Import the slider's CSS
import { useProductStore } from "../app/stores/useProductStore";

const ProductsSidebar = () => {
  const { filters, setFilters, applyFilters } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState(""); // Search for categories
  const [categories, setCategories] = useState([
    "Fashion",
    "Electronics",
    "Home",
    "Trending",
    "Popular",
    "Books",
    "Sports",
    "Accessories",
  ]); // Example categories
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For dropdown toggle

  const handleResetFilters = () => {
    setFilters({ category: "All", priceRange: [0, 1000], search: "" });
    setSearchQuery("");
    setCategoryQuery("");
    applyFilters(); // Ensure filters are reset and applied
  };

  const handlePriceChange = (value) => {
    setFilters({ priceRange: value });
    applyFilters(); // Apply updated price filters
  };

  const handleApplyFilters = () => {
    applyFilters(); // Apply filters explicitly
  };

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  
  return (
    <aside className="w-full lg:w-1/4 p-6 bg-background dark:bg-background-dark shadow-md h-auto lg:h-screen overflow-y-auto">
      {/* Search Bar */}
      <div className="mb-6">
        <label className="sr-only">Search</label>
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-full border-gray-300 dark:border-foreground-dark shadow-sm focus:ring-accent focus:border-accent dark:focus:ring-accent-dark dark:focus:border-accent-dark px-4 py-2"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFilters({ search: e.target.value });
              applyFilters(); // Apply updated search filters
            }}
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent text-white rounded-full p-2 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M10 4a6 6 0 106 6 6 6 0 00-6-6z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-bold text-lg text-primary dark:text-primary-dark mb-4">
          Categories
        </h3>
        <div className="relative">
          <button
            className="w-full flex justify-between items-center border border-gray-300 dark:border-foreground-dark rounded-md px-4 py-2 focus:ring-accent focus:border-accent dark:focus:ring-accent-dark dark:focus:border-accent-dark"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {filters.category || "Select a Category"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-background-dark border border-gray-300 dark:border-foreground-dark rounded-md shadow-lg max-h-48 overflow-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categoryQuery}
                  onChange={(e) => setCategoryQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-foreground-dark px-3 py-1 focus:ring-accent focus:border-accent dark:focus:ring-accent-dark dark:focus:border-accent-dark"
                />
              </div>
              <ul>
                {filteredCategories.map((category) => (
                  <li
                    key={category}
                    className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-foreground-dark cursor-pointer"
                    onClick={() => {
                      setFilters({ category });
                      setIsDropdownOpen(false);
                      applyFilters(); // Apply updated category filters
                    }}
                  >
                    {category}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Filter by Price */}
      <div className="mb-6">
        <h3 className="font-bold text-lg text-primary dark:text-primary-dark mb-4">
          Filter by Price
        </h3>
        <div className="mb-4">
          <Slider
            range
            min={0}
            max={1000}
            defaultValue={filters.priceRange}
            value={filters.priceRange}
            onChange={handlePriceChange}
            allowCross={false}
            trackStyle={[{ backgroundColor: "#1e40af" }]} // Customize the slider colors
            handleStyle={[
              { borderColor: "#38bdf8", backgroundColor: "#1e40af" },
              { borderColor: "#38bdf8", backgroundColor: "#1e40af" },
            ]}
            railStyle={{ backgroundColor: "#d1d5db" }}
          />
          <p className="text-sm text-foreground dark:text-foreground-dark mt-2">
            Price: ${filters.priceRange[0]} – ${filters.priceRange[1]}
          </p>
        </div>
        <button
          className="w-full bg-accent text-white py-2 rounded-md hover:bg-accent-dark transition"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </button>
      </div>

      {/* Reset Button */}
      <button
        className="w-full bg-danger dark:bg-danger-dark text-white py-2 rounded-md hover:bg-red-600 transition"
        onClick={handleResetFilters}
      >
        Reset Filters
      </button>
    </aside>
  );
};

export default ProductsSidebar;
