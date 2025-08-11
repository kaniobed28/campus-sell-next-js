# Responsive Utility Hooks

This directory contains custom React hooks for responsive design and viewport detection.

## useViewport Hook

The `useViewport` hook provides comprehensive viewport information and device type detection.

### Basic Usage

```jsx
import { useViewport } from '../hooks/useViewport';

function MyComponent() {
  const { width, height, deviceType, isMobile, isTablet, isDesktop } = useViewport();
  
  return (
    <div>
      <p>Screen: {width}x{height}</p>
      <p>Device: {deviceType}</p>
      {isMobile && <p>Mobile-specific content</p>}
    </div>
  );
}
```

### Available Properties

- `width`: Current viewport width in pixels
- `height`: Current viewport height in pixels
- `deviceType`: String - 'mobile', 'tablet', or 'desktop'
- `isMobile`: Boolean - true if device type is mobile
- `isTablet`: Boolean - true if device type is tablet
- `isDesktop`: Boolean - true if device type is desktop
- `isSmallScreen`: Boolean - true if width < 768px
- `isMediumScreen`: Boolean - true if width is 768px-1023px
- `isLargeScreen`: Boolean - true if width >= 1024px
- `isTouchDevice`: Boolean - basic touch device detection
- `isDeviceType(type)`: Function to check specific device type
- `config`: Access to responsive configuration object

## useBreakpoint Hook

The `useBreakpoint` hook provides Tailwind CSS breakpoint matching.

### Usage

```jsx
import { useBreakpoint } from '../hooks/useViewport';

function MyComponent() {
  const { xs, sm, md, lg, xl, isAbove, isBelow } = useBreakpoint();
  
  return (
    <div>
      {md && <p>Medium screen content</p>}
      {isAbove('lg') && <p>Large screen and above</p>}
    </div>
  );
}
```

### Available Properties

- `xs`, `sm`, `md`, `lg`, `xl`, `2xl`: Boolean values for each breakpoint
- `isAbove(breakpoint)`: Function to check if above a breakpoint
- `isBelow(breakpoint)`: Function to check if below a breakpoint

## useResponsiveGrid Hook

The `useResponsiveGrid` hook provides responsive grid configuration.

### Usage

```jsx
import { useResponsiveGrid } from '../hooks/useViewport';

function ProductGrid() {
  const { columns, gridCols, getColumns } = useResponsiveGrid('products');
  
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {/* Grid items */}
    </div>
  );
}
```

### Available Properties

- `columns`: Number of columns for current device
- `getColumns(contentType)`: Function to get columns for specific content type
- `deviceType`: Current device type
- `gridCols`: Tailwind grid class for current columns
- `smGridCols`, `mdGridCols`, `lgGridCols`: Responsive grid classes

## useResponsiveSpacing Hook

The `useResponsiveSpacing` hook provides responsive spacing utilities.

### Usage

```jsx
import { useResponsiveSpacing } from '../hooks/useViewport';

function MyComponent() {
  const { container, gap, padding, getTouchTarget } = useResponsiveSpacing();
  
  return (
    <div className={container}>
      <div className={`grid ${gap}`}>
        <button style={{ minHeight: `${getTouchTarget()}px` }}>
          Touch-friendly button
        </button>
      </div>
    </div>
  );
}
```

### Available Properties

- `container`: Tailwind container padding class
- `gap`: Tailwind gap class
- `padding`: Padding value in pixels
- `margin`: Margin value in pixels
- `getSpacing(property)`: Function to get specific spacing value
- `getTouchTarget()`: Function to get minimum touch target size

## Responsive Configuration

The responsive utilities are based on a configuration object located in `src/utils/responsiveConfig.js`.

### Breakpoints

```javascript
{
  mobile: { min: 320, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
}
```

### Grid Columns

```javascript
{
  mobile: 1,
  tablet: 2,
  desktop: 4,
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
}
```

### Touch Targets

```javascript
{
  minimum: 44,      // Minimum accessible touch target
  recommended: 48,  // Recommended touch target
  comfortable: 56   // Comfortable touch target
}
```

## Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Touch Targets**: Use minimum 44px touch targets for interactive elements
3. **Performance**: The hooks automatically handle resize events and cleanup
4. **SSR**: Hooks provide sensible defaults for server-side rendering
5. **Content Types**: Use specific content types ('products', 'categories') for optimized grid layouts

## Example Component

See `src/components/examples/ResponsiveExample.jsx` for a comprehensive example of using all responsive utilities.

## Testing

Unit tests are available in `src/hooks/__tests__/useViewport.test.js` and `src/utils/__tests__/responsiveConfig.test.js`.

Run validation with:
```bash
node validate-responsive-utils.js
```