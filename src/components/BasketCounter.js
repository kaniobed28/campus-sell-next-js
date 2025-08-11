"use client";

import React from "react";
import Link from "next/link";
import { useViewport } from "@/hooks/useViewport";
import { useBasketCounter, useBasketCounterAnimation } from "@/hooks/useBasketCounter";

const BasketCounter = ({ 
  variant = "default", // "default", "compact", "icon-only"
  showZero = false,
  className = "",
  onClick,
  ...props 
}) => {
  const { isMobile, isTouchDevice } = useViewport();
  const { count: itemCount, isLoading, error, hasRecentUpdate } = useBasketCounter();
  const animationClass = useBasketCounterAnimation(itemCount);

  // Don't show counter if count is 0 and showZero is false
  if (!showZero && itemCount === 0 && !isLoading) {
    return null;
  }

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          container: "relative inline-flex items-center",
          button: "p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
          icon: "w-5 h-5",
          badge: "absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs",
          text: "text-sm ml-1"
        };
      case "icon-only":
        return {
          container: "relative inline-flex",
          button: "p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
          icon: "w-6 h-6",
          badge: "absolute -top-1 -right-1 min-w-[20px] h-[20px] text-xs",
          text: "sr-only"
        };
      default:
        return {
          container: "relative inline-flex items-center",
          button: "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
          icon: "w-6 h-6",
          badge: "absolute -top-1 -right-1 min-w-[20px] h-[20px] text-sm",
          text: "text-sm font-medium"
        };
    }
  };

  const styles = getVariantStyles();

  // Handle click
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Format count for display
  const formatCount = (count) => {
    if (count > 99) return "99+";
    return count.toString();
  };

  // Basket icon SVG
  const BasketIcon = ({ className }) => (
    <svg 
      className={className} 
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
  );

  // Loading spinner
  const LoadingSpinner = ({ className }) => (
    <div className={`${className} animate-spin border-2 border-current border-t-transparent rounded-full`} />
  );

  const buttonContent = (
    <div className={styles.container}>
      <div 
        className={`
          ${styles.button} 
          ${isTouchDevice ? 'min-w-[44px] min-h-[44px]' : 'min-h-[40px]'} 
          ${className}
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${error ? 'text-red-600' : ''}
        `}
        {...props}
      >
        {/* Icon */}
        {isLoading ? (
          <LoadingSpinner className={styles.icon} />
        ) : (
          <BasketIcon className={styles.icon} />
        )}

        {/* Text (for non-icon-only variants) */}
        {variant !== "icon-only" && (
          <span className={styles.text}>
            {isMobile ? "Basket" : "My Basket"}
          </span>
        )}

        {/* Screen reader text for icon-only variant */}
        {variant === "icon-only" && (
          <span className="sr-only">
            Basket with {itemCount} items
          </span>
        )}
      </div>

      {/* Count Badge */}
      {(itemCount > 0 || (showZero && itemCount === 0)) && !isLoading && (
        <span 
          className={`
            ${styles.badge}
            bg-primary text-primary-foreground
            rounded-full flex items-center justify-center
            font-bold leading-none
            ${animationClass}
            ${hasRecentUpdate ? 'ring-2 ring-primary ring-opacity-50' : ''}
            transition-all duration-300
          `}
          aria-label={`${itemCount} items in basket`}
        >
          {formatCount(itemCount)}
        </span>
      )}

      {/* Error indicator */}
      {error && (
        <span 
          className={`
            ${styles.badge}
            bg-red-500 text-white
            rounded-full flex items-center justify-center
            text-xs font-bold leading-none
          `}
          title={error}
          aria-label="Basket error"
        >
          !
        </span>
      )}
    </div>
  );

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button
        onClick={handleClick}
        className="focus:outline-none"
        aria-label={`Open basket with ${itemCount} items`}
      >
        {buttonContent}
      </button>
    );
  }

  // Otherwise, render as link
  return (
    <Link 
      href="/basket"
      className="focus:outline-none"
      aria-label={`Go to basket with ${itemCount} items`}
    >
      {buttonContent}
    </Link>
  );
};

export default BasketCounter;