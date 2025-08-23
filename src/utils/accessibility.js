/**
 * Accessibility utilities for admin interfaces
 * Provides WCAG 2.1 AA compliant functionality
 */

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within a container element
   * @param {HTMLElement} container - Container to trap focus within
   * @returns {Function} Cleanup function to remove focus trap
   */
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Restore focus to previously focused element
   * @param {HTMLElement} element - Element to restore focus to
   */
  restoreFocus: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  /**
   * Get the currently focused element
   * @returns {HTMLElement|null} Currently focused element
   */
  getCurrentFocus: () => {
    return document.activeElement;
  }
};

/**
 * ARIA utilities for dynamic content
 */
export const ariaUtils = {
  /**
   * Announce content to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Update aria-label dynamically
   * @param {HTMLElement} element - Element to update
   * @param {string} label - New aria-label value
   */
  updateLabel: (element, label) => {
    if (element) {
      element.setAttribute('aria-label', label);
    }
  },

  /**
   * Update aria-describedby dynamically
   * @param {HTMLElement} element - Element to update
   * @param {string} describedBy - ID of describing element
   */
  updateDescribedBy: (element, describedBy) => {
    if (element) {
      element.setAttribute('aria-describedby', describedBy);
    }
  },

  /**
   * Set aria-expanded state
   * @param {HTMLElement} element - Element to update
   * @param {boolean} expanded - Whether element is expanded
   */
  setExpanded: (element, expanded) => {
    if (element) {
      element.setAttribute('aria-expanded', expanded.toString());
    }
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardUtils = {
  /**
   * Handle arrow key navigation in lists
   * @param {KeyboardEvent} event - Keyboard event
   * @param {HTMLElement[]} items - Array of navigable items
   * @param {number} currentIndex - Current focused item index
   * @returns {number} New focused item index
   */
  handleArrowNavigation: (event, items, currentIndex) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (items[newIndex]) {
      items[newIndex].focus();
    }

    return newIndex;
  },

  /**
   * Check if key is an activation key (Enter or Space)
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {boolean} Whether key is activation key
   */
  isActivationKey: (event) => {
    return event.key === 'Enter' || event.key === ' ';
  },

  /**
   * Handle escape key to close modals/dropdowns
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Function} closeHandler - Function to call when escape is pressed
   */
  handleEscape: (event, closeHandler) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeHandler();
    }
  }
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  /**
   * Calculate relative luminance of a color
   * @param {string} color - Hex color string
   * @returns {number} Relative luminance value
   */
  getLuminance: (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  getContrastRatio: (color1, color2) => {
    const lum1 = contrastUtils.getLuminance(color1);
    const lum2 = contrastUtils.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {boolean} largeText - Whether text is large (18pt+ or 14pt+ bold)
   * @returns {boolean} Whether combination meets AA standards
   */
  meetsWCAGAA: (foreground, background, largeText = false) => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    return largeText ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Create screen reader only text
   * @param {string} text - Text for screen readers
   * @returns {HTMLElement} Hidden element with text
   */
  createSROnlyText: (text) => {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  },

  /**
   * Add screen reader description to element
   * @param {HTMLElement} element - Element to describe
   * @param {string} description - Description text
   */
  addDescription: (element, description) => {
    const id = `desc-${Math.random().toString(36).substr(2, 9)}`;
    const descElement = screenReaderUtils.createSROnlyText(description);
    descElement.id = id;
    
    element.parentNode.insertBefore(descElement, element.nextSibling);
    element.setAttribute('aria-describedby', id);
  },

  /**
   * Check if screen reader is likely active
   * @returns {boolean} Whether screen reader might be active
   */
  isScreenReaderActive: () => {
    // Basic heuristic - not 100% accurate but helpful
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis?.speaking ||
           false;
  }
};

/**
 * Touch accessibility utilities
 */
export const touchUtils = {
  /**
   * Minimum touch target size (44px recommended)
   */
  MIN_TOUCH_TARGET: 44,

  /**
   * Check if element meets minimum touch target size
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether element meets minimum size
   */
  meetsTouchTarget: (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width >= touchUtils.MIN_TOUCH_TARGET && 
           rect.height >= touchUtils.MIN_TOUCH_TARGET;
  },

  /**
   * Add touch-friendly padding to element
   * @param {HTMLElement} element - Element to enhance
   */
  enhanceTouchTarget: (element) => {
    const rect = element.getBoundingClientRect();
    if (!touchUtils.meetsTouchTarget(element)) {
      const paddingNeeded = Math.max(0, (touchUtils.MIN_TOUCH_TARGET - Math.min(rect.width, rect.height)) / 2);
      element.style.padding = `${paddingNeeded}px`;
    }
  },

  /**
   * Detect if device supports touch
   * @returns {boolean} Whether device supports touch
   */
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

/**
 * Form accessibility utilities
 */
export const formUtils = {
  /**
   * Associate label with form control
   * @param {HTMLElement} label - Label element
   * @param {HTMLElement} control - Form control element
   */
  associateLabel: (label, control) => {
    const id = control.id || `control-${Math.random().toString(36).substr(2, 9)}`;
    control.id = id;
    label.setAttribute('for', id);
  },

  /**
   * Add error message to form control
   * @param {HTMLElement} control - Form control element
   * @param {string} errorMessage - Error message text
   * @returns {HTMLElement} Error message element
   */
  addErrorMessage: (control, errorMessage) => {
    const errorId = `error-${control.id || Math.random().toString(36).substr(2, 9)}`;
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'form-error';
    errorElement.textContent = errorMessage;
    errorElement.setAttribute('role', 'alert');
    
    control.parentNode.insertBefore(errorElement, control.nextSibling);
    control.setAttribute('aria-describedby', errorId);
    control.setAttribute('aria-invalid', 'true');
    
    return errorElement;
  },

  /**
   * Remove error message from form control
   * @param {HTMLElement} control - Form control element
   */
  removeErrorMessage: (control) => {
    const errorId = control.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.remove();
      }
      control.removeAttribute('aria-describedby');
      control.removeAttribute('aria-invalid');
    }
  },

  /**
   * Validate form accessibility
   * @param {HTMLFormElement} form - Form to validate
   * @returns {Object} Validation results
   */
  validateFormAccessibility: (form) => {
    const issues = [];
    const controls = form.querySelectorAll('input, select, textarea');
    
    controls.forEach(control => {
      // Check for labels
      const label = form.querySelector(`label[for="${control.id}"]`);
      if (!label && !control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby')) {
        issues.push(`Control ${control.name || control.id} missing label`);
      }
      
      // Check required fields
      if (control.required && !control.getAttribute('aria-required')) {
        control.setAttribute('aria-required', 'true');
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
};

/**
 * Export all utilities as default object
 */
export default {
  focusManagement,
  ariaUtils,
  keyboardUtils,
  contrastUtils,
  screenReaderUtils,
  touchUtils,
  formUtils
};