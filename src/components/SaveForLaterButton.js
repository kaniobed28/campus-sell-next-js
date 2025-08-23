"use client";

import React, { useState } from "react";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { useViewport } from "@/hooks/useViewport";
import { Button } from "./ui/Button";
import NotificationService from "@/services/notificationService";

const SaveForLaterButton = ({
  product,
  variant = "outline", // "outline", "ghost", "icon"
  size = "default",
  className = "",
  onSaved,
  onError,
  children,
  ...props
}) => {
  const { isTouchDevice } = useViewport();
  const basketStore = useBasketStore();
  const [isSaving, setIsSaving] = useState(false);

  // Check if item is already saved
  const isSaved = basketStore.savedItems.some(item => item.productId === product.id);

  // Handle save for later
  const handleSaveForLater = async () => {
    if (!product || !product.id || isSaving) return;

    setIsSaving(true);

    try {
      // First check if item is in basket to move it
      const basketItem = basketStore.getItemByProductId(product.id);
      
      if (basketItem) {
        // Move from basket to saved items
        await basketStore.saveForLater(basketItem.id);
        NotificationService.basketItemSaved(product.title || product.name);
      } else {
        // Add directly to saved items (this would need a new method)
        await basketStore.addToSavedItems(product);
        NotificationService.success(`${product.title || product.name} saved for later`);
      }
      
      onSaved?.();
    } catch (error) {
      console.error("Error saving item:", error);
      const errorMessage = error.message || "Failed to save item";
      NotificationService.basketError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle remove from saved items
  const handleRemoveFromSaved = async () => {
    if (!product || !product.id || isSaving) return;

    const savedItem = basketStore.savedItems.find(item => item.productId === product.id);
    if (!savedItem) return;

    setIsSaving(true);

    try {
      await basketStore.removeSavedItem(savedItem.id);
      NotificationService.success(`${product.title || product.name} removed from saved items`);
      onSaved?.();
    } catch (error) {
      console.error("Error removing saved item:", error);
      const errorMessage = error.message || "Failed to remove saved item";
      NotificationService.basketError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle click
  const handleClick = () => {
    if (isSaved) {
      handleRemoveFromSaved();
    } else {
      handleSaveForLater();
    }
  };

  // Get button content
  const getButtonContent = () => {
    if (isSaving) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          {variant !== "icon" && <span>Saving...</span>}
        </div>
      );
    }

    if (variant === "icon") {
      return (
        <svg 
          className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none'}`} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <svg 
          className={`w-4 h-4 ${isSaved ? 'fill-current' : 'fill-none'}`} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
        <span>
          {children || (isSaved ? "Saved" : "Save for Later")}
        </span>
      </div>
    );
  };

  return (
    <Button
      variant={isSaved ? "secondary" : variant}
      size={size}
      onClick={handleClick}
      disabled={isSaving || basketStore.isLoading}
      className={`
        ${className}
        ${isTouchDevice ? 'min-h-[44px]' : ''}
        ${isSaved ? 'text-primary border-primary' : ''}
        transition-all duration-200
      `}
      aria-label={
        isSaved 
          ? `Remove ${product.title || product.name} from saved items`
          : `Save ${product.title || product.name} for later`
      }
      {...props}
    >
      {getButtonContent()}
      
      {/* Screen reader text for icon variant */}
      {variant === "icon" && (
        <span className="sr-only">
          {isSaved ? "Remove from saved items" : "Save for later"}
        </span>
      )}
    </Button>
  );
};

export default SaveForLaterButton;