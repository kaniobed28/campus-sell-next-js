/**
 * Responsive configuration constants for breakpoints, grid columns, and spacing
 * Based on Tailwind CSS default breakpoints with custom enhancements
 */

export const responsiveConfig = {
  breakpoints: {
    mobile: { min: 320, max: 767 },
    tablet: { min: 768, max: 1023 },
    desktop: { min: 1024, max: Infinity }
  },
  
  // Tailwind breakpoint values for consistency
  tailwindBreakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  gridColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
    // Specific grid configurations for different content types
    products: {
      mobile: 1,
      tablet: 2,
      desktop: 4
    },
    categories: {
      mobile: 2,
      tablet: 3,
      desktop: 6
    }
  },
  
  spacing: {
    mobile: { 
      container: 'px-4', 
      gap: 'gap-4',
      padding: 16,
      margin: 16
    },
    tablet: { 
      container: 'px-6', 
      gap: 'gap-6',
      padding: 24,
      margin: 24
    },
    desktop: { 
      container: 'px-8', 
      gap: 'gap-8',
      padding: 32,
      margin: 32
    }
  },
  
  // Touch target sizes for accessibility
  touchTargets: {
    minimum: 44, // Minimum touch target size in pixels
    recommended: 48, // Recommended touch target size
    comfortable: 56 // Comfortable touch target size
  },
  
  // Typography scaling
  typography: {
    mobile: {
      heading: 'text-2xl',
      subheading: 'text-lg',
      body: 'text-base',
      small: 'text-sm'
    },
    tablet: {
      heading: 'text-3xl',
      subheading: 'text-xl',
      body: 'text-base',
      small: 'text-sm'
    },
    desktop: {
      heading: 'text-4xl',
      subheading: 'text-2xl',
      body: 'text-lg',
      small: 'text-base'
    }
  }
};

/**
 * Get device type based on screen width
 * @param {number} width - Screen width in pixels
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = (width) => {
  if (width < responsiveConfig.breakpoints.tablet.min) {
    return 'mobile';
  } else if (width < responsiveConfig.breakpoints.desktop.min) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Check if current width matches a specific device type
 * @param {number} width - Screen width in pixels
 * @param {string} deviceType - Device type to check against
 * @returns {boolean} Whether the width matches the device type
 */
export const isDeviceType = (width, deviceType) => {
  return getDeviceType(width) === deviceType;
};

/**
 * Get responsive classes based on device type
 * @param {string} deviceType - Current device type
 * @param {string} property - Property to get classes for (container, gap, etc.)
 * @returns {string} Tailwind CSS classes
 */
export const getResponsiveClasses = (deviceType, property) => {
  return responsiveConfig.spacing[deviceType]?.[property] || '';
};

/**
 * Get grid columns for a specific content type and device
 * @param {string} deviceType - Current device type
 * @param {string} contentType - Content type (products, categories, etc.)
 * @returns {number} Number of grid columns
 */
export const getGridColumns = (deviceType, contentType = 'default') => {
  if (contentType !== 'default' && responsiveConfig.gridColumns[contentType]) {
    return responsiveConfig.gridColumns[contentType][deviceType];
  }
  return responsiveConfig.gridColumns[deviceType];
};

export default responsiveConfig;