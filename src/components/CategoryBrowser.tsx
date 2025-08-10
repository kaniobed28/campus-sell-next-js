"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Category, CategoryTreeNode } from '@/types/category';
import useCategoryStore from '@/stores/useCategoryStore';
import Loading from '@/components/Loading';
import InitializeCategoriesButton from '@/components/InitializeCategoriesButton';
import CategoryDebug from '@/components/CategoryDebug';
// import { useNotification } from '@/contexts/NotificationContext';

interface CategoryBrowserProps {
  viewMode?: 'grid' | 'list';
  showSearch?: boolean;
  showProductCounts?: boolean;
  maxColumns?: number;
  className?: string;
}

const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  viewMode = 'grid',
  showSearch = true,
  showProductCounts = true,
  maxColumns = 4,
  className = '',
}) => {
  const {
    categoryTree,
    loading,
    error,
    searchTerm,
    searchResults,
    fetchCategoryTree,
    searchCategories,
    clearSearch,
    clearError,
  } = useCategoryStore();

  // const { showSuccess } = useNotification();
  const showSuccess = (title: string, message: string, actionText?: string, actionHref?: string) => 
    console.log('Success:', title, message);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);

  useEffect(() => {
    // fetchCategoryTree(); // Temporarily disabled for debugging
    console.log('CategoryBrowser mounted');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchCategoryTree intentionally omitted to prevent infinite loop

  const handleSearch = async (term: string) => {
    setLocalSearchTerm(term);
    if (term.trim()) {
      await searchCategories(term);
    } else {
      clearSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    clearSearch();
  };

  const categoriesToDisplay = searchTerm ? searchResults : categoryTree;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Categories</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchCategoryTree();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`category-browser ${className}`}>
      {/* Header with Search and View Toggle */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {searchTerm ? 'Search Results' : 'Browse Categories'}
            </h1>
            <p className="text-muted-foreground">
              {searchTerm 
                ? `Found ${categoriesToDisplay.length} categories matching "${searchTerm}"`
                : 'Discover products organized by category'
              }
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-card rounded-lg p-1 border">
            <button
              onClick={() => setCurrentViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                currentViewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                currentViewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-6 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={localSearchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {localSearchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Categories Display */}
      {categoriesToDisplay.length === 0 ? (
        <EmptyState 
          searchTerm={searchTerm} 
          onClearSearch={handleClearSearch}
          onCategoriesInitialized={() => {
            // Refresh the category tree after initialization
            fetchCategoryTree();
          }}
          showSuccess={showSuccess}
        />
      ) : (
        <div className={currentViewMode === 'grid' ? 'grid-view' : 'list-view'}>
          {currentViewMode === 'grid' ? (
            <GridView 
              categories={categoriesToDisplay} 
              showProductCounts={showProductCounts}
              maxColumns={maxColumns}
            />
          ) : (
            <ListView 
              categories={categoriesToDisplay} 
              showProductCounts={showProductCounts}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Grid View Component
const GridView: React.FC<{
  categories: CategoryTreeNode[];
  showProductCounts: boolean;
  maxColumns: number;
}> = ({ categories, showProductCounts, maxColumns }) => {
  const getGridCols = () => {
    switch (maxColumns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getGridCols()} gap-6`}>
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          showProductCounts={showProductCounts}
          viewMode="grid"
        />
      ))}
    </div>
  );
};

// List View Component
const ListView: React.FC<{
  categories: CategoryTreeNode[];
  showProductCounts: boolean;
}> = ({ categories, showProductCounts }) => {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          showProductCounts={showProductCounts}
          viewMode="list"
        />
      ))}
    </div>
  );
};

// Category Card Component
const CategoryCard: React.FC<{
  category: CategoryTreeNode;
  showProductCounts: boolean;
  viewMode: 'grid' | 'list';
}> = ({ category, showProductCounts, viewMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubcategories = category.children && category.children.length > 0;
  const totalProducts = category.metadata.productCount + 
    (category.children?.reduce((sum, child) => sum + child.metadata.productCount, 0) || 0);

  if (viewMode === 'grid') {
    return (
      <div className="card-base rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
        <Link href={`/categories/${category.slug}`} className="block">
          <div className="text-center">
            {/* Category Icon */}
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.icon || '📁'}
            </div>
            
            {/* Category Name */}
            <h3 className="font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            
            {/* Description */}
            {category.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
              {hasSubcategories && (
                <span>{category.children.length} subcategories</span>
              )}
              {showProductCounts && (
                <span>{totalProducts} products</span>
              )}
            </div>
          </div>
        </Link>

        {/* Subcategories Preview */}
        {hasSubcategories && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {category.children.slice(0, 3).map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {subcategory.name}
                </Link>
              ))}
              {category.children.length > 3 && (
                <span className="text-xs text-muted-foreground px-2 py-1">
                  +{category.children.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="card-base rounded-lg p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <Link href={`/categories/${category.slug}`} className="flex items-center gap-4 flex-1">
          <div className="text-2xl">{category.icon || '📁'}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-card-foreground hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {hasSubcategories && (
                <span>{category.children.length} subcategories</span>
              )}
              {showProductCounts && (
                <span>{totalProducts} products</span>
              )}
            </div>
          </div>
        </Link>

        {/* Expand/Collapse Button */}
        {hasSubcategories && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Subcategories */}
      {hasSubcategories && isExpanded && (
        <div className="mt-4 pl-10 space-y-2">
          {category.children.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/categories/${subcategory.slug}`}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{subcategory.icon || '📄'}</span>
                <span className="font-medium text-card-foreground group-hover:text-primary">
                  {subcategory.name}
                </span>
              </div>
              {showProductCounts && (
                <span className="text-sm text-muted-foreground">
                  {subcategory.metadata.productCount} products
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  searchTerm: string;
  onClearSearch: () => void;
  onCategoriesInitialized: () => void;
  showSuccess: (title: string, message: string, actionText?: string, actionHref?: string) => void;
}> = ({ searchTerm, onClearSearch, onCategoriesInitialized, showSuccess }) => {
  if (searchTerm) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No categories found
        </h3>
        <p className="text-muted-foreground mb-4">
          No categories match your search for "{searchTerm}"
        </p>
        <button
          onClick={onClearSearch}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📂</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No categories available
      </h3>
      <p className="text-muted-foreground mb-6">
        It looks like the category system hasn't been set up yet. Let's get you started!
      </p>
      
      <InitializeCategoriesButton 
        onSuccess={onCategoriesInitialized}
        showNotification={showSuccess}
        className="mb-4"
      />
      
      <div className="text-sm text-muted-foreground">
        <p>Or visit the <a href="/admin/init-categories" className="text-primary hover:underline">admin page</a> for more options.</p>
      </div>
      
      {/* Debug info - remove in production */}
      <div className="mt-6">
        <CategoryDebug />
      </div>
    </div>
  );
};

export default CategoryBrowser;