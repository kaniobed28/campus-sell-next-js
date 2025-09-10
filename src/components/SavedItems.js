"use client";

import React, { useState, useEffect } from "react";
import { useBasketStore } from "@/app/stores/useBasketStore";
import { useViewport } from "@/hooks/useViewport";
import SavedItem from "./SavedItem";
import { Button } from "./ui/Button";
import NotificationService from "@/services/notificationService";

const SavedItems = ({ 
  variant = "default", // "default", "compact", "modal"
  showHeader = true,
  maxItems = null,
  onItemMoved,
  onItemRemoved,
  className = ""
}) => {
  const { isMobile, isTablet } = useViewport();
  const basketStore = useBasketStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Get saved items from store
  const savedItems = basketStore.savedItems || [];
  const displayItems = maxItems ? savedItems.slice(0, maxItems) : savedItems;
  const hasMoreItems = maxItems && savedItems.length > maxItems;

  // Initialize saved items if needed
  useEffect(() => {
    if (savedItems.length === 0 && !basketStore.isLoading) {
      // Saved items are loaded as part of basket initialization
    }
  }, [savedItems.length, basketStore.isLoading]);

  // Handle move single item to basket
  const handleMoveToBasket = async (itemId) => {
    try {
      await basketStore.moveToBasket(itemId);
      onItemMoved?.(itemId);
    } catch (error) {
      console.error("Error moving item to basket:", error);
    }
  };

  // Handle remove single item
  const handleRemoveItem = async (itemId) => {
    try {
      await basketStore.removeSavedItem(itemId);
      onItemRemoved?.(itemId);
    } catch (error) {
      console.error("Error removing saved item:", error);
    }
  };

  // Handle select item
  const handleSelectItem = (itemId, isSelected) => {
    const newSelection = new Set(selectedItems);
    if (isSelected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedItems(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === displayItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(displayItems.map(item => item.id)));
    }
  };

  // Handle move selected items to basket
  const handleMoveSelectedToBasket = async () => {
    if (selectedItems.size === 0) return;

    setIsLoading(true);
    const itemsToMove = Array.from(selectedItems);
    
    try {
      await basketStore.batchMoveToBasket(itemsToMove);
      setSelectedItems(new Set());
      NotificationService.success(`${itemsToMove.length} items moved to basket`);
    } catch (error) {
      console.error("Error moving selected items:", error);
      NotificationService.basketError("Failed to move some items to basket");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove selected items
  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = window.confirm(`Remove ${selectedItems.size} items from saved items?`);
    if (!confirmed) return;

    setIsLoading(true);
    const itemsToRemove = Array.from(selectedItems);
    
    try {
      await basketStore.batchRemoveSavedItems(itemsToRemove);
      setSelectedItems(new Set());
      NotificationService.success(`${itemsToRemove.length} items removed from saved items`);
    } catch (error) {
      console.error("Error removing selected items:", error);
      NotificationService.basketError("Failed to remove some items");
    } finally {
      setIsLoading(false);
    }
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          container: "space-y-2",
          header: "text-lg font-semibold mb-3",
          grid: "space-y-2",
          itemVariant: "compact"
        };
      case "modal":
        return {
          container: "max-h-96 overflow-y-auto",
          header: "text-lg font-semibold mb-4 sticky top-0 bg-background z-10 pb-2",
          grid: "space-y-3",
          itemVariant: "default"
        };
      default:
        return {
          container: "space-y-4",
          header: "text-2xl font-bold mb-6",
          grid: "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          itemVariant: "default"
        };
    }
  };

  const styles = getVariantStyles();

  // Empty state
  if (savedItems.length === 0 && !basketStore.isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        {showHeader && (
          <h2 className={styles.header}>Saved Items</h2>
        )}
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-muted-foreground">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">No saved items</h3>
          <p className="text-muted-foreground mb-4">
            Items you save for later will appear here
          </p>
          <Button variant="outline" asChild>
            <a href="/">Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (basketStore.isLoading && savedItems.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        {showHeader && (
          <h2 className={styles.header}>Saved Items</h2>
        )}
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading saved items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h2 className={styles.header}>
            Saved Items ({savedItems.length})
          </h2>
          
          {/* Bulk Actions */}
          {variant === "default" && displayItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-sm"
              >
                {selectedItems.size === displayItems.length ? "Deselect All" : "Select All"}
              </Button>
              
              {selectedItems.size > 0 && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleMoveSelectedToBasket}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    Move to Basket ({selectedItems.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSelected}
                    disabled={isLoading}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove ({selectedItems.size})
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Items Grid/List */}
      <div className={styles.grid}>
        {displayItems.map((item) => (
          <div key={item.id} className="relative">
            {/* Selection checkbox for default variant */}
            {variant === "default" && (
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                  aria-label={`Select ${item.product?.title || 'item'}`}
                />
              </div>
            )}
            
            <SavedItem
              item={item}
              onMoveToBasket={handleMoveToBasket}
              onRemove={handleRemoveItem}
              isUpdating={basketStore.isUpdating[item.id]}
              variant={styles.itemVariant}
            />
          </div>
        ))}
      </div>

      {/* Show more link */}
      {hasMoreItems && (
        <div className="text-center mt-6">
          <Button variant="outline" asChild>
            <a href="/profile/saved-items">
              View All {savedItems.length} Saved Items
            </a>
          </Button>
        </div>
      )}

      {/* Error state */}
      {basketStore.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{basketStore.error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => basketStore.clearError()}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedItems;