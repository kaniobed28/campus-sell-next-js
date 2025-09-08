"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useViewport } from '@/hooks/useViewport';
import { generateSimpleBlurDataURL } from '@/utils/imageUtils';

/**
 * ResponsiveImage component with proper srcSet, sizes attributes, and adaptive loading
 * Provides responsive image handling with fallback states and error handling
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'square', // 'square', 'video', 'portrait', 'landscape', 'auto'
  priority = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc,
  showFallbackIcon = true,
  enableBlur = false, // Enable blur placeholder for external images
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useNativeImg, setUseNativeImg] = useState(false);
  const { deviceType, isMobile, isTablet, isDesktop } = useViewport();

  // Generate responsive sizes attribute based on viewport and aspect ratio
  const generateSizes = useCallback(() => {
    if (sizes) return sizes;
    
    // Default sizes based on common responsive patterns
    switch (aspectRatio) {
      case 'square':
        return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
      case 'video':
        return '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw';
      case 'portrait':
        return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
      case 'landscape':
        return '(max-width: 768px) 100vw, 75vw';
      default:
        return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
    }
  }, [sizes, aspectRatio]);

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'auto':
        return '';
      default:
        return 'aspect-square';
    }
  };

  // Handle image load
  const handleLoad = useCallback((event) => {
    setIsLoading(false);
    setImageError(false);
    onLoad?.(event);
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((event) => {
    // If it's a Next.js Image error and we're using external URL, fallback to native img
    if (!useNativeImg && typeof src === 'string' && src.startsWith('http')) {
      setUseNativeImg(true);
      setIsLoading(true);
      setImageError(false);
      return;
    }
    
    setImageError(true);
    setIsLoading(false);
    onError?.(event);
  }, [onError, useNativeImg, src]);

  // Generate responsive quality based on device type
  const getResponsiveQuality = () => {
    if (isMobile) return Math.max(quality - 10, 60); // Lower quality for mobile
    if (isTablet) return Math.max(quality - 5, 65);  // Slightly lower for tablet
    return quality; // Full quality for desktop
  };

  // Fallback component for error states
  const FallbackImage = () => (
    <div className={`
      relative overflow-hidden bg-muted flex items-center justify-center
      ${getAspectRatioClass()}
      ${containerClassName}
    `}>
      {showFallbackIcon && (
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {imageError ? 'Image unavailable' : 'Loading...'}
          </p>
        </div>
      )}
    </div>
  );

  // Loading placeholder
  const LoadingPlaceholder = () => (
    <div className={`
      relative overflow-hidden bg-muted animate-pulse
      ${getAspectRatioClass()}
      ${containerClassName}
    `}>
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer" />
    </div>
  );

  // Determine which source to use
  const imageSrc = imageError && fallbackSrc ? fallbackSrc : src;

  // Determine placeholder strategy based on image source and blurDataURL
  const getPlaceholderStrategy = () => {
    // If blurDataURL is provided, use blur placeholder
    if (blurDataURL) {
      return { placeholder: 'blur', blurDataURL };
    }
    
    // For static imports (Next.js optimized images), blur is supported
    if (typeof imageSrc === 'object' || (typeof imageSrc === 'string' && imageSrc.startsWith('/_next/'))) {
      return { placeholder: 'blur' };
    }
    
    // For external URLs, generate simple blur if enabled
    if (enableBlur && typeof imageSrc === 'string' && imageSrc.startsWith('http')) {
      return { 
        placeholder: 'blur', 
        blurDataURL: generateSimpleBlurDataURL('#f3f4f6') 
      };
    }
    
    // For external URLs without blur, use empty placeholder
    return { placeholder: 'empty' };
  };

  // If there's no src or an error occurred and no fallback, show fallback
  if (!src || (imageError && !fallbackSrc)) {
    return <FallbackImage />;
  }

  const placeholderStrategy = getPlaceholderStrategy();

  return (
    <div className={`
      relative overflow-hidden
      ${aspectRatio !== 'auto' ? getAspectRatioClass() : ''}
      ${containerClassName}
    `}>
      {isLoading && <LoadingPlaceholder />}
      
      {useNativeImg ? (
        // Fallback to native img for external URLs that Next.js Image can't handle
        <img
          src={imageSrc}
          alt={alt}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          {...props}
        />
      ) : (
        // Use Next.js Image for optimized loading
        <Image
          src={imageSrc}
          alt={alt}
          fill={aspectRatio !== 'auto'}
          width={aspectRatio === 'auto' ? props.width : undefined}
          height={aspectRatio === 'auto' ? props.height : undefined}
          className={`
            object-cover transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${className}
          `}
          sizes={generateSizes()}
          quality={getResponsiveQuality()}
          priority={priority}
          {...placeholderStrategy}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Responsive overlay for hover effects on non-touch devices */}
      {!isMobile && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
      )}
    </div>
  );
};

export default ResponsiveImage;