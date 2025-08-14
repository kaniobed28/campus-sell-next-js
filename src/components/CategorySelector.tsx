"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Category } from '@/types/category';
import useCategoryStore from '@/stores/useCategoryStore';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  onCategoryChange: (categoryId: string, category: Category | null) => void;
  onSubcategoryChange: (subcategoryId: string, subcategory: Category | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
  showSearch?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId = '',
  selectedSubcategoryId = '',
  onCategoryChange,
  onSubcategoryChange,
  required = false,
  disabled = false,
  error,
  className = '',
  placeholder = 'Select a category...',
  showSearch = true,
}) => {
  const {
    categories,
    subcategories,
    loading,
    error: storeError,
    fetchCategories,
    fetchSubcategories,
    searchCategories,
    clearSearch,
  } = useCategoryStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get parent categories (categories without parentId)
  const parentCategories = categories.filter(cat => !cat.parentId);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchCategories intentionally omitted to prevent infinite loop

  // Update filtered categories when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = parentCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(parentCategories);
    }
  }, [searchTerm, parentCategories]);

  // Load subcategories when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find(cat => cat.id === selectedCategoryId);
      if (category) {
        setSelectedCategory(category);
        fetchSubcategories(selectedCategoryId);
      }
    } else {
      setSelectedCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, categories]); // fetchSubcategories intentionally omitted to prevent infinite loop

  // Set selected subcategory when subcategoryId changes
  useEffect(() => {
    if (selectedSubcategoryId) {
      const subcategory = subcategories.find(cat => cat.id === selectedSubcategoryId);
      setSelectedSubcategory(subcategory || null);
    } else {
      setSelectedSubcategory(null);
    }
  }, [selectedSubcategoryId, subcategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    onCategoryChange(category.id, category);
    
    // Clear subcategory selection when category changes
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      onSubcategoryChange('', null);
    }
    
    setIsOpen(false);
    setSearchTerm('');
    
    // Load subcategories for the selected category
    fetchSubcategories(category.id);
  };

  const handleSubcategorySelect = (subcategory: Category) => {
    setSelectedSubcategory(subcategory);
    onSubcategoryChange(subcategory.id, subcategory);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    onCategoryChange('', null);
    onSubcategoryChange('', null);
  };

  const handleClearSubcategory = () => {
    setSelectedSubcategory(null);
    onSubcategoryChange('', null);
  };

  const getDisplayText = () => {
    if (selectedCategory) {
      return selectedCategory.name;
    }
    return placeholder;
  };

  const getSubcategoryDisplayText = () => {
    if (selectedSubcategory) {
      return selectedSubcategory.name;
    }
    return 'Select a subcategory...';
  };

  return (
    <div className={`category-selector ${className}`}>
      {/* Main Category Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Category {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="relative" ref={dropdownRef}>
          {/* Category Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full px-4 py-3 text-left bg-background border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}
              ${error ? 'border-red-500' : 'border-border'}
              ${isOpen ? 'border-primary ring-2 ring-primary' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCategory?.icon && (
                  <span className="text-lg">{selectedCategory.icon}</span>
                )}
                <span className={selectedCategory ? 'text-foreground' : 'text-muted-foreground'}>
                  {getDisplayText()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedCategory && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearCategory();
                    }}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <svg
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
              {/* Search Input */}
              {showSearch && (
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    />
                    <svg
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Category List */}
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading categories...
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? 'No categories found' : 'No categories available'}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-muted transition-colors
                        ${selectedCategory?.id === category.id ? 'bg-primary/10 text-primary' : 'text-foreground'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {category.icon && (
                          <span className="text-lg">{category.icon}</span>
                        )}
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category Error */}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Subcategory Selector */}
      {selectedCategory && subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subcategory {required && <span className="text-red-500">*</span>}
          </label>
          
          <div className="relative">
            <select
              value={selectedSubcategoryId}
              onChange={(e) => {
                const subcategory = subcategories.find(cat => cat.id === e.target.value);
                handleSubcategorySelect(subcategory || {} as Category);
              }}
              disabled={disabled}
              className={`
                w-full px-4 py-3 bg-background border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                transition-colors duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${error ? 'border-red-500' : 'border-border'}
              `}
            >
              <option value="">{getSubcategoryDisplayText()}</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>

            {selectedSubcategory && !disabled && (
              <button
                type="button"
                onClick={handleClearSubcategory}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Store Error */}
      {storeError && (
        <p className="mt-2 text-sm text-red-500">{storeError}</p>
      )}
    </div>
  );
};

export default CategorySelector;