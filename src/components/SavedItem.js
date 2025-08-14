"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useViewport } from "@/hooks/useViewport";
import { ProductImageContainer } from "./ResponsiveImageContainer";
import { Button } from "./ui/Button";
import NotificationService from "@/services/notificationService";

const SavedItem = ({ 
  item, 
  onMoveToBasket, 
  onRemove, 
  isUpdating = false,
  variant = "default" // "default", "compact"
}) => {
  const { isMobile, isTablet, isTouchDevice } = useViewport();

  // Handle move to basket
  const handleMoveToBasket = useCallback(async () => {
    try {
      await onMoveToBasket(item.id);
      NotificationService.basketItemMoved(item.product?.title || 'Item');
    } catch (error) {
      NotificationService.basketError(`Failed to move ${item.product?.title || 'item'} to basket`);
    }
  }, [item.id, item.product?.title, onMoveToBasket]);

  // Handle remove from saved items
  const handleRemove = useCallback(async () => {
    const confirmed = window.confirm(`Remove ${item.product?.title || 'this item'} from saved items?`);
    if (!confirmed) return;

    try {
      await onRemove(item.id);
      NotificationService.success(`${item.product?.title || 'Item'} removed from saved items`);
    } catch (error) {
      NotificationService.basketError(`Failed to remove ${item.product?.title || 'item'} from saved items`);
    }
  }, [item.id, item.product?.title, onRemove]);

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

  // Check if product is available
  const isAvailable = !!item.product;
  const productTitle = item.product?.title || 'Unknown Product';
  const productImage = item.product?.imageUrls?.[0] || item.product?.image || '/default-image.jpg';
  const unitPrice = item.product?.price || 0;
  const numericPrice = typeof unitPrice === 'string' ? parseFloat(unitPrice) || 0 : unitPrice;

  // Format saved date
  const savedDate = new Date(item.savedAt).toLocaleDateString();

  return (
    <article 
      className={`${styles.container} ${isUpdating ? 'opacity-75' : ''} ${!isAvailable ? 'bg-red-50 border-red-200' : ''}`}
      role="article"
      aria-labelledby={`saved-item-${item.id}`}
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
                id={`saved-item-${item.id}`}
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
            {isAvailable && (
              <div className="flex items-center gap-2">
                <span className={`${styles.priceSize} text-primary`}>
                  ${numericPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* Saved Date */}
            <div className="text-sm text-muted-foreground">
              Saved on {savedDate}
            </div>

            {/* Action Buttons */}
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              {/* Move to Basket Button */}
              {isAvailable && (
                <Button
                  variant="primary"
                  size={styles.buttonSize}
                  onClick={handleMoveToBasket}
                  disabled={isUpdating}
                  className={`${isMobile ? 'w-full' : ''} ${isTouchDevice ? 'min-h-[44px]' : ''}`}
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Moving...
                    </div>
                  ) : (
                    'Move to Basket'
                  )}
                </Button>
              )}

              {/* Remove Button */}
              <Button
                variant="outline"
                size={styles.buttonSize}
                onClick={handleRemove}
                disabled={isUpdating}
                className={`${isMobile ? 'w-full' : ''} ${isTouchDevice ? 'min-h-[44px]' : ''}`}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* Price (Desktop) */}
        {!isMobile && variant !== "compact" && isAvailable && (
          <div className="flex-shrink-0 text-right">
            <div className={`${styles.priceSize} text-primary font-bold`}>
              ${numericPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default SavedItem;