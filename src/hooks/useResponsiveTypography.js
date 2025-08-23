"use client";

import { useViewport } from "./useViewport";
import { responsiveTypographyTokens } from "@/styles/themes/tokens";

/**
 * Hook for responsive typography utilities
 * Provides responsive text classes and utilities based on current viewport
 */
export const useResponsiveTypography = () => {
  const { isMobile, isTablet, isDesktop } = useViewport();

  /**
   * Get responsive text class for a given typography scale
   * @param {string} scale - Typography scale (e.g., 'heading-1', 'body-base')
   * @returns {string} CSS class name
   */
  const getResponsiveTextClass = (scale) => {
    const validScales = [
      'display-xl', 'display-lg', 'display-md',
      'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6',
      'body-xl', 'body-lg', 'body-base', 'body-sm', 'body-xs',
      'caption', 'label'
    ];

    if (!validScales.includes(scale)) {
      console.warn(`Invalid typography scale: ${scale}. Using 'body-base' as fallback.`);
      return 'text-body-base';
    }

    return `text-${scale}`;
  };

  /**
   * Get responsive font size and line height for a given scale
   * @param {string} scale - Typography scale
   * @returns {object} Font size and line height values
   */
  const getResponsiveFontSize = (scale) => {
    const scaleConfig = responsiveTypographyTokens.responsiveFontSizes[scale];
    
    if (!scaleConfig) {
      return {
        fontSize: '1rem',
        lineHeight: '1.5rem',
        letterSpacing: '0'
      };
    }

    let config;
    if (isMobile) {
      config = scaleConfig.mobile;
    } else if (isTablet) {
      config = scaleConfig.tablet;
    } else {
      config = scaleConfig.desktop;
    }

    return {
      fontSize: config[0],
      lineHeight: config[1].lineHeight,
      letterSpacing: config[1].letterSpacing
    };
  };

  /**
   * Get responsive heading class based on heading level and context
   * @param {number} level - Heading level (1-6)
   * @param {string} context - Context ('display', 'section', 'card')
   * @returns {string} CSS class name
   */
  const getResponsiveHeadingClass = (level, context = 'section') => {
    if (level < 1 || level > 6) {
      console.warn(`Invalid heading level: ${level}. Using level 1.`);
      level = 1;
    }

    // Adjust heading size based on context
    if (context === 'display') {
      // Display headings are larger
      if (level === 1) return 'text-display-xl';
      if (level === 2) return 'text-display-lg';
      if (level === 3) return 'text-display-md';
    } else if (context === 'card') {
      // Card headings are smaller
      level = Math.min(level + 1, 6);
    }

    return `text-heading-${level}`;
  };

  /**
   * Get responsive body text class based on size and context
   * @param {string} size - Size ('xs', 'sm', 'base', 'lg', 'xl')
   * @param {string} context - Context ('primary', 'secondary', 'caption')
   * @returns {string} CSS class name
   */
  const getResponsiveBodyClass = (size = 'base', context = 'primary') => {
    const validSizes = ['xs', 'sm', 'base', 'lg', 'xl'];
    
    if (!validSizes.includes(size)) {
      console.warn(`Invalid body text size: ${size}. Using 'base'.`);
      size = 'base';
    }

    if (context === 'caption') {
      return 'text-caption';
    } else if (context === 'label') {
      return 'text-label';
    }

    return `text-body-${size}`;
  };

  /**
   * Get responsive line height class
   * @param {string} spacing - Line height spacing ('tight', 'snug', 'normal', 'relaxed', 'loose')
   * @returns {string} CSS class name
   */
  const getResponsiveLineHeight = (spacing = 'normal') => {
    const validSpacings = ['tight', 'snug', 'normal', 'relaxed', 'loose'];
    
    if (!validSpacings.includes(spacing)) {
      console.warn(`Invalid line height spacing: ${spacing}. Using 'normal'.`);
      spacing = 'normal';
    }

    return `leading-responsive-${spacing}`;
  };

  /**
   * Get responsive letter spacing class
   * @param {string} spacing - Letter spacing ('tighter', 'tight', 'normal', 'wide', 'wider', 'widest')
   * @returns {string} CSS class name
   */
  const getResponsiveLetterSpacing = (spacing = 'normal') => {
    const validSpacings = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];
    
    if (!validSpacings.includes(spacing)) {
      console.warn(`Invalid letter spacing: ${spacing}. Using 'normal'.`);
      spacing = 'normal';
    }

    return `tracking-responsive-${spacing}`;
  };

  /**
   * Get responsive text alignment class
   * @param {string} alignment - Text alignment ('left', 'center', 'right')
   * @param {string} breakpoint - Breakpoint ('mobile', 'tablet', 'desktop', 'all')
   * @returns {string} CSS class name
   */
  const getResponsiveTextAlignment = (alignment = 'left', breakpoint = 'all') => {
    const validAlignments = ['left', 'center', 'right'];
    
    if (!validAlignments.includes(alignment)) {
      console.warn(`Invalid text alignment: ${alignment}. Using 'left'.`);
      alignment = 'left';
    }

    if (breakpoint === 'all') {
      return `text-${alignment}`;
    } else if (breakpoint === 'tablet') {
      return `text-responsive-${alignment}-md`;
    } else if (breakpoint === 'desktop') {
      return `text-responsive-${alignment}-lg`;
    }

    return `text-${alignment}`;
  };

  /**
   * Generate complete typography class string
   * @param {object} options - Typography options
   * @returns {string} Complete CSS class string
   */
  const getTypographyClasses = (options = {}) => {
    const {
      scale = 'body-base',
      lineHeight = 'normal',
      letterSpacing = 'normal',
      alignment = 'left',
      weight,
      color = 'responsive-contrast'
    } = options;

    const classes = [
      getResponsiveTextClass(scale),
      getResponsiveLineHeight(lineHeight),
      getResponsiveLetterSpacing(letterSpacing),
      getResponsiveTextAlignment(alignment),
    ];

    if (weight) {
      classes.push(`font-${weight}`);
    }

    if (color) {
      classes.push(`text-${color}`);
    }

    return classes.filter(Boolean).join(' ');
  };

  /**
   * Get optimal text size for current viewport
   * @param {object} sizes - Size configuration for different viewports
   * @returns {string} CSS class name
   */
  const getOptimalTextSize = (sizes = {}) => {
    const { mobile = 'body-sm', tablet = 'body-base', desktop = 'body-lg' } = sizes;

    if (isMobile) return getResponsiveTextClass(mobile);
    if (isTablet) return getResponsiveTextClass(tablet);
    return getResponsiveTextClass(desktop);
  };

  return {
    // Core utilities
    getResponsiveTextClass,
    getResponsiveFontSize,
    getResponsiveHeadingClass,
    getResponsiveBodyClass,
    getResponsiveLineHeight,
    getResponsiveLetterSpacing,
    getResponsiveTextAlignment,
    
    // Convenience utilities
    getTypographyClasses,
    getOptimalTextSize,
    
    // Current viewport info
    currentViewport: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    isMobile,
    isTablet,
    isDesktop,
  };
};

/**
 * Typography component wrapper for consistent responsive text
 */
export const ResponsiveText = ({ 
  as: Component = 'p', 
  scale = 'body-base',
  className = '',
  children,
  ...props 
}) => {
  const { getResponsiveTextClass } = useResponsiveTypography();
  
  const textClass = getResponsiveTextClass(scale);
  const combinedClassName = `${textClass} ${className}`.trim();
  
  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

/**
 * Responsive heading component
 */
export const ResponsiveHeading = ({ 
  level = 1,
  context = 'section',
  className = '',
  children,
  ...props 
}) => {
  const { getResponsiveHeadingClass } = useResponsiveTypography();
  
  const Component = `h${level}`;
  const headingClass = getResponsiveHeadingClass(level, context);
  const combinedClassName = `${headingClass} ${className}`.trim();
  
  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
};

export default useResponsiveTypography;