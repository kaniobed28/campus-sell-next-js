# Responsive Images Implementation

This document describes the comprehensive responsive image system implemented for the Campus Sell application.

## Overview

The responsive image system provides adaptive image loading, proper aspect ratios, fallback states, and performance optimizations across all device types. It leverages Next.js Image component with custom enhancements for responsive behavior.

## Components

### 1. ResponsiveImage

The core responsive image component with adaptive loading and fallback states.

```jsx
import ResponsiveImage from '@/components/ResponsiveImage';

<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  aspectRatio="square"
  priority={false}
  quality={75}
  fallbackSrc="/fallback.jpg"
  onLoad={handleLoad}
  onError={handleError}
/>
```

**Props:**
- `src` - Image source URL
- `alt` - Alt text for accessibility
- `aspectRatio` - 'square', 'video', 'portrait', 'landscape', 'auto'
- `priority` - Whether to load with priority
- `quality` - Image quality (1-100)
- `sizes` - Custom sizes attribute
- `fallbackSrc` - Fallback image URL
- `showFallbackIcon` - Show icon when no image available
- `onLoad` - Load event handler
- `onError` - Error event handler

### 2. ResponsiveImageContainer

Pre-configured image containers for common use cases.

```jsx
import ResponsiveImageContainer, {
  ProductImageContainer,
  HeroImageContainer,
  ThumbnailImageContainer,
  GalleryImageContainer,
  AvatarImageContainer
} from '@/components/ResponsiveImageContainer';

// Product image
<ProductImageContainer
  src="/product.jpg"
  alt="Product"
  onImageClick={handleClick}
/>

// Hero image
<HeroImageContainer
  src="/hero.jpg"
  alt="Hero"
  priority={true}
/>
```

**Variants:**
- `product` - Square aspect ratio, hover effects, optimized for product grids
- `hero` - Video aspect ratio, full-width sizing, priority loading
- `thumbnail` - Small square images, minimal spacing
- `gallery` - Auto aspect ratio, overlay effects, click handlers
- `avatar` - Circular images, border styling

## Hooks

### useResponsiveImage

Provides responsive image utilities and adaptive loading strategies.

```jsx
import { useResponsiveImage } from '@/hooks/useResponsiveImage';

const {
  generateSizes,
  getOptimalQuality,
  shouldUsePriority,
  getCurrentBreakpoint,
  deviceType
} = useResponsiveImage();

// Generate sizes for grid layout
const sizes = generateSizes('grid', 4); // 4 columns

// Get optimal quality for current device
const quality = getOptimalQuality(75);

// Check if image should use priority loading
const priority = shouldUsePriority(isAboveFold, isHero);
```

### useImageLoader

Manages image loading states with responsive behavior.

```jsx
import { useImageLoader } from '@/hooks/useResponsiveImage';

const {
  src,
  isLoading,
  hasError,
  handleLoad,
  handleError,
  retry
} = useImageLoader('/image.jpg', '/fallback.jpg');
```

### useResponsiveAspectRatio

Provides responsive aspect ratio utilities.

```jsx
import { useResponsiveAspectRatio } from '@/hooks/useResponsiveImage';

const {
  getAspectRatio,
  getAspectRatioClass
} = useResponsiveAspectRatio('square');

// Get responsive aspect ratio (adjusts for mobile)
const ratio = getAspectRatio('landscape'); // Returns 'video' on mobile

// Get CSS class for aspect ratio
const className = getAspectRatioClass('square'); // Returns 'aspect-square'
```

## Utilities

### imageUtils

Collection of image optimization and handling utilities.

```jsx
import {
  generateSrcSet,
  getOptimalDimensions,
  getPreferredFormat,
  getResponsiveSizes,
  getLoadingStrategy
} from '@/utils/imageUtils';

// Generate srcSet for responsive images
const srcSet = generateSrcSet('/image.jpg', [320, 640, 1024]);

// Get optimal dimensions for device
const { width, height } = getOptimalDimensions(300, 200, 'mobile');

// Get preferred image format
const format = getPreferredFormat(); // 'avif', 'webp', or 'jpg'

// Get responsive sizes for layout
const sizes = getResponsiveSizes('grid-4');

// Get loading strategy
const strategy = getLoadingStrategy(isAboveFold, deviceType, isHero);
```

## Features

### 1. Adaptive Loading

