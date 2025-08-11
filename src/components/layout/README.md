# Responsive Layout Components

This directory contains a comprehensive set of responsive layout components that provide consistent spacing, sizing, and responsive behavior across the Campus Sell application.

## Components Overview

### Container
A responsive container component with adaptive padding and max-widths.

```jsx
import { Container } from '@/components/layout';

// Basic usage
<Container>
  <p>Content with responsive padding and max-width</p>
</Container>

// Size variants
<Container size="sm">Small container (max-w-3xl)</Container>
<Container size="default">Default container (max-w-7xl)</Container>
<Container size="lg">Large container (max-w-screen-2xl)</Container>
<Container size="full">Full width container</Container>

// Without padding
<Container noPadding>
  <p>Content without responsive padding</p>
</Container>

// Custom component
<Container as="main">
  <p>Rendered as main element</p>
</Container>
```

### Section
A responsive section component for consistent spacing across pages.

```jsx
import { Section } from '@/components/layout';

// Basic usage
<Section>
  <p>Content with default spacing and background</p>
</Section>

// Spacing variants
<Section spacing="sm">Small vertical spacing</Section>
<Section spacing="default">Default vertical spacing</Section>
<Section spacing="lg">Large vertical spacing</Section>
<Section spacing="xl">Extra large vertical spacing</Section>

// Background variants
<Section background="default">Default background</Section>
<Section background="muted">Muted background</Section>
<Section background="card">Card background</Section>
<Section background="primary">Primary background</Section>
<Section background="gradient">Gradient background</Section>

// Without container wrapper
<Section noContainer>
  <p>Content without automatic Container wrapper</p>
</Section>

// Custom container props
<Section containerProps={{ size: "sm", noPadding: true }}>
  <p>Content with custom container configuration</p>
</Section>
```

### Grid
A responsive grid component that automatically adapts column count based on screen size and content type.

```jsx
import { Grid } from '@/components/layout';

// Basic usage
<Grid>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Content-specific grids
<Grid contentType="products">
  {/* 1 col mobile, 2 col tablet, 4 col desktop */}
</Grid>

<Grid contentType="categories">
  {/* 2 col mobile, 3 col tablet, 6 col desktop */}
</Grid>

// Custom columns
<Grid columns={3}>
  {/* Fixed 3 columns */}
</Grid>

// Gap variants
<Grid gap="sm">Small gaps</Grid>
<Grid gap="default">Default gaps</Grid>
<Grid gap="lg">Large gaps</Grid>
<Grid gap="responsive">Responsive gaps from config</Grid>
```

### Flex
A flexible layout component with responsive behavior.

```jsx
import { Flex } from '@/components/layout';

// Basic usage
<Flex>
  <div>Item 1</div>
  <div>Item 2</div>
</Flex>

// Direction variants
<Flex direction="row">Horizontal layout</Flex>
<Flex direction="col">Vertical layout</Flex>
<Flex direction="responsive">Column on mobile, row on desktop</Flex>

// Justify and align
<Flex justify="between" align="center">
  <div>Left</div>
  <div>Right</div>
</Flex>

// Wrap behavior
<Flex wrap="nowrap">No wrapping</Flex>
<Flex wrap="wrap">Allow wrapping</Flex>
```

## Spacing Components

### Spacer
Creates consistent spacing between elements.

```jsx
import { Spacer } from '@/components/layout';

<div>Content above</div>
<Spacer size="lg" />
<div>Content below</div>

// Horizontal spacer
<div className="flex">
  <div>Left</div>
  <Spacer direction="horizontal" size="sm" />
  <div>Right</div>
</div>
```

### Stack
Provides consistent vertical spacing between child elements.

```jsx
import { Stack } from '@/components/layout';

<Stack spacing="default">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

### Inline
Provides consistent horizontal spacing between child elements.

```jsx
import { Inline } from '@/components/layout';

<Inline spacing="sm">
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</Inline>
```

### Padding
Adds responsive padding to elements.

```jsx
import { Padding } from '@/components/layout';

// All sides
<Padding size="lg">
  <p>Content with large padding</p>
</Padding>

// Specific sides
<Padding size="default" sides="x">Horizontal padding only</Padding>
<Padding size="default" sides="y">Vertical padding only</Padding>
<Padding size="default" sides="top">Top padding only</Padding>
```

### Margin
Adds responsive margin to elements.

```jsx
import { Margin } from '@/components/layout';

// All sides
<Margin size="lg">
  <p>Content with large margin</p>
</Margin>

// Specific sides
<Margin size="default" sides="x">Horizontal margin only</Margin>
<Margin size="default" sides="y">Vertical margin only</Margin>
```

## Design Tokens

The components use design tokens from `@/utils/responsiveConfig.js` and `@/hooks/useViewport.js` to ensure consistent responsive behavior:

- **Breakpoints**: Mobile (320-767px), Tablet (768-1023px), Desktop (1024px+)
- **Spacing**: Responsive padding, margins, and gaps that scale with screen size
- **Grid Columns**: Content-aware column counts for different screen sizes
- **Touch Targets**: Minimum 44px touch targets for mobile accessibility

## Usage Examples

### Basic Page Layout
```jsx
import { Section, Container, Grid, Stack } from '@/components/layout';

function ProductPage() {
  return (
    <>
      <Section background="gradient" spacing="xl">
        <Stack spacing="lg">
          <h1>Featured Products</h1>
          <p>Discover amazing deals from your campus community</p>
        </Stack>
      </Section>
      
      <Section>
        <Grid contentType="products">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      </Section>
    </>
  );
}
```

### Complex Layout
```jsx
import { Section, Container, Flex, Stack, Inline } from '@/components/layout';

function ComplexLayout() {
  return (
    <Section>
      <Container size="lg">
        <Flex direction="responsive" gap="lg">
          <div className="flex-1">
            <Stack spacing="default">
              <h2>Main Content</h2>
              <p>Content here...</p>
            </Stack>
          </div>
          <aside className="w-full md:w-80">
            <Stack spacing="sm">
              <h3>Sidebar</h3>
              <Inline spacing="xs">
                <span>Tag 1</span>
                <span>Tag 2</span>
              </Inline>
            </Stack>
          </aside>
        </Flex>
      </Container>
    </Section>
  );
}
```

## Testing

To see all components in action, visit `/layout-examples` in your development environment.

## Best Practices

1. **Use Section for page-level layouts** - Provides consistent spacing and backgrounds
2. **Use Container for content width constraints** - Ensures readable line lengths
3. **Use Grid for content-aware layouts** - Automatically adapts to screen size
4. **Use Flex for component-level layouts** - Great for navigation, cards, etc.
5. **Use spacing components for consistent gaps** - Maintains design system consistency
6. **Leverage content types** - Use `contentType="products"` or `contentType="categories"` for optimal layouts
7. **Test on multiple screen sizes** - Components are designed to work across all devices