/**
 * SearchFilters Component
 * Renders and manages search filter UI
 */

import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SearchFilters = ({ filters, onFiltersChange, facetCounts }) => {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    condition: true,
    tags: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePriceChange = (values) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    });
  };

  const handleConditionChange = (condition) => {
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter(c => c !== condition)
      : [...filters.condition, condition];
    
    onFiltersChange({ ...filters, condition: newConditions });
  };

  const handleTagChange = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleInStockChange = (e) => {
    onFiltersChange({ ...filters, inStock: e.target.checked });
  };

  const handleOnSaleChange = (e) => {
    onFiltersChange({ ...filters, onSale: e.target.checked });
  };

  // Mock category data - in a real app, this would come from the category service
  const categories = [
    { id: 'electronics-technology', name: 'Electronics & Technology' },
    { id: 'fashion-accessories', name: 'Fashion & Accessories' },
    { id: 'books-education', name: 'Books & Education' },
    { id: 'home-living', name: 'Home & Living' },
    { id: 'sports-recreation', name: 'Sports & Recreation' }
  ];

  // Mock condition data
  const conditions = [
    { id: 'new', name: 'New' },
    { id: 'like-new', name: 'Like New' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' },
    { id: 'poor', name: 'Poor' }
  ];

  // Mock tag data
  const tags = [
    { id: 'featured', name: 'Featured' },
    { id: 'popular', name: 'Popular' },
    { id: 'trending', name: 'Trending' },
    { id: 'limited', name: 'Limited Edition' },
    { id: 'eco-friendly', name: 'Eco-Friendly' }
  ];

  return (
    <div className="search-filters bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      {/* Categories Filter */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left font-medium py-2"
          onClick={() => toggleSection('categories')}
        >
          <span>Categories</span>
          <span>{expandedSections.categories ? '−' : '+'}</span>
        </button>
        
        {expandedSections.categories && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {categories.map(category => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">
                  {category.name}
                  {facetCounts.categories[category.id] && (
                    <span className="text-muted-foreground ml-1">
                      ({facetCounts.categories[category.id]})
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left font-medium py-2"
          onClick={() => toggleSection('price')}
        >
          <span>Price Range</span>
          <span>{expandedSections.price ? '−' : '+'}</span>
        </button>
        
        {expandedSections.price && (
          <div className="mt-2">
            <div className="px-2">
              <Slider
                range
                min={facetCounts.priceRange?.min || 0}
                max={facetCounts.priceRange?.max || 1000}
                value={[
                  filters.priceRange.min || facetCounts.priceRange?.min || 0,
                  filters.priceRange.max || facetCounts.priceRange?.max || 1000
                ]}
                onChange={handlePriceChange}
                className="py-4"
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>${filters.priceRange.min || facetCounts.priceRange?.min || 0}</span>
              <span>${filters.priceRange.max || facetCounts.priceRange?.max || 1000}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Condition Filter */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left font-medium py-2"
          onClick={() => toggleSection('condition')}
        >
          <span>Condition</span>
          <span>{expandedSections.condition ? '−' : '+'}</span>
        </button>
        
        {expandedSections.condition && (
          <div className="mt-2 space-y-2">
            {conditions.map(condition => (
              <label key={condition.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.condition.includes(condition.id)}
                  onChange={() => handleConditionChange(condition.id)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">
                  {condition.name}
                  {facetCounts.conditions[condition.id] && (
                    <span className="text-muted-foreground ml-1">
                      ({facetCounts.conditions[condition.id]})
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {/* Tags Filter */}
      <div className="mb-6">
        <button
          className="flex justify-between items-center w-full text-left font-medium py-2"
          onClick={() => toggleSection('tags')}
        >
          <span>Tags</span>
          <span>{expandedSections.tags ? '−' : '+'}</span>
        </button>
        
        {expandedSections.tags && (
          <div className="mt-2 space-y-2">
            {tags.map(tag => (
              <label key={tag.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">{tag.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {/* Additional Filters */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={handleInStockChange}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">In Stock Only</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={handleOnSaleChange}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">On Sale</span>
        </label>
      </div>
    </div>
  );
};

export default SearchFilters;