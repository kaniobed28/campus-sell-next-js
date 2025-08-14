"use client";

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Notification service for basket operations
 */
export class NotificationService {
  static notifications = [];
  static listeners = [];

  /**
   * Add a notification
   * @param {string} type - Notification type
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  static addNotification(type, message, options = {}) {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toISOString(),
      duration: options.duration || this.getDefaultDuration(type),
      persistent: options.persistent || false,
      action: options.action || null,
      ...options
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remove non-persistent notifications
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Remove a notification
   * @param {string} id - Notification ID
   */
  static removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  static clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  static getNotifications() {
    return [...this.notifications];
  }

  /**
   * Subscribe to notification changes
   * @param {Function} listener - Listener function
   */
  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  static notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.notifications);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Get default duration for notification type
   * @param {string} type - Notification type
   */
  static getDefaultDuration(type) {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 3000; // 3 seconds
      case NOTIFICATION_TYPES.INFO:
        return 4000; // 4 seconds
      case NOTIFICATION_TYPES.WARNING:
        return 5000; // 5 seconds
      case NOTIFICATION_TYPES.ERROR:
        return 0; // Persistent until dismissed
      default:
        return 4000;
    }
  }

  // Convenience methods for different notification types
  static success(message, options = {}) {
    return this.addNotification(NOTIFICATION_TYPES.SUCCESS, message, options);
  }

  static error(message, options = {}) {
    return this.addNotification(NOTIFICATION_TYPES.ERROR, message, options);
  }

  static warning(message, options = {}) {
    return this.addNotification(NOTIFICATION_TYPES.WARNING, message, options);
  }

  static info(message, options = {}) {
    return this.addNotification(NOTIFICATION_TYPES.INFO, message, options);
  }

  // Basket-specific notification methods
  static basketItemAdded(productName, quantity = 1) {
    const message = quantity === 1 
      ? `${productName} added to basket`
      : `${quantity} × ${productName} added to basket`;
    
    return this.success(message, {
      action: {
        label: 'View Basket',
        onClick: () => window.location.href = '/basket'
      }
    });
  }

  static basketItemUpdated(productName, newQuantity) {
    const message = `${productName} quantity updated to ${newQuantity}`;
    return this.success(message);
  }

  static basketItemRemoved(productName) {
    const message = `${productName} removed from basket`;
    return this.success(message);
  }

  static basketItemSaved(productName) {
    const message = `${productName} saved for later`;
    return this.success(message, {
      action: {
        label: 'View Saved',
        onClick: () => window.location.href = '/basket?view=saved'
      }
    });
  }

  static basketItemMoved(productName) {
    const message = `${productName} moved to basket`;
    return this.success(message);
  }

  static basketCleared() {
    const message = 'Basket cleared';
    return this.success(message);
  }

  static basketError(message, options = {}) {
    return this.error(message, {
      persistent: true,
      action: {
        label: 'Retry',
        onClick: options.onRetry || (() => window.location.reload())
      },
      ...options
    });
  }

  static networkError(operation = 'operation') {
    return this.error(`Network error during ${operation}. Please check your connection and try again.`, {
      persistent: true,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
  }

  static basketLimitReached() {
    return this.warning('Basket limit reached. Please remove some items before adding more.');
  }

  static itemOutOfStock(productName) {
    return this.warning(`${productName} is currently out of stock and has been removed from your basket.`);
  }

  static duplicateItemMerged(productName) {
    return this.info(`Duplicate ${productName} items have been merged in your basket.`);
  }
}

export default NotificationService;