- **Priority Loading**: Hero and above-the-fold images load with priority
- **Lazy Loading**: Below-the-fold images load lazily
- **Quality Optimization**: Reduced quality on mobile devices for faster loading
- **Format Selection**: Automatic format selection (AVIF > WebP > JPEG)

### 2. Responsive Sizing

- **Breakpoint-Aware**: Adapts to Tailwind CSS breakpoints
- **Device-Specific**: Different sizing strategies for mobile, tablet, desktop
- **Layout-Optimized**: Pre-configured sizes for common layouts
- **Custom Sizes**: Support for custom sizes attributes

### 3. Aspect Ratios

- **Responsive Ratios**: Aspect ratios adapt to device type
- **CSS Classes**: Automatic Tailwind aspect ratio classes
- **Flexible Options**: Square, video, portrait, landscape, wide, auto
- **Mobile Optimization**: Simplified ratios on mobile devices

### 4. Error Handling

- **Fallback Images**: Automatic fallback to alternative sources
- **Graceful Degradation**: Placeholder states when images fail
- **Retry Mechanism**: Built-in retry functionality
- **Loading States**: Visual feedback during image loading

### 5. Performance Optimization

- **Responsive Images**: Proper srcSet and sizes attributes
- **Device Pixel Ratio**: Optimized for high-DPI displays
- **Bundle Optimization**: Minimal impact on bundle size
- **Caching Strategy**: Efficient caching for repeat visits

## Integration Examples

### Updating Existing Components

```jsx
// Before
<img
  src={image}
  alt={title}
  className="w-full h-48 object-cover"
/>

// After
<ProductImageContainer
  src={image}
  alt={title}
  className="h-48"
  fallbackSrc="/placeholder.jpg"
/>
```

### Product Grid

```jsx
import { ProductImageContainer } from '@/components/ResponsiveImageContainer';

const ProductGrid = ({ products }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {products.map(product => (
      <div key={product.id} className="card">
        <ProductImageContainer
          src={product.image}
          alt={product.title}
          onImageClick={() => openProduct(product.id)}
        />
        <div className="p-4">
          <h3>{product.title}</h3>
          <p>${product.price}</p>
        </div>
      </div>
    ))}
  </div>
);
```

### Hero Section

```jsx
import { HeroImageContainer } from '@/components/ResponsiveImageContainer';

const HeroSection = () => (
  <section className="relative">
    <HeroImageContainer
      src="/hero-image.jpg"
      alt="Campus marketplace"
      priority={true}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-white">Welcome to Campus Sell</h1>
    </div>
  </section>
);
```

## Testing

The implementation includes comprehensive tests for all components and utilities:

- **Component Tests**: React Testing Library tests for all components
- **Hook Tests**: Tests for all custom hooks
- **Utility Tests**: Unit tests for utility functions
- **Integration Tests**: Tests for component integration

Run validation:
```bash
node validate-responsive-images.js
```

## Browser Support

- **Modern Browsers**: Full support for all features
- **Legacy Browsers**: Graceful degradation with fallbacks
- **Mobile Browsers**: Optimized for mobile performance
- **Touch Devices**: Touch-friendly interactions

## Performance Metrics

- **Lighthouse Score**: Improved image performance scores
- **Core Web Vitals**: Better LCP and CLS scores
- **Bundle Size**: Minimal impact on JavaScript bundle
- **Network Usage**: Reduced bandwidth usage on mobile

## Best Practices

1. **Use Priority Loading**: For above-the-fold and hero images
2. **Provide Alt Text**: Always include descriptive alt text
3. **Use Fallbacks**: Provide fallback images for critical content
4. **Optimize Quality**: Use appropriate quality settings for device type
5. **Choose Aspect Ratios**: Select appropriate aspect ratios for content
6. **Test on Devices**: Test on real devices for best results

## Migration Guide

To migrate existing image usage:

1. Replace `<img>` tags with `<ResponsiveImage>`
2. Use container components for common patterns
3. Add fallback images for critical content
4. Update CSS classes to work with aspect ratios
5. Test responsive behavior across devices

## Future Enhancements

- **Art Direction**: Different images for different breakpoints
- **WebP/AVIF Support**: Enhanced format support
- **Blur Placeholders**: Generated blur placeholders
- **Progressive Loading**: Progressive JPEG support
- **CDN Integration**: Integration with image CDNs