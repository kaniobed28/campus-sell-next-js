# Responsive Typography System

This document outlines the comprehensive responsive typography system implemented for the Campus Sell application. The system provides consistent, accessible, and mobile-first typography that scales appropriately across all device sizes.

## Overview

The responsive typography system includes:
- **Mobile-first approach**: Base styles target mobile devices with progressive enhancement
- **Semantic typography scales**: Display, heading, body, caption, and label text styles
- **Responsive font sizing**: Automatic scaling based on viewport size
- **Optimal readability**: Carefully tuned line heights and letter spacing
- **Accessibility compliance**: High contrast support and focus management
- **Performance optimized**: CSS-based responsive scaling for better performance

## Typography Scales

### Display Text
Used for hero sections and major impact text:
- `text-display-xl`: Largest display text (36px → 48px → 72px)
- `text-display-lg`: Large display text (30px → 36px → 60px)
- `text-display-md`: Medium display text (24px → 30px → 48px)

### Heading Hierarchy
Semantic heading levels with responsive scaling:
- `text-heading-1`: Primary headings (24px → 30px → 36px)
- `text-heading-2`: Secondary headings (20px → 24px → 30px)
- `text-heading-3`: Tertiary headings (18px → 20px → 24px)
- `text-heading-4`: Quaternary headings (16px → 18px → 20px)
- `text-heading-5`: Quinary headings (14px → 16px → 18px)
- `text-heading-6`: Senary headings (12px → 14px → 16px)

### Body Text
For content and interface text:
- `text-body-xl`: Extra large body text (18px → 20px → 20px)
- `text-body-lg`: Large body text (16px → 18px → 18px)
- `text-body-base`: Base body text (14px → 16px → 16px)
- `text-body-sm`: Small body text (12px → 14px → 14px)
- `text-body-xs`: Extra small body text (11px → 12px → 12px)

### Specialized Text
- `text-caption`: Caption text (10px → 11px → 12px)
- `text-label`: Label text (12px → 14px → 14px)

## Usage

### Basic CSS Classes

```html
<!-- Display text for hero sections -->
<h1 class="text-display-xl">Welcome to Campus Sell</h1>

<!-- Responsive headings -->
<h2 class="text-heading-1">Section Title</h2>
<h3 class="text-heading-2">Subsection Title</h3>

<!-- Body text -->
<p class="text-body-base">This is the main content text.</p>
<p class="text-body-sm">This is smaller supporting text.</p>

<!-- Specialized text -->
<span class="text-label">Form Label</span>
<figcaption class="text-caption">Image caption</figcaption>
```

### React Hook Usage

```jsx
import { useResponsiveTypography } from '@/hooks/useResponsiveTypography';

function MyComponent() {
  const { 
    getResponsiveTextClass,
    getResponsiveHeadingClass,
    getTypographyClasses 
  } = useResponsiveTypography();

  return (
    <div>
      {/* Simple text class */}
      <h1 className={getResponsiveTextClass('display-xl')}>
        Hero Title
      </h1>

      {/* Context-aware heading */}
      <h2 className={getResponsiveHeadingClass(2, 'display')}>
        Display Heading
      </h2>

      {/* Complete typography configuration */}
      <p className={getTypographyClasses({
        scale: 'body-lg',
        lineHeight: 'relaxed',
        letterSpacing: 'normal',
        alignment: 'center'
      })}>
        Configured text
      </p>
    </div>
  );
}
```

### React Components

```jsx
import { ResponsiveText, ResponsiveHeading } from '@/hooks/useResponsiveTypography';

function MyComponent() {
  return (
    <div>
      {/* Responsive heading component */}
      <ResponsiveHeading level={1} context="display">
        Hero Title
      </ResponsiveHeading>

      {/* Responsive text component */}
      <ResponsiveText scale="body-lg" className="text-muted-foreground">
        Supporting text content
      </ResponsiveText>
    </div>
  );
}
```

## Advanced Features

### Line Height Utilities
- `leading-responsive-tight`: Tight line height (1.25)
- `leading-responsive-snug`: Snug line height (1.375)
- `leading-responsive-normal`: Normal line height (1.5)
- `leading-responsive-relaxed`: Relaxed line height (1.625)
- `leading-responsive-loose`: Loose line height (1.75)

