"use client";

import React, { useState } from "react";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { useViewport } from "@/hooks/useViewport";
import NotificationService from "@/services/notificationService";

const QuickAddToBasket = ({ 
  product, 
  className = "",
  position = "bottom-right", // "bottom-right", "bottom-left", "top-right", "top-left"
  size = "default", // "sm", "default", "lg"
  showOnHover = true,
  alwaysVisible = false
}) => {
  const { isMobile, isTouchDevice } = useViewport();
  const basketStore = useBasketStore();
  const [isAdding, setIsAdding] = useState(false);

  // Check if item is already in basket
  const existingItem = basketStore.getItemByProductId(product.id);
  const isInBasket = !!existingItem;

  // Handle quick add
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || !product.id || isAdding) return;

    setIsAdding(true);

    try {
      await basketStore.addToBasket(product, 1);
      NotificationService.basketItemAdded(product.title || product.name, 1);
    } catch (error) {
      console.error("Error adding to basket:", error);
      NotificationService.basketError(error.message || "Failed to add item to basket");
    } finally {
      setIsAdding(false);
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-2 left-2";
      case "top-right":
        return "top-2 right-2";
      case "top-left":
        return "top-2 left-2";
      default:
        return "bottom-2 right-2";
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-sm";
      case "lg":
        return "w-12 h-12 text-lg";
      default:
        return "w-10 h-10";
    }
  };

  // Don't show on mobile if showOnHover is true and alwaysVisible is false
  if (isMobile && showOnHover && !alwaysVisible) {
    return null;
  }

  // Check if product is available
  const isProductAvailable = product && !product.isOutOfStock && !product.isUnavailable;

  if (!isProductAvailable) {
    return null;
  }

  return (
    <button
      onClick={handleQuickAdd}
      disabled={isAdding || basketStore.isLoading}
      className={`
        absolute ${getPositionClasses()} ${getSizeClasses()}
        ${isInBasket ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}
        rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        ${showOnHover && !alwaysVisible ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
        ${isTouchDevice ? 'min-w-[44px] min-h-[44px]' : ''}
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        z-10
        ${className}
      `}
      aria-label={
        isInBasket 
          ? `Add another ${product.title || product.name} to basket`
          : `Add ${product.title || product.name} to basket`
      }
      title={
        isInBasket 
          ? "Add another to basket"
          : "Add to basket"
      }
    >
      {isAdding ? (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : isInBasket ? (
        // Plus icon for items already in basket
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ) : (
        // Shopping cart icon for new items
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      )}
      
      {/* Success indicator */}
      {isInBasket && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
};

export default QuickAddToBasket;