"use client";

import React from "react";
import Link from "next/link";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";

const BasketCounter = ({ className = "" }) => {
  const { itemCount, isLoading } = useBasketStore();
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass } = useResponsiveTypography();

  // Don't show counter if count is 0 and not loading
  if (!isLoading && itemCount === 0) {
    return null;
  }

  // Responsive classes
  const containerClasses = `
    relative inline-flex items-center gap-2 rounded-md transition-all duration-200
    ${isMobile ? 'p-2' : 'px-3 py-2'}
    ${isTouchDevice ? 'min-h-[48px] min-w-[48px] active:scale-95' : 'min-h-[40px]'}
    hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${className}
  `;

  const iconSize = isMobile ? 'w-6 h-6' : 'w-6 h-6';
  
  const badgeClasses = `
    absolute ${isMobile ? '-top-1 -right-1' : '-top-1 -right-1'} 
    ${isMobile ? 'min-w-[18px] h-[18px]' : 'min-w-[20px] h-[20px]'}
    bg-blue-600 text-white rounded-full flex items-center justify-center 
    ${getResponsiveTextClass('body-xs')} font-bold
    border-2 border-white shadow-sm
  `;

  const loadingClasses = `
    absolute ${isMobile ? '-top-1 -right-1' : '-top-1 -right-1'}
    ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}
    border-2 border-blue-600 border-t-transparent rounded-full animate-spin
  `;

  return (
    <Link 
      href="/basket"
      className={containerClasses}
      aria-label={`View basket with ${itemCount} items`}
    >
      {/* Basket Icon */}
      <svg 
        className={`${iconSize} flex-shrink-0`} 
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

      {/* Text - Hidden on mobile, visible on tablet and up */}
      <span className={`
        ${isMobile ? 'sr-only' : isTablet ? 'hidden lg:inline' : 'hidden sm:inline'} 
        ${getResponsiveTextClass('body-sm')} font-medium
      `}>
        Basket
      </span>

      {/* Count Badge */}
      {itemCount > 0 && !isLoading && (
        <span className={badgeClasses}>
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className={loadingClasses}></div>
      )}

      {/* Screen reader text */}
      <span className="sr-only">
        {isLoading ? 'Loading basket' : `Basket with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      </span>
    </Link>
  );
};

export default BasketCounter;