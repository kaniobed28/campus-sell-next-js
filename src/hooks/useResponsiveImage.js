"use client";

import { useState, useCallback, useEffect } from 'react';
import { useViewport } from './useViewport';

/**
 * Hook for responsive image utilities and adaptive loading
 * Provides image optimization and loading strategies based on viewport
 */
export const useResponsiveImage = () => {
  const { deviceType, isMobile, isTablet, isDesktop, width } = useViewport();

  /**
   * Generate responsive sizes attribute based on layout and content type
   * @param {string} layout - Layout type: 'grid', 'hero', 'thumbnail', 'full'
   * @param {number} columns - Number of columns in grid layout
   * @returns {string} Sizes attribute value
   */
  const generateSizes = useCallback((layout = 'grid', columns = null) => {
    switch (layout) {
      case 'hero':
        return '100vw';
      
      case 'full':
        return '100vw';
      
      case 'thumbnail':
        return '(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw';
      
      case 'grid':
        const cols = columns || (isMobile ? 1 : isTablet ? 2 : 4);
        const percentage = Math.round(100 / cols);
        return `(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) ${percentage}vw, ${percentage}vw`;
      
      case 'sidebar':
        return '(max-width: 768px) 100vw, 25vw';
      
      case 'card':
        return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
      
      default:
        return '(max-width: 640px) 100vw, 50vw';
    }
  }, [isMobile, isTablet, deviceType]);

  /**
   * Get optimal image quality based on device type and network conditions
   * @param {number} baseQuality - Base quality (default: 75)
   * @returns {number} Optimized quality value
   */
  const getOptimalQuality = useCallback((baseQuality = 75) => {
    // Reduce quality for mobile devices to improve loading times
    if (isMobile) {
      return Math.max(baseQuality - 15, 50);
    }
    
    if (isTablet) {
      return Math.max(baseQuality - 10, 60);
    }
    
    return baseQuality;
  }, [isMobile, isTablet]);

  /**
   * Determine if image should be loaded with priority
   * @param {boolean} isAboveFold - Whether image is above the fold
   * @param {boolean} isHero - Whether image is a hero image
   * @returns {boolean} Should use priority loading
   */
  const shouldUsePriority = useCallback((isAboveFold = false, isHero = false) => {
    return isHero || (isAboveFold && (isDesktop || isTablet));
  }, [isDesktop, isTablet]);

  /**
   * Get responsive breakpoint for image loading
   * @returns {string} Current breakpoint
   */
  const getCurrentBreakpoint = useCallback(() => {
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }, [width]);

  return {
    // Utility functions
    generateSizes,
    getOptimalQuality,
    shouldUsePriority,
    getCurrentBreakpoint,
    
    // Device information
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    
    // Viewport information
    width,
    breakpoint: getCurrentBreakpoint()
  };
};

/**
 * Hook for managing image loading states with responsive behavior
 * @param {string} src - Image source URL
 * @param {string} fallbackSrc - Fallback image source
 */
export const useImageLoader = (src, fallbackSrc = null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const { isMobile } = useViewport();

  // Handle image load success
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Handle image load error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    
    // Try fallback source if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }
  }, [fallbackSrc, currentSrc]);

  // Reset states when src changes
  useEffect(() => {
    if (src !== currentSrc && src) {
      setCurrentSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, currentSrc]);

  // Preload image for better UX (desktop only to save mobile bandwidth)
  useEffect(() => {
    if (!isMobile && src && src !== currentSrc) {
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.onerror = handleError;
      img.src = src;
    }
  }, [src, currentSrc, isMobile, handleError]);

  return {
    src: currentSrc,
    isLoading,
    hasError,
    handleLoad,
    handleError,
    
    // Retry function
    retry: () => {
      if (src) {
        setCurrentSrc(src);
        setIsLoading(true);
        setHasError(false);
      }
    }
  };
};

/**
 * Hook for responsive image aspect ratios
 * @param {string} defaultRatio - Default aspect ratio
 */
export const useResponsiveAspectRatio = (defaultRatio = 'square') => {
  const { isMobile, isTablet } = useViewport();

  const getAspectRatio = useCallback((ratio = defaultRatio) => {
    // Adjust aspect ratios for mobile devices
    if (isMobile) {
      switch (ratio) {
        case 'landscape':
          return 'video'; // 16:9 instead of 4:3 for mobile
        case 'portrait':
          return 'square'; // Square instead of 3:4 for mobile
        default:
          return ratio;
      }
    }
    
    return ratio;
  }, [isMobile, defaultRatio]);

  const getAspectRatioClass = useCallback((ratio = defaultRatio) => {
    const adjustedRatio = getAspectRatio(ratio);
    
    switch (adjustedRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'wide':
        return 'aspect-[21/9]';
      case 'auto':
        return '';
      default:
        return 'aspect-square';
    }
  }, [getAspectRatio, defaultRatio]);

  return {
    getAspectRatio,
    getAspectRatioClass,
    isMobile,
    isTablet
  };
};

export default useResponsiveImage;