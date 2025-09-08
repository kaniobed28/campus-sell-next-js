"use client";

import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useProductStore } from "../app/stores/useProductStore";
import { Button } from "./ui/Button";

const ProductsSidebar = () => {
  const { filters, setFilters, applyFilters } = useProductStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categories, setCategories] = useState([
    "All",
    "Fashion",
    "Electronics",
    "Home",
    "Books",
    "Sports",
    "Accessories",
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleResetFilters = () => {
    setFilters({ category: "All", priceRange: [0, 1000], search: "" });
    setSearchQuery("");
    setCategoryQuery("");
    applyFilters();
  };

  const handlePriceChange = (value) => {
    setFilters({ priceRange: value });
    applyFilters();
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(categoryQuery.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-1/4 p-6 bg-card border-r border-border h-auto lg:h-screen overflow-y-auto theme-transition">
      <div className="space-y-6">
        {/* Search Bar */}
        <div>
          <label className="form-label mb-2 block">Search Products</label>
          <div className="relative">
            <input
              type="text"
              className="input-base w-full rounded-md px-4 py-2 pr-10"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFilters({ search: e.target.value });
                applyFilters();
              }}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-accent theme-transition">
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
        <div>
          <label className="form-label mb-2 block">Categories</label>
          <div className="relative">
            <button
              className="input-base w-full flex justify-between items-center rounded-md px-4 py-2 focus-ring"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className={filters.category === "All" ? "text-muted-foreground" : "text-foreground"}>
                {filters.category || "Select a Category"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="input-base w-full rounded-md px-3 py-1 text-sm"
                  />
                </div>
                <ul className="py-1">
                  {filteredCategories.map((category) => (
                    <li key={category}>
                      <button
                        className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground theme-transition text-sm"
                        onClick={() => {
                          setFilters({ category });
                          setIsDropdownOpen(false);
                          applyFilters();
                        }}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Filter by Price */}
        <div>
          <label className="form-label mb-4 block">Price Range</label>
          <div className="mb-4 px-2">
            <Slider
              range
              min={0}
              max={1000}
              defaultValue={filters.priceRange}
              value={filters.priceRange}
              onChange={handlePriceChange}
              allowCross={false}
              trackStyle={[{ backgroundColor: "var(--accent)" }]}
              handleStyle={[
                { borderColor: "var(--accent)", backgroundColor: "var(--accent)" },
                { borderColor: "var(--accent)", backgroundColor: "var(--accent)" },
              ]}
              railStyle={{ backgroundColor: "var(--muted)" }}
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleResetFilters}
        >
          Reset Filters
        </Button>
      </div>
    </aside>
  );
};

export default ProductsSidebar;