"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useViewport } from "@/hooks/useViewport";
import { ProductImageContainer } from "./ResponsiveImageContainer";
import { Button } from "./ui/Button";
import NotificationService from "@/services/notificationService";

const BasketItem = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  onSaveForLater, 
  isUpdating = false,
  showSaveForLater = true,
  variant = "default" // "default", "compact", "checkout"
}) => {
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isLocalUpdating, setIsLocalUpdating] = useState(false);

  // Calculate prices
  const unitPrice = item.product?.price || 0;
  const numericPrice = typeof unitPrice === 'string' ? parseFloat(unitPrice) || 0 : unitPrice;
  const totalPrice = numericPrice * localQuantity;

  // Handle quantity change with debouncing
  const handleQuantityChange = useCallback(async (newQuantity) => {
    if (newQuantity < 1 || newQuantity === localQuantity) return;
    
    setLocalQuantity(newQuantity);
    setIsLocalUpdating(true);

    try {
      await onQuantityChange(item.id, newQuantity);
      NotificationService.basketItemUpdated(item.product?.title || 'Item', newQuantity);
    } catch (error) {
      // Revert local quantity on error
      setLocalQuantity(item.quantity);
      NotificationService.basketError(`Failed to update ${item.product?.title || 'item'} quantity`);
    } finally {
      setIsLocalUpdating(false);
    }
  }, [item.id, item.quantity, item.product?.title, localQuantity, onQuantityChange]);

  // Handle remove with confirmation
  const handleRemove = useCallback(async () => {
    if (variant === "checkout") {
      // In checkout, require confirmation
      const confirmed = window.confirm(`Remove ${item.product?.title || 'this item'} from your basket?`);
      if (!confirmed) return;
    }

    try {
      await onRemove(item.id);
      NotificationService.basketItemRemoved(item.product?.title || 'Item');
    } catch (error) {
      NotificationService.basketError(`Failed to remove ${item.product?.title || 'item'}`);
    }
  }, [item.id, item.product?.title, onRemove, variant]);

  // Handle save for later
  const handleSaveForLater = useCallback(async () => {
    try {
      await onSaveForLater(item.id);
      NotificationService.basketItemSaved(item.product?.title || 'Item');
    } catch (error) {
      NotificationService.basketError(`Failed to save ${item.product?.title || 'item'} for later`);
    }
  }, [item.id, item.product?.title, onSaveForLater]);

  // Quantity input handlers
  const handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= 999) {
      handleQuantityChange(value);
    }
  };

  const incrementQuantity = () => {
    if (localQuantity < 999) {
      handleQuantityChange(localQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (localQuantity > 1) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          container: "p-3 border-b border-border",
          imageSize: "w-16 h-16 sm:w-20 sm:h-20",
          contentSpacing: "space-y-1",
          titleSize: "text-sm font-medium",
          priceSize: "text-sm font-semibold",
          buttonSize: "sm"
        };
      case "checkout":
        return {
          container: "p-4 bg-card/50 rounded-lg border border-border",
          imageSize: "w-20 h-20 sm:w-24 sm:h-24",
          contentSpacing: "space-y-2",
          titleSize: "text-base font-medium",
          priceSize: "text-lg font-semibold",
          buttonSize: "sm"
        };
      default:
        return {
          container: "p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow",
          imageSize: "w-24 h-24 sm:w-28 sm:h-28",
          contentSpacing: "space-y-3",
          titleSize: "text-base sm:text-lg font-medium",
          priceSize: "text-lg sm:text-xl font-semibold",
          buttonSize: "default"
        };
    }
  };

  const styles = getVariantStyles();
  const isItemUpdating = isUpdating || isLocalUpdating;

  // Check if product is available
  const isAvailable = !!item.product;
  const productTitle = item.product?.title || 'Unknown Product';
  const productImage = item.product?.imageUrls?.[0] || item.product?.image || '/default-image.jpg';

  return (
    <article 
      className={`${styles.container} ${isItemUpdating ? 'opacity-75' : ''} ${!isAvailable ? 'bg-red-50 border-red-200' : ''}`}
      role="article"
      aria-labelledby={`basket-item-${item.id}`}
    >
      <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
        {/* Product Image */}
        <div className={`flex-shrink-0 ${isMobile ? 'self-center' : ''}`}>
          <ProductImageContainer
            src={productImage}
            alt={productTitle}
            className={`${styles.imageSize} object-cover rounded-md`}
            fallbackSrc="/images/placeholder-product.jpg"
            containerClassName="relative"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-red-500/20 rounded-md flex items-center justify-center">
              <span className="text-red-700 text-xs font-medium bg-white px-2 py-1 rounded">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className={styles.contentSpacing}>
            {/* Title and Link */}
            <div>
              <h3 
                id={`basket-item-${item.id}`}
                className={`${styles.titleSize} text-card-foreground line-clamp-2`}
              >
                {isAvailable ? (
                  <Link 
                    href={`/listings/${item.productId}`}
                    className="hover:text-primary transition-colors"
                  >
                    {productTitle}
                  </Link>
                ) : (
                  <span className="text-red-600">{productTitle}</span>
                )}
              </h3>
              {!isAvailable && (
                <p className="text-sm text-red-600 mt-1">
                  This item is no longer available
                </p>
              )}
            </div>

            {/* Price Information */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`${styles.priceSize} text-primary`}>
                ${numericPrice.toFixed(2)}
              </span>
              {localQuantity > 1 && (
                <span className="text-sm text-muted-foreground">
                  × {localQuantity} = ${totalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity Controls */}
            {isAvailable && (
              <div className="flex items-center gap-3">
                <label htmlFor={`quantity-${item.id}`} className="text-sm font-medium">
                  Quantity:
                </label>
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={decrementQuantity}
                    disabled={localQuantity <= 1 || isItemUpdating}
                    className={`
                      px-3 py-2 hover:bg-accent hover:text-accent-foreground 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors rounded-l-md
                      ${isTouchDevice ? 'min-w-[44px] min-h-[44px]' : 'min-w-[40px] min-h-[40px]'}
                    `}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    max="999"
                    value={localQuantity}
                    onChange={handleQuantityInputChange}
                    disabled={isItemUpdating}
                    className={`
                      w-16 text-center border-0 border-l border-r border-border 
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isTouchDevice ? 'py-3' : 'py-2'}
                    `}
                    aria-label={`Quantity for ${productTitle}`}
                  />
                  <button
                    onClick={incrementQuantity}
                    disabled={localQuantity >= 999 || isItemUpdating}
                    className={`
                      px-3 py-2 hover:bg-accent hover:text-accent-foreground 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors rounded-r-md
                      ${isTouchDevice ? 'min-w-[44px] min-h-[44px]' : 'min-w-[40px] min-h-[40px]'}
                    `}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {isItemUpdating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    Updating...
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              {/* Save for Later Button */}
              {showSaveForLater && isAvailable && (
                <Button
                  variant="outline"
                  size={styles.buttonSize}
                  onClick={handleSaveForLater}
                  disabled={isItemUpdating}
                  className={`${isMobile ? 'w-full' : ''} ${isTouchDevice ? 'min-h-[44px]' : ''}`}
                >
                  Save for Later
                </Button>
              )}

              {/* Remove Button */}
              <Button
                variant="destructive"
                size={styles.buttonSize}
                onClick={handleRemove}
                disabled={isItemUpdating}
                className={`${isMobile ? 'w-full' : ''} ${isTouchDevice ? 'min-h-[44px]' : ''}`}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Total Price (Desktop) */}
        {!isMobile && variant !== "compact" && (
          <div className="flex-shrink-0 text-right">
            <div className={`${styles.priceSize} text-primary font-bold`}>
              ${totalPrice.toFixed(2)}
            </div>
            {variant === "checkout" && (
              <div className="text-sm text-muted-foreground mt-1">
                {localQuantity} × ${numericPrice.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Total Price */}
      {isMobile && variant !== "compact" && (
        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
          <span className="text-sm font-medium">Total:</span>
          <span className={`${styles.priceSize} text-primary font-bold`}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      )}
    </article>
  );
};

export default BasketItem;