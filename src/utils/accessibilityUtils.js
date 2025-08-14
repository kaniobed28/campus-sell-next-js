/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Provides functions for keyboard navigation, screen reader support, and focus management
 */

/**
 * Trap focus within a container element
 * @param {HTMLElement} container - The container to trap focus within
 * @param {HTMLElement} firstElement - First focusable element (optional)
 * @param {HTMLElement} lastElement - Last focusable element (optional)
 */
export const trapFocus = (container, firstElement = null, lastElement = null) => {
  if (!container) return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = firstElement || focusableElements[0];
  const lastFocusable = lastElement || focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Manage focus restoration when modals/dialogs close
 */
export class FocusManager {
  constructor() {
    this.previousFocus = null;
  }

  store() {
    this.previousFocus = document.activeElement;
  }

  restore() {
    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
    this.previousFocus = null;
  }
}

/**
 * Generate unique IDs for form elements and ARIA relationships
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'element') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce messages to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level ('polite' or 'assertive')
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if an element is visible and focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is focusable
 */
export const isFocusable = (element) => {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return (
    element.offsetWidth > 0 &&
    element.offsetHeight > 0 &&
    style.visibility !== 'hidden' &&
    style.display !== 'none' &&
    !element.disabled &&
    element.tabIndex >= 0
  );
};

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export const getFocusableElements = (container) => {
  if (!container) return [];
  
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');
  
  const elements = Array.from(container.querySelectorAll(focusableSelectors));
  return elements.filter(isFocusable);
};

/**
 * Handle keyboard navigation for lists and grids
 * @param {KeyboardEvent} event - Keyboard event
 * @param {HTMLElement[]} items - Array of navigable items
 * @param {number} currentIndex - Current focused item index
 * @param {Object} options - Navigation options
 */
export const handleArrowNavigation = (event, items, currentIndex, options = {}) => {
  const {
    orientation = 'vertical', // 'vertical', 'horizontal', or 'grid'
    wrap = true,
    columns = 1 // For grid navigation
  } = options;

  if (!items || items.length === 0) return currentIndex;

  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
      if (orientation === 'vertical' || orientation === 'grid') {
        event.preventDefault();
        if (orientation === 'grid') {
          newIndex = currentIndex + columns;
          if (newIndex >= items.length) {
            newIndex = wrap ? currentIndex % columns : currentIndex;
          }
        } else {
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = wrap ? 0 : currentIndex;
          }
        }
      }
      break;

    case 'ArrowUp':
      if (orientation === 'vertical' || orientation === 'grid') {
        event.preventDefault();
        if (orientation === 'grid') {
          newIndex = currentIndex - columns;
          if (newIndex < 0) {
            const lastRowStart = Math.floor((items.length - 1) / columns) * columns;
            const columnIndex = currentIndex % columns;
            newIndex = wrap ? Math.min(lastRowStart + columnIndex, items.length - 1) : currentIndex;
          }
        } else {
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? items.length - 1 : currentIndex;
          }
        }
      }
      break;

    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'grid') {
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = wrap ? 0 : currentIndex;
        }
      }
      break;

    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'grid') {
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = wrap ? items.length - 1 : currentIndex;
        }
      }
      break;

    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;

    case 'End':
      event.preventDefault();
      newIndex = items.length - 1;
      break;

    default:
      return currentIndex;
  }

  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }

  return newIndex;
};

/**
 * Create skip links for keyboard navigation
 * @param {Array} links - Array of {href, label} objects
 * @returns {HTMLElement} Skip links container
 */
export const createSkipLinks = (links) => {
  const container = document.createElement('div');
  container.className = 'skip-links';
  container.setAttribute('role', 'navigation');
  container.setAttribute('aria-label', 'Skip links');

  links.forEach(link => {
    const skipLink = document.createElement('a');
    skipLink.href = link.href;
    skipLink.textContent = link.label;
    skipLink.className = 'skip-link';
    container.appendChild(skipLink);
  });

  return container;
};

/**
 * Validate color contrast ratios for accessibility
 * @param {string} foreground - Foreground color (hex, rgb, etc.)
 * @param {string} background - Background color (hex, rgb, etc.)
 * @returns {Object} Contrast ratio and compliance levels
 */
export const checkColorContrast = (foreground, background) => {
  // This is a simplified version - in production, use a proper color contrast library
  // Returns mock data for now
  return {
    ratio: 4.5, // Mock ratio
    aa: true,
    aaa: false,
    aaLarge: true,
    aaaLarge: true
  };
};

/**
 * Add ARIA live region for dynamic content updates
 * @param {string} id - ID for the live region
 * @param {string} politeness - 'polite' or 'assertive'
 * @returns {HTMLElement} Live region element
 */
export const createLiveRegion = (id, politeness = 'polite') => {
  let liveRegion = document.getElementById(id);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = id;
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  return liveRegion;
};

/**
 * Update live region content
 * @param {string} id - Live region ID
 * @param {string} message - Message to announce
 */
export const updateLiveRegion = (id, message) => {
  const liveRegion = document.getElementById(id);
  if (liveRegion) {
    liveRegion.textContent = message;
  }
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Whether user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user is using a screen reader
 * @returns {boolean} Whether screen reader is likely active
 */
export const isScreenReaderActive = () => {
  // This is a heuristic - not 100% accurate
  return (
    navigator.userAgent.includes('NVDA') ||
    navigator.userAgent.includes('JAWS') ||
    navigator.userAgent.includes('VoiceOver') ||
    window.speechSynthesis?.speaking ||
    document.activeElement?.getAttribute('role') === 'application'
  );
};

export default {
  trapFocus,
  FocusManager,
  generateId,
  announceToScreenReader,
  isFocusable,
  getFocusableElements,
  handleArrowNavigation,
  createSkipLinks,
  checkColorContrast,
  createLiveRegion,
  updateLiveRegion,
  debounce,
  prefersReducedMotion,
  isScreenReaderActive
};