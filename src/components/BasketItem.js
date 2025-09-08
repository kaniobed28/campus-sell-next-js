"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";
import { ProductImageContainer } from "@/components/ResponsiveImageContainer";

const BasketItem = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  isUpdating = false
}) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass, getResponsiveHeadingClass } = useResponsiveTypography();

  // Calculate prices
  const unitPrice = item.product?.price || 0;
  const numericPrice = typeof unitPrice === 'string' ? parseFloat(unitPrice) || 0 : unitPrice;
  const totalPrice = numericPrice * localQuantity;

  // Handle quantity change
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity === localQuantity) return;
    
    setLocalQuantity(newQuantity);
    try {
      await onQuantityChange(item.id, newQuantity);
    } catch (error) {
      // Revert on error
      setLocalQuantity(item.quantity);
    }
  };

  // Handle remove
  const handleRemove = async () => {
    try {
      await onRemove(item.id);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const productTitle = item.product?.title || 'Unknown Product';
  const productImage = item.product?.imageUrls?.[0] || item.product?.image || '/default-image.jpg';

  // Responsive classes
  const containerClasses = `
    p-3 sm:p-4 lg:p-6 bg-card border border-border 
    transition-all duration-200 hover:shadow-md theme-transition rounded-lg
    ${isUpdating ? 'opacity-75' : ''}
  `;

  const imageSize = isMobile ? 'w-20 h-20' : isTablet ? 'w-24 h-24' : 'w-28 h-28';
  
  // Touch-friendly button classes
  const touchButtonClasses = `
    ${isTouchDevice ? 'min-h-[48px] min-w-[48px]' : 'min-h-[40px] min-w-[40px]'}
    flex items-center justify-center
    hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200 theme-transition
    ${isTouchDevice ? 'active:scale-95' : ''}
  `;

  const quantityInputClasses = `
    ${isMobile ? 'w-12' : 'w-16'} text-center border-0 bg-background text-foreground
    focus:outline-none focus:ring-2 focus:ring-ring py-2
    ${getResponsiveTextClass('body-base')}
  `;

  return (
    <div className={containerClasses}>
      <div className={`flex gap-3 sm:gap-4 ${isMobile ? 'flex-col' : ''}`}>
        {/* Product Image */}
        <div className={`flex-shrink-0 ${isMobile ? 'self-center' : ''}`}>
          <ProductImageContainer
            src={productImage}
            alt={productTitle}
            className={`${imageSize} object-cover rounded-md`}
            fallbackSrc="/default-image.jpg"
            priority={false}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className={`space-y-2 sm:space-y-3 ${isMobile ? 'text-center' : ''}`}>
            {/* Title and Link */}
            <div>
              <h3 className={`
                ${getResponsiveHeadingClass(3, 'card')} 
                font-medium text-foreground line-clamp-2
                ${isMobile ? 'text-center' : ''}
              `}>
                <Link 
                  href={`/listings/${item.productId}`}
                  className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  {productTitle}
                </Link>
              </h3>
            </div>

            {/* Price Information */}
            <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
              <span className={`${getResponsiveTextClass('body-lg')} font-semibold text-primary`}>
                ${numericPrice.toFixed(2)}
              </span>
              {localQuantity > 1 && (
                <span className={`${getResponsiveTextClass('body-sm')} text-muted-foreground`}>
                  × {localQuantity} = ${totalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            <div className={`flex items-center gap-3 ${isMobile ? 'justify-center' : ''}`}>
              <label 
                htmlFor={`quantity-${item.id}`} 
                className={`${getResponsiveTextClass('body-sm')} font-medium ${isMobile ? 'sr-only' : ''}`}
              >
                {isMobile ? 'Qty' : 'Quantity'}:
              </label>
              <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
                <button
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={localQuantity <= 1 || isUpdating}
                  className={touchButtonClasses}
                  aria-label="Decrease quantity"
                >
                  <span className={getResponsiveTextClass('body-lg')}>−</span>
                </button>
                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="1"
                  max="999"
                  value={localQuantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={isUpdating}
                  className={quantityInputClasses}
                  aria-label="Quantity"
                />
                <button
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={localQuantity >= 999 || isUpdating}
                  className={touchButtonClasses}
                  aria-label="Increase quantity"
                >
                  <span className={getResponsiveTextClass('body-lg')}>+</span>
                </button>
              </div>
              {isUpdating && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className={`${getResponsiveTextClass('body-sm')} text-muted-foreground ${isMobile ? 'sr-only' : ''}`}>
                    Updating...
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'justify-center' : ''}`}>
              <button
                onClick={handleRemove}
                disabled={isUpdating}
                className={`
                  px-4 py-2 ${getResponsiveTextClass('body-sm')} font-medium 
                  text-destructive hover:text-destructive-foreground hover:bg-destructive/10 
                  rounded-md transition-colors disabled:opacity-50 theme-transition
                  ${isTouchDevice ? 'min-h-[48px] active:scale-95' : 'min-h-[40px]'}
                  focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2
                `}
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Total Price (Desktop/Tablet) */}
        {!isMobile && (
          <div className="flex-shrink-0 text-right">
            <div className={`${getResponsiveTextClass('body-lg')} font-bold text-foreground`}>
              ${totalPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Total Price */}
      {isMobile && (
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className={`${getResponsiveTextClass('body-sm')} font-medium text-foreground`}>Total:</span>
          <span className={`${getResponsiveTextClass('body-lg')} font-bold text-foreground`}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default BasketItem;