### Letter Spacing Utilities
- `tracking-responsive-tighter`: Tighter letter spacing (-0.05em)
- `tracking-responsive-tight`: Tight letter spacing (-0.025em)
- `tracking-responsive-normal`: Normal letter spacing (0em)
- `tracking-responsive-wide`: Wide letter spacing (0.025em)
- `tracking-responsive-wider`: Wider letter spacing (0.05em)
- `tracking-responsive-widest`: Widest letter spacing (0.1em)

### Responsive Text Alignment
- `text-responsive-center`: Center align on all devices
- `text-responsive-left-md`: Left align on tablet and up
- `text-responsive-center-lg`: Center align on desktop and up

### Color Utilities
- `text-responsive-contrast`: High contrast text color
- `text-responsive-muted`: Muted text color
- `text-responsive-accent`: Accent color text

## Breakpoints

The system uses the following breakpoints:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and up

## Accessibility Features

### High Contrast Support
The system automatically adjusts font weights in high contrast mode:
```css
@media (prefers-contrast: high) {
  .text-heading-1 { font-weight: 800; }
  .text-body-base { font-weight: 500; }
}
```

### Focus Management
```css
.text-accessible-focus:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
  border-radius: 2px;
}
```

### Reduced Motion Support
Typography animations respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  .text-heading-1 { transition: none !important; }
}
```

## Best Practices

### 1. Use Semantic HTML
Always use appropriate HTML elements with typography classes:
```html
<!-- Good -->
<h1 class="text-display-xl">Page Title</h1>
<h2 class="text-heading-1">Section Title</h2>
<p class="text-body-base">Content text</p>

<!-- Avoid -->
<div class="text-display-xl">Page Title</div>
```

### 2. Context-Aware Sizing
Choose typography scales based on context:
```jsx
// Hero sections
<ResponsiveHeading level={1} context="display">Hero Title</ResponsiveHeading>

// Card components
<ResponsiveHeading level={2} context="card">Card Title</ResponsiveHeading>

// Regular sections
<ResponsiveHeading level={2} context="section">Section Title</ResponsiveHeading>
```

### 3. Consistent Spacing
Use the responsive line height utilities for consistent vertical rhythm:
```html
<h2 class="text-heading-1 leading-responsive-tight">Tight Heading</h2>
<p class="text-body-base leading-responsive-relaxed">Relaxed body text</p>
```

### 4. Performance Considerations
- Typography classes are CSS-based for optimal performance
- Use the React hook for dynamic typography needs
- Avoid inline styles for typography when possible

## Testing

### Responsive Testing
Test typography at different viewport sizes:
```javascript
// Test mobile viewport
fireEvent.resize(window, { target: { innerWidth: 375 } });

// Test tablet viewport  
fireEvent.resize(window, { target: { innerWidth: 768 } });

// Test desktop viewport
fireEvent.resize(window, { target: { innerWidth: 1024 } });
```

### Accessibility Testing
- Test with screen readers
- Verify keyboard navigation
- Check color contrast ratios
- Test with zoom up to 200%

## Migration Guide

### From Existing Typography
Replace existing typography classes with responsive equivalents:

```html
<!-- Before -->
<h1 class="text-4xl font-bold">Title</h1>
<p class="text-base">Content</p>

<!-- After -->
<h1 class="text-display-lg">Title</h1>
<p class="text-body-base">Content</p>
```

### Gradual Adoption
You can adopt the system gradually:
1. Start with new components
2. Update high-impact areas (hero sections, headings)
3. Migrate body text and smaller elements
4. Remove old typography classes

## Troubleshooting

### Common Issues

**Typography not scaling properly:**
- Ensure viewport meta tag is set correctly
- Check that CSS classes are applied correctly
- Verify breakpoint configuration

**Text too small on mobile:**
- Use appropriate mobile-first scales
- Consider using larger body text scales for better readability

**Inconsistent spacing:**
- Use responsive line height utilities
- Ensure consistent typography scale usage

### Debug Tools

Use the responsive typography hook to debug:
```jsx
const { currentViewport, getResponsiveFontSize } = useResponsiveTypography();

console.log('Current viewport:', currentViewport);
console.log('Font size for heading-1:', getResponsiveFontSize('heading-1'));
```

## Contributing

When adding new typography scales:
1. Update `responsiveTypographyTokens` in `tokens.js`
2. Add corresponding CSS classes in `globals.css`
3. Update the `useResponsiveTypography` hook
4. Add tests for new functionality
5. Update this documentation

## Examples

See the following components for implementation examples:
- `HeroSection.js` - Display typography usage
- `Header.js` - Responsive navigation typography
- `ItemCard.js` - Card typography context
- `Button.js` - Interactive element typography