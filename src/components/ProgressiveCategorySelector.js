/**
 * ProgressiveCategorySelector - Category selector that works with progressive loading
 * Uses fallback data immediately and updates when real data becomes available
 */

"use client";
import React, { useEffect, useState } from 'react';
import { getCategoryOptions, isUsingFallbackData } from '@/lib/fallbackData';
import { subscribeToCategories } from '@/lib/progressiveLoader';

const ProgressiveCategorySelector = ({
  selectedCategoryId = '',
  selectedSubcategoryId = '',
  onCategoryChange,
  onSubcategoryChange,
  required = false,
  disabled = false,
  error,
  className = '',
}) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  // Load initial category options
  useEffect(() => {
    const options = getCategoryOptions();
    setCategoryOptions(options);
    setIsUsingFallback(isUsingFallbackData());
  }, []);

  // Subscribe to category updates
  useEffect(() => {
    const unsubscribe = subscribeToCategories((realCategories) => {
      console.log('Received real category data, updating options...');
      const realOptions = convertCategoriesToOptions(realCategories);
      setCategoryOptions(realOptions);
      setIsUsingFallback(false);
    });

    return unsubscribe;
  }, []);

  // Update subcategory options when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const subcategories = categoryOptions.filter(
        option => option.parentId === selectedCategoryId
      );
      setSubcategoryOptions(subcategories);
    } else {
      setSubcategoryOptions([]);
    }
  }, [selectedCategoryId, categoryOptions]);

  // Convert categories to options format
  const convertCategoriesToOptions = (categories) => {
    const options = [];
    
    categories.forEach(parent => {
      options.push({
        value: parent.id,
        label: parent.name,
        slug: parent.slug,
        icon: parent.icon,
        isParent: true
      });
      
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach(child => {
          options.push({
            value: child.id,
            label: child.name,
            slug: child.slug,
            icon: child.icon,
            parentId: parent.id
          });
        });
      }
    });
    
    return options;
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categoryOptions.find(opt => opt.value === categoryId);
    
    console.log('ProgressiveCategorySelector - Category selected:', categoryId, category);
    console.log('Available options:', categoryOptions);
    
    onCategoryChange(categoryId, category);
    
    // Clear subcategory when category changes
    if (selectedSubcategoryId) {
      onSubcategoryChange('', null);
    }
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    const subcategory = subcategoryOptions.find(opt => opt.value === subcategoryId);
    
    onSubcategoryChange(subcategoryId, subcategory);
  };

  // Get parent categories only
  const parentCategories = categoryOptions.filter(opt => opt.isParent);

  return (
    <div className={`progressive-category-selector ${className}`}>
      {/* Fallback indicator */}
      {isUsingFallback && (
        <div className="mb-2 text-xs text-blue-600 flex items-center gap-1">
          <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
          Loading full category list...
        </div>
      )}

      {/* Main Category Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Category {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative">
          <select
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            disabled={disabled}
            className={`
              w-full px-4 py-3 bg-background border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${error ? 'border-red-500' : 'border-border'}
            `}
          >
            <option value="">Select a category...</option>
            {parentCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon ? `${category.icon} ${category.label}` : category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Error */}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Subcategory Selector */}
      {selectedCategoryId && subcategoryOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subcategory
          </label>
          
          <div className="relative">
            <select
              value={selectedSubcategoryId}
              onChange={handleSubcategoryChange}
              disabled={disabled}
              className={`
                w-full px-4 py-3 bg-background border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-colors duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                border-border
              `}
            >
              <option value="">Select a subcategory (optional)...</option>
              {subcategoryOptions.map((subcategory) => (
                <option key={subcategory.value} value={subcategory.value}>
                  {subcategory.icon ? `${subcategory.icon} ${subcategory.label}` : subcategory.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Help text for fallback mode */}
      {isUsingFallback && (
        <p className="mt-2 text-xs text-muted-foreground">
          Basic categories are available now. Full category list will load automatically.
        </p>
      )}
    </div>
  );
};

export default ProgressiveCategorySelector;