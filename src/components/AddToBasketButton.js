"use client";

import React, { useState } from "react";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";

const AddToBasketButton = ({
  product,
  quantity = 1,
  className = "",
  children = "Add to Basket",
  variant = "primary", // "primary", "secondary", "outline"
  size = "default", // "small", "default", "large"
  fullWidth = false
}) => {
  const { addToBasket, isLoading } = useBasketStore();
  const [isAdding, setIsAdding] = useState(false);
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass } = useResponsiveTypography();

  const handleAddToBasket = async () => {
    if (!product || !product.id || isAdding || isLoading) return;

    setIsAdding(true);
    try {
      await addToBasket(product, quantity);
      // Could show success message here
    } catch (error) {
      console.error("Error adding to basket:", error);
      // Could show error message here
    } finally {
      setIsAdding(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500";
      case "outline":
        return "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";
    }
  };

  const getSizeClasses = () => {
    const baseClasses = isTouchDevice ? 'min-h-[48px]' : 'min-h-[40px]';
    
    switch (size) {
      case "small":
        return `${baseClasses} ${isMobile ? 'px-3 py-2' : 'px-3 py-1.5'} ${getResponsiveTextClass('body-sm')}`;
      case "large":
        return `${baseClasses} ${isMobile ? 'px-8 py-4' : 'px-6 py-3'} ${getResponsiveTextClass('body-lg')}`;
      default:
        return `${baseClasses} ${isMobile ? 'px-6 py-3' : 'px-4 py-2'} ${getResponsiveTextClass('body-base')}`;
    }
  };

  const getResponsiveText = () => {
    if (typeof children === 'string') {
      // Shorten text on mobile for better fit
      if (isMobile && children === "Add to Basket") {
        return "Add to Cart";
      }
    }
    return children;
  };

  const buttonClasses = `
    ${getSizeClasses()}
    ${getVariantClasses()}
    ${fullWidth || isMobile ? 'w-full' : ''}
    rounded-lg font-medium transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${isTouchDevice ? 'active:scale-95' : 'hover:shadow-md'}
    ${className}
  `;

  return (
    <button
      onClick={handleAddToBasket}
      disabled={isAdding || isLoading}
      className={buttonClasses}
      aria-label={`Add ${product?.title || 'product'} to basket`}
    >
      {isAdding ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <span className={isMobile ? 'sr-only' : ''}>
            {isMobile ? '' : 'Adding...'}
          </span>
        </div>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {/* Add cart icon for mobile */}
          {isMobile && (
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" 
              />
            </svg>
          )}
          {getResponsiveText()}
        </span>
      )}
    </button>
  );
};

export default AddToBasketButton;