"use client";

import React from 'react';
import ResponsiveImage from './ResponsiveImage';
import { useViewport } from '@/hooks/useViewport';

/**
 * ResponsiveImageContainer component for different image layouts and contexts
 * Provides pre-configured responsive image containers for common use cases
 */
const ResponsiveImageContainer = ({
  src,
  alt,
  variant = 'product', // 'product', 'hero', 'thumbnail', 'gallery', 'avatar'
  className = '',
  containerClassName = '',
  priority = false,
  onImageClick,
  showOverlay = false,
  overlayContent,
  ...props
}) => {
  const { isMobile, isTablet, isTouchDevice } = useViewport();

  // Get variant-specific configurations
  const getVariantConfig = () => {
    switch (variant) {
      case 'product':
        return {
          aspectRatio: 'square',
          sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
          containerClass: 'rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow duration-200',
          imageClass: 'group-hover:scale-105 transition-transform duration-300'
        };
      
      case 'hero':
        return {
          aspectRatio: 'video',
          sizes: '100vw',
          containerClass: 'rounded-xl overflow-hidden',
          imageClass: 'object-cover'
        };
      
      case 'thumbnail':
        return {
          aspectRatio: 'square',
          sizes: '(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw',
          containerClass: 'rounded-md overflow-hidden bg-muted',
          imageClass: 'hover:opacity-80 transition-opacity duration-200'
        };
      
      case 'gallery':
        return {
          aspectRatio: 'auto',
          sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw',
          containerClass: 'rounded-lg overflow-hidden cursor-pointer',
          imageClass: 'hover:scale-105 transition-transform duration-300'
        };
      
      case 'avatar':
        return {
          aspectRatio: 'square',
          sizes: '(max-width: 640px) 15vw, 10vw',
          containerClass: 'rounded-full overflow-hidden bg-muted border-2 border-border',
          imageClass: 'object-cover'
        };
      
      default:
        return {
          aspectRatio: 'square',
          sizes: '(max-width: 640px) 100vw, 50vw',
          containerClass: 'rounded-lg overflow-hidden',
          imageClass: ''
        };
    }
  };

  const config = getVariantConfig();

  // Handle image click
  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick();
    }
  };

  // Responsive touch target sizing for clickable images
  const getTouchTargetClass = () => {
    if (!onImageClick) return '';
    return isTouchDevice ? 'min-h-[44px] min-w-[44px]' : '';
  };

  return (
    <div 
      className={`
        group relative
        ${config.containerClass}
        ${onImageClick ? 'cursor-pointer' : ''}
        ${getTouchTargetClass()}
        ${containerClassName}
      `}
      onClick={handleImageClick}
      role={onImageClick ? 'button' : undefined}
      tabIndex={onImageClick ? 0 : undefined}
      onKeyDown={onImageClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleImageClick();
        }
      } : undefined}
    >
      <ResponsiveImage
        src={src}
        alt={alt}
        aspectRatio={config.aspectRatio}
        sizes={config.sizes}
        className={`${config.imageClass} ${className}`}
        priority={priority}
        {...props}
      />
      
      {/* Responsive overlay */}
      {showOverlay && (
        <div className={`
          absolute inset-0 bg-black/0 group-hover:bg-black/20 
          transition-colors duration-300 flex items-center justify-center
          ${isMobile ? 'bg-black/10' : ''}
        `}>
          {overlayContent && (
            <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {overlayContent}
            </div>
          )}
        </div>
      )}
      
      {/* Loading indicator for mobile */}
      {isMobile && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

/**
 * Specialized components for common use cases
 */

// Product image component
export const ProductImageContainer = (props) => (
  <ResponsiveImageContainer variant="product" {...props} />
);

// Hero image component
export const HeroImageContainer = (props) => (
  <ResponsiveImageContainer variant="hero" {...props} />
);

// Thumbnail image component
export const ThumbnailImageContainer = (props) => (
  <ResponsiveImageContainer variant="thumbnail" {...props} />
);

// Gallery image component
export const GalleryImageContainer = (props) => (
  <ResponsiveImageContainer variant="gallery" showOverlay {...props} />
);

// Avatar image component
export const AvatarImageContainer = (props) => (
  <ResponsiveImageContainer variant="avatar" {...props} />
);

export default ResponsiveImageContainer;