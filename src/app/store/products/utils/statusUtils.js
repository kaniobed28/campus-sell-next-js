/**
 * Status management utilities for products
 */

import { PRODUCT_STATUS } from "@/types/store";

/**
 * Determines if a product should be visible in public search results
 */
export const isProductPubliclyVisible = (status) => {
  return status === PRODUCT_STATUS.ACTIVE;
};

/**
 * Determines if a product should be visible to the seller
 */
export const isProductVisibleToSeller = (status) => {
  // Sellers can see all their products regardless of status
  return true;
};

/**
 * Gets the search visibility impact of a status change
 */
export const getVisibilityImpact = (oldStatus, newStatus) => {
  const wasVisible = isProductPubliclyVisible(oldStatus);
  const willBeVisible = isProductPubliclyVisible(newStatus);

  if (wasVisible && !willBeVisible) {
    return {
      type: 'hidden',
      message: 'Product will be hidden from public search results'
    };
  } else if (!wasVisible && willBeVisible) {
    return {
      type: 'visible',
      message: 'Product will become visible in public search results'
    };
  } else {
    return {
      type: 'no_change',
      message: 'No change to public visibility'
    };
  }
};

/**
 * Gets status transition warnings
 */
export const getStatusTransitionWarning = (oldStatus, newStatus) => {
  // Warn when marking as sold
  if (newStatus === PRODUCT_STATUS.SOLD && oldStatus !== PRODUCT_STATUS.SOLD) {
    return {
      level: 'warning',
      message: 'Marking as sold will hide the product from buyers. Make sure the item is actually sold.'
    };
  }

  // Warn when marking active product as unavailable
  if (newStatus === PRODUCT_STATUS.UNAVAILABLE && oldStatus === PRODUCT_STATUS.ACTIVE) {
    return {
      level: 'info',
      message: 'Product will be temporarily hidden. You can reactivate it anytime.'
    };
  }

  // Warn when moving from draft to active
  if (newStatus === PRODUCT_STATUS.ACTIVE && oldStatus === PRODUCT_STATUS.DRAFT) {
    return {
      level: 'success',
      message: 'Product will become visible to buyers and appear in search results.'
    };
  }

  return null;
};

/**
 * Validates if a status transition is allowed
 */
export const isStatusTransitionAllowed = (oldStatus, newStatus, productData = {}) => {
  // All basic status transitions are allowed
  if (Object.values(PRODUCT_STATUS).includes(newStatus)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Invalid status value'
  };
};

/**
 * Gets the appropriate confirmation message for a status change
 */
export const getStatusChangeConfirmation = (productTitle, oldStatus, newStatus) => {
  const visibilityImpact = getVisibilityImpact(oldStatus, newStatus);
  const warning = getStatusTransitionWarning(oldStatus, newStatus);

  let message = `Change "${productTitle}" status to "${newStatus}"?\n\n`;
  message += visibilityImpact.message;

  if (warning) {
    message += `\n\n⚠️ ${warning.message}`;
  }

  return message;
};

/**
 * Gets status-specific action recommendations
 */
export const getStatusActionRecommendations = (status, productData = {}) => {
  const recommendations = [];

  switch (status) {
    case PRODUCT_STATUS.DRAFT:
      recommendations.push({
        action: 'publish',
        label: 'Publish Product',
        description: 'Make this product visible to buyers',
        targetStatus: PRODUCT_STATUS.ACTIVE,
        priority: 'high'
      });
      break;

    case PRODUCT_STATUS.ACTIVE:
      if (productData.viewCount === 0 && productData.createdAt) {
        const daysSinceCreated = Math.floor((Date.now() - new Date(productData.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated > 7) {
          recommendations.push({
            action: 'optimize',
            label: 'Optimize Listing',
            description: 'Consider updating title, description, or images to improve visibility',
            priority: 'medium'
          });
        }
      }
      break;

    case PRODUCT_STATUS.UNAVAILABLE:
      recommendations.push({
        action: 'reactivate',
        label: 'Reactivate Product',
        description: 'Make this product available to buyers again',
        targetStatus: PRODUCT_STATUS.ACTIVE,
        priority: 'medium'
      });
      break;

    case PRODUCT_STATUS.SOLD:
      recommendations.push({
        action: 'duplicate',
        label: 'Create Similar Listing',
        description: 'Duplicate this sold item to create a new listing',
        priority: 'low'
      });
      break;
  }

  return recommendations;
};

/**
 * Formats status for display
 */
export const formatStatusForDisplay = (status) => {
  switch (status) {
    case PRODUCT_STATUS.ACTIVE:
      return 'Active';
    case PRODUCT_STATUS.SOLD:
      return 'Sold';
    case PRODUCT_STATUS.UNAVAILABLE:
      return 'Unavailable';
    case PRODUCT_STATUS.DRAFT:
      return 'Draft';
    default:
      return 'Unknown';
  }
};

/**
 * Gets status color theme
 */
export const getStatusColorTheme = (status) => {
  switch (status) {
    case PRODUCT_STATUS.ACTIVE:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        button: 'bg-green-600 hover:bg-green-700'
      };
    case PRODUCT_STATUS.SOLD:
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    case PRODUCT_STATUS.UNAVAILABLE:
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      };
    case PRODUCT_STATUS.DRAFT:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
  }
};