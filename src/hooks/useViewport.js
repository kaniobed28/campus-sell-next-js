"use client";

import { useState, useEffect, useCallback } from 'react';
import { responsiveConfig, getDeviceType, isDeviceType } from '../utils/responsiveConfig';

/**
 * Custom hook for detecting screen sizes and device types
 * Provides viewport information and responsive utilities
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    deviceType: 'desktop' // Default to desktop for SSR
  });

  const updateViewport = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = getDeviceType(width);
    
    setViewport({
      width,
      height,
      deviceType
    });
  }, []);

  useEffect(() => {
    // Set initial viewport on mount
    updateViewport();
    
    // Add resize listener
    window.addEventListener('resize', updateViewport);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport);
    };
  }, [updateViewport]);

  // Utility functions
  const isMobile = viewport.deviceType === 'mobile';
  const isTablet = viewport.deviceType === 'tablet';
  const isDesktop = viewport.deviceType === 'desktop';
  
  // Breakpoint checks
  const isSmallScreen = viewport.width < responsiveConfig.tailwindBreakpoints.md;
  const isMediumScreen = viewport.width >= responsiveConfig.tailwindBreakpoints.md && 
                         viewport.width < responsiveConfig.tailwindBreakpoints.lg;
  const isLargeScreen = viewport.width >= responsiveConfig.tailwindBreakpoints.lg;
  
  // Touch device detection (basic heuristic)
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return {
    // Viewport dimensions
    width: viewport.width,
    height: viewport.height,
    
    // Device type
    deviceType: viewport.deviceType,
    
    // Device type booleans
    isMobile,
    isTablet,
    isDesktop,
    
    // Screen size booleans
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    
    // Touch detection
    isTouchDevice,
    
    // Utility functions
    isDeviceType: (type) => isDeviceType(viewport.width, type),
    
    // Responsive configuration access
    config: responsiveConfig
  };
};

/**
 * Hook for responsive breakpoint matching
 * Provides boolean values for common breakpoint checks
 */
export const useBreakpoint = () => {
  const { width } = useViewport();
  
  return {
    xs: width < responsiveConfig.tailwindBreakpoints.sm,
    sm: width >= responsiveConfig.tailwindBreakpoints.sm && width < responsiveConfig.tailwindBreakpoints.md,
    md: width >= responsiveConfig.tailwindBreakpoints.md && width < responsiveConfig.tailwindBreakpoints.lg,
    lg: width >= responsiveConfig.tailwindBreakpoints.lg && width < responsiveConfig.tailwindBreakpoints.xl,
    xl: width >= responsiveConfig.tailwindBreakpoints.xl && width < responsiveConfig.tailwindBreakpoints['2xl'],
    '2xl': width >= responsiveConfig.tailwindBreakpoints['2xl'],
    
    // Convenience methods
    isAbove: (breakpoint) => width >= responsiveConfig.tailwindBreakpoints[breakpoint],
    isBelow: (breakpoint) => width < responsiveConfig.tailwindBreakpoints[breakpoint]
  };
};

/**
 * Hook for responsive grid configuration
 * Provides grid column counts based on current viewport
 */
export const useResponsiveGrid = (contentType = 'default') => {
  const { deviceType } = useViewport();
  
  const getColumns = (type = contentType) => {
    if (type !== 'default' && responsiveConfig.gridColumns[type]) {
      return responsiveConfig.gridColumns[type][deviceType];
    }
    return responsiveConfig.gridColumns[deviceType];
  };
  
  return {
    columns: getColumns(),
    getColumns,
    deviceType,
    
    // Tailwind grid classes
    gridCols: `grid-cols-${getColumns()}`,
    smGridCols: `sm:grid-cols-${getColumns('products')}`,
    mdGridCols: `md:grid-cols-${responsiveConfig.gridColumns.products.tablet}`,
    lgGridCols: `lg:grid-cols-${responsiveConfig.gridColumns.products.desktop}`
  };
};

/**
 * Hook for responsive spacing utilities
 * Provides spacing classes based on current viewport
 */
export const useResponsiveSpacing = () => {
  const { deviceType } = useViewport();
  
  const spacing = responsiveConfig.spacing[deviceType];
  
  return {
    container: spacing.container,
    gap: spacing.gap,
    padding: spacing.padding,
    margin: spacing.margin,
    deviceType,
    
    // Utility functions
    getSpacing: (property) => spacing[property],
    getTouchTarget: () => responsiveConfig.touchTargets.minimum
  };
};

export default useViewport;