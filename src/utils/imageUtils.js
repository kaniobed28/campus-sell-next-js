/**
 * Utility functions for responsive image handling and optimization
 */

/**
 * Generate srcSet for responsive images
 * @param {string} baseSrc - Base image URL
 * @param {Array} widths - Array of widths for srcSet
 * @param {string} format - Image format (webp, jpg, png)
 * @returns {string} srcSet string
 */
export const generateSrcSet = (baseSrc, widths = [320, 640, 768, 1024, 1280, 1536], format = 'webp') => {
  if (!baseSrc) return '';
  
  // If it's a static import or already optimized, return as is
  if (typeof baseSrc === 'object' || baseSrc.includes('/_next/')) {
    return '';
  }
  
  // Generate srcSet for different widths
  return widths
    .map(width => {
      // For external URLs, we might need to use a service like Cloudinary or similar
      // For now, we'll return the original URL with width parameter if supported
      const url = new URL(baseSrc, window.location.origin);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('f', format);
      return `${url.toString()} ${width}w`;
    })
    .join(', ');
};

/**
 * Get optimal image dimensions based on viewport and container
 * @param {number} containerWidth - Container width in pixels
 * @param {number} containerHeight - Container height in pixels
 * @param {string} deviceType - Device type (mobile, tablet, desktop)
 * @returns {Object} Optimal dimensions
 */
export const getOptimalDimensions = (containerWidth, containerHeight, deviceType) => {
  const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  
  // Adjust for device pixel ratio but cap at 2x for performance
  const effectivePixelRatio = Math.min(pixelRatio, deviceType === 'mobile' ? 2 : 2);
  
  return {
    width: Math.round(containerWidth * effectivePixelRatio),
    height: Math.round(containerHeight * effectivePixelRatio),
    pixelRatio: effectivePixelRatio
  };
};

/**
 * Check if image format is supported
 * @param {string} format - Image format to check
 * @returns {boolean} Whether format is supported
 */
export const isFormatSupported = (format) => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
  } catch {
    return false;
  }
};

/**
 * Get preferred image format based on browser support
 * @returns {string} Preferred format (webp, avif, jpg)
 */
export const getPreferredFormat = () => {
  if (typeof window === 'undefined') return 'jpg';
  
  // Check for AVIF support (most modern)
  if (isFormatSupported('avif')) {
    return 'avif';
  }
  
  // Check for WebP support (widely supported)
  if (isFormatSupported('webp')) {
    return 'webp';
  }
  
  // Fallback to JPEG
  return 'jpg';
};

/**
 * Generate blur data URL for placeholder
 * @param {number} width - Blur image width
 * @param {number} height - Blur image height
 * @param {string} color - Base color for blur
 * @returns {string} Data URL for blur placeholder
 */
export const generateBlurDataURL = (width = 10, height = 10, color = '#f3f4f6') => {
  if (typeof document === 'undefined') {
    // Return a simple base64 encoded 1x1 pixel for SSR
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

/**
 * Generate a simple blur data URL for external images
 * @param {string} color - Base color for the blur (default: neutral gray)
 * @returns {string} Data URL for blur placeholder
 */
export const generateSimpleBlurDataURL = (color = '#f3f4f6') => {
  // Simple 1x1 pixel data URL for blur placeholder
  if (typeof btoa === 'undefined') {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
  
  // Convert hex color to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Create a simple SVG with the color
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="rgb(${r},${g},${b})"/></svg>`;
  const base64 = btoa(svg);
  
  return `data:image/svg+xml;base64,${base64}`;
};

/**
 * Calculate aspect ratio from dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {number} Aspect ratio
 */
export const calculateAspectRatio = (width, height) => {
  if (!width || !height) return 1;
  return width / height;
};

/**
 * Get responsive image sizes for common layouts
 * @param {string} layout - Layout type
 * @param {Object} options - Additional options
 * @returns {string} Sizes attribute value
 */
export const getResponsiveSizes = (layout, options = {}) => {
  const { columns, maxWidth = '1200px' } = options;
  
  switch (layout) {
    case 'hero':
      return '100vw';
    
    case 'full-width':
      return `(max-width: ${maxWidth}) 100vw, ${maxWidth}`;
    
    case 'grid-1':
      return '100vw';
    
    case 'grid-2':
      return '(max-width: 640px) 100vw, 50vw';
    
    case 'grid-3':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
    
    case 'grid-4':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    
    case 'sidebar':
      return '(max-width: 768px) 100vw, 25vw';
    
    case 'thumbnail':
      return '(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw';
    
    case 'custom-grid':
      if (columns) {
        const percentage = Math.round(100 / columns);
        return `(max-width: 640px) 100vw, (max-width: 768px) 50vw, ${percentage}vw`;
      }
      return '50vw';
    
    default:
      return '(max-width: 640px) 100vw, 50vw';
  }
};

/**
 * Preload critical images
 * @param {Array} imageSources - Array of image sources to preload
 * @param {Object} options - Preload options
 */
export const preloadImages = (imageSources, options = {}) => {
  const { priority = false, format = 'webp' } = options;
  
  if (typeof window === 'undefined') return;
  
  imageSources.forEach((src, index) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (format !== 'jpg') {
      link.type = `image/${format}`;
    }
    
    if (priority || index === 0) {
      link.fetchPriority = 'high';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images with intersection observer
 * @param {HTMLElement} element - Image element to observe
 * @param {Function} callback - Callback when image enters viewport
 * @param {Object} options - Observer options
 */
export const lazyLoadImage = (element, callback, options = {}) => {
  const { rootMargin = '50px', threshold = 0.1 } = options;
  
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    callback();
    return;
  }
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    },
    { rootMargin, threshold }
  );
  
  observer.observe(element);
  
  return () => observer.unobserve(element);
};

/**
 * Get image loading strategy based on position and device
 * @param {boolean} isAboveFold - Whether image is above the fold
 * @param {string} deviceType - Device type
 * @param {boolean} isHero - Whether it's a hero image
 * @returns {Object} Loading strategy
 */
export const getLoadingStrategy = (isAboveFold, deviceType, isHero = false) => {
  return {
    priority: isHero || (isAboveFold && deviceType !== 'mobile'),
    loading: isAboveFold ? 'eager' : 'lazy',
    placeholder: isAboveFold ? 'blur' : 'empty',
    quality: deviceType === 'mobile' ? 60 : deviceType === 'tablet' ? 70 : 75
  };
};

export default {
  generateSrcSet,
  getOptimalDimensions,
  isFormatSupported,
  getPreferredFormat,
  generateBlurDataURL,
  generateSimpleBlurDataURL,
  calculateAspectRatio,
  getResponsiveSizes,
  preloadImages,
  lazyLoadImage,
  getLoadingStrategy
};