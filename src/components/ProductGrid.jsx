import React from "react";
import ItemCard from "./ItemCard";
import { useResponsiveGrid, useResponsiveSpacing, useViewport } from "@/hooks/useViewport";
import { PRODUCT_STATUS } from "@/types/admin";

/**
 * Enhanced Responsive ProductGrid component that adapts layout based on screen size
 * - Mobile: 1 column with optimized spacing
 * - Tablet: 2-3 columns with balanced layout
 * - Desktop: 4 columns with maximum utilization
 */
const ProductGrid = ({ 
  products = [], 
  className = "",
  showEmptyState = true,
  emptyStateMessage = "No products available",
  emptyStateIcon = "📦",
  variant = "default", // "default", "compact", "featured"
  maxColumns = null // Override default column behavior
}) => {
  const { isMobile, isTablet, isDesktop } = useViewport();
  const spacing = useResponsiveSpacing();
  
  // Filter out inactive products (blocked or removed)
  const activeProducts = products.filter(product => {
    // If product has no status, consider it active
    if (!product.status) return true;
    // Only show active products
    return product.status === PRODUCT_STATUS.ACTIVE;
  });
  
  // Get responsive grid configuration
  const getGridClasses = () => {
    if (maxColumns) {
      // Custom column override
      const mobileCol = Math.min(maxColumns, 1);
      const tabletCol = Math.min(maxColumns, 2);
      const desktopCol = Math.min(maxColumns, 4);
      
      return `grid-cols-${mobileCol} sm:grid-cols-${tabletCol} lg:grid-cols-${desktopCol}`;
    }
    
    // Variant-based grid layouts
    switch (variant) {
      case "compact":
        return "grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
      case "featured":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        // Optimized responsive grid: 1 col mobile, 2-3 col tablet, 4 col desktop
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };
  
  // Get responsive gap classes that scale with screen size
  const getGapClasses = () => {
    switch (variant) {
      case "compact":
        return "gap-3 sm:gap-4 md:gap-5 lg:gap-6";
      case "featured":
        return "gap-6 sm:gap-8 md:gap-10 lg:gap-12";
      default:
        return "gap-4 sm:gap-5 md:gap-6 lg:gap-8";
    }
  };
  
  // If no products and empty state should be shown
  if (activeProducts.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-12 sm:py-16 lg:py-20">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">{emptyStateIcon}</div>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-md mx-auto px-4">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`
        grid 
        ${getGridClasses()}
        ${getGapClasses()}
        w-full
        ${className}
      `}
      role="grid"
      aria-label={`Product grid with ${activeProducts.length} items`}
    >
      {activeProducts.map((product, index) => {
        // Normalize product data to ensure consistent props
        const normalizedProduct = {
          id: product.id,
          image: product.image || product.imageUrls?.[0] || '/default-image.jpg',
          title: product.title || product.name || 'Untitled Product',
          description: product.description || product.category || '',
          price: typeof product.price === 'number' 
            ? product.price.toFixed(2) 
            : parseFloat(product.price || 0).toFixed(2),
          link: product.link || `/listings/${product.id}`,
          likes: product.likes || 0,
          views: product.views || 0,
          status: product.status
        };

        return (
          <div
            key={normalizedProduct.id}
            role="gridcell"
            aria-rowindex={Math.floor(index / (isMobile ? 1 : isTablet ? 2 : 4)) + 1}
            aria-colindex={(index % (isMobile ? 1 : isTablet ? 2 : 4)) + 1}
          >
            <ItemCard
              {...normalizedProduct}
              variant={variant}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;