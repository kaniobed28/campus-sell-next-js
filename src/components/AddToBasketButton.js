"use client";

import React, { useState, useCallback } from "react";
import { useViewport } from "@/hooks/useViewport";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { Button } from "./ui/Button";
import QuantityModal from "./QuantityModal";
import NotificationService from "@/services/notificationService";

const AddToBasketButton = ({
  product,
  variant = "default", // "default", "compact", "icon", "outline"
  size = "default", // "sm", "default", "lg"
  showQuantityModal = true,
  defaultQuantity = 1,
  maxQuantity = 999,
  onSuccess,
  onError,
  className = "",
  children,
  disabled = false,
  ...props
}) => {
  const { isMobile, isTouchDevice } = useViewport();
  const basketStore = useBasketStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [isAdding, setIsAdding] = useState(false);

  // Check if item is already in basket
  const existingItem = basketStore.getItemByProductId(product.id);
  const isInBasket = !!existingItem;
  const currentQuantity = existingItem?.quantity || 0;

  // Handle add to basket
  const handleAddToBasket = useCallback(async (selectedQuantity = quantity) => {
    if (!product || !product.id) {
      const error = "Invalid product data";
      NotificationService.basketError(error);
      onError?.(error);
      return;
    }

    setIsAdding(true);

    try {
      await basketStore.addToBasket(product, selectedQuantity);
      
      // Success feedback
      NotificationService.basketItemAdded(product.title || product.name, selectedQuantity);
      onSuccess?.();
      
      // Close modal if open
      setIsModalOpen(false);
      
      // Reset quantity for next time
      setQuantity(defaultQuantity);
    } catch (error) {
      console.error("Error adding to basket:", error);
      const errorMessage = error.message || "Failed to add item to basket";
      NotificationService.basketError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAdding(false);
    }
  }, [product, quantity, defaultQuantity, basketStore, onSuccess, onError]);

  // Handle button click
  const handleClick = useCallback(() => {
    if (disabled || isAdding) return;

    if (showQuantityModal && !isMobile) {
      // Show quantity modal on desktop
      setIsModalOpen(true);
    } else {
      // Add with default quantity on mobile or when modal is disabled
      handleAddToBasket(defaultQuantity);
    }
  }, [disabled, isAdding, showQuantityModal, isMobile, handleAddToBasket, defaultQuantity]);

  // Handle modal confirm
  const handleModalConfirm = useCallback(() => {
    handleAddToBasket(quantity);
  }, [handleAddToBasket, quantity]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setQuantity(defaultQuantity);
  }, [defaultQuantity]);

  // Get button text based on state
  const getButtonText = () => {
    if (isAdding) {
      return "Adding...";
    }
    
    if (isInBasket) {
      if (variant === "icon") return "+";
      return `Add More (${currentQuantity} in basket)`;
    }
    
    if (variant === "icon") return "+";
    if (variant === "compact") return "Add";
    return "Add to Basket";
  };

  // Get button icon
  const getButtonIcon = () => {
    if (isAdding) {
      return (
        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      );
    }
    
    if (variant === "icon" || variant === "compact") {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M9.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    );
  };

  // Get variant-specific button props
  const getButtonVariant = () => {
    if (isInBasket) {
      return variant === "outline" ? "outline" : "secondary";
    }
    return variant === "outline" ? "outline" : "primary";
  };

  // Check if product is available
  const isProductAvailable = product && !product.isOutOfStock && !product.isUnavailable;

  if (!isProductAvailable) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled={true}
        className={`${className} opacity-50 cursor-not-allowed`}
        {...props}
      >
        <span className="text-sm">Unavailable</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={handleClick}
        disabled={disabled || isAdding || basketStore.isLoading}
        className={`
          ${className}
          ${isTouchDevice ? 'min-h-[44px]' : ''}
          ${isInBasket ? 'ring-2 ring-primary ring-opacity-20' : ''}
          transition-all duration-200
        `}
        {...props}
      >
        <div className="flex items-center gap-2">
          {getButtonIcon()}
          {variant !== "icon" && (
            <span className={variant === "compact" ? "text-sm" : ""}>
              {children || getButtonText()}
            </span>
          )}
        </div>
        
        {/* Screen reader text for icon variant */}
        {variant === "icon" && (
          <span className="sr-only">
            {isInBasket ? `Add more ${product.title} to basket` : `Add ${product.title} to basket`}
          </span>
        )}
      </Button>

      {/* Quantity Modal */}
      {showQuantityModal && (
        <QuantityModal
          isOpen={isModalOpen}
          productName={product.title || product.name || "this item"}
          quantity={quantity}
          setQuantity={setQuantity}
          maxQuantity={maxQuantity}
          onConfirm={handleModalConfirm}
          onClose={handleModalClose}
          isLoading={isAdding}
          existingQuantity={currentQuantity}
        />
      )}
    </>
  );
};

export default AddToBasketButton;