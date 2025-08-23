"use client";

import React from "react";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";

/**
 * ResponsiveBasketButton - A responsive button component optimized for basket interactions
 * Provides touch-friendly controls, responsive sizing, and accessibility features
 */
const ResponsiveBasketButton = ({
  children,
  onClick,
  disabled = false,
  variant = "primary", // "primary", "secondary", "outline", "ghost", "danger"
  size = "default", // "small", "default", "large"
  fullWidth = false,
  loading = false,
  loadingText = "Loading...",
  icon,
  iconPosition = "left", // "left", "right", "only"
  className = "",
  ariaLabel,
  ...props
}) => {
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass } = useResponsiveTypography();

  const getVariantClasses = () => {
    const baseClasses = "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case "secondary":
        return `${baseClasses} bg-secondary text-secondary-foreground hover:opacity-90 focus:ring-ring`;
      case "outline":
        return `${baseClasses} border border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-ring`;
      case "ghost":
        return `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-ring`;
      case "danger":
        return `${baseClasses} bg-destructive text-destructive-foreground hover:opacity-90 focus:ring-destructive`;
      default:
        return `${baseClasses} bg-primary text-primary-foreground hover:opacity-90 focus:ring-ring`;
    }
  };

  const getSizeClasses = () => {
    const touchTargetClass = isTouchDevice ? 'min-h-[48px]' : 'min-h-[40px]';
    
    switch (size) {
      case "small":
        return `${touchTargetClass} ${isMobile ? 'px-3 py-2' : 'px-3 py-1.5'} ${getResponsiveTextClass('body-sm')}`;
      case "large":
        return `${touchTargetClass} ${isMobile ? 'px-8 py-4' : 'px-6 py-3'} ${getResponsiveTextClass('body-lg')}`;
      default:
        return `${touchTargetClass} ${isMobile ? 'px-6 py-3' : 'px-4 py-2'} ${getResponsiveTextClass('body-base')}`;
    }
  };

  const getResponsiveClasses = () => {
    return [
      getSizeClasses(),
      getVariantClasses(),
      fullWidth || (isMobile && size !== "small") ? 'w-full' : '',
      'rounded-lg font-medium',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      isTouchDevice ? 'active:scale-95' : 'hover:shadow-md',
      className
    ].filter(Boolean).join(' ');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <span className={isMobile && size === "small" ? 'sr-only' : ''}>
            {isMobile && size === "small" ? '' : loadingText}
          </span>
        </div>
      );
    }

    if (iconPosition === "only" && icon) {
      return (
        <span className="flex items-center justify-center">
          {icon}
          <span className="sr-only">{children}</span>
        </span>
      );
    }

    return (
      <span className="flex items-center justify-center gap-2">
        {icon && iconPosition === "left" && icon}
        {children}
        {icon && iconPosition === "right" && icon}
      </span>
    );
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={getResponsiveClasses()}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

/**
 * Specialized basket button variants
 */

// Add to basket button with cart icon
export const ResponsiveAddToBasketButton = ({ product, ...props }) => {
  const { isMobile } = useViewport();
  
  const cartIcon = (
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
  );

  return (
    <ResponsiveBasketButton
      icon={isMobile ? cartIcon : undefined}
      ariaLabel={`Add ${product?.title || 'product'} to basket`}
      {...props}
    >
      {isMobile ? "Add to Cart" : "Add to Basket"}
    </ResponsiveBasketButton>
  );
};

// Remove button with trash icon
export const ResponsiveRemoveButton = (props) => {
  const removeIcon = (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
      />
    </svg>
  );

  return (
    <ResponsiveBasketButton
      variant="danger"
      icon={removeIcon}
      iconPosition="left"
      {...props}
    >
      Remove
    </ResponsiveBasketButton>
  );
};

// Quantity control buttons
export const ResponsiveQuantityButton = ({ operation, ...props }) => {
  const icon = operation === "increase" ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );

  return (
    <ResponsiveBasketButton
      variant="ghost"
      size="small"
      icon={icon}
      iconPosition="only"
      ariaLabel={operation === "increase" ? "Increase quantity" : "Decrease quantity"}
      {...props}
    >
      {operation === "increase" ? "+" : "−"}
    </ResponsiveBasketButton>
  );
};

export default ResponsiveBasketButton;