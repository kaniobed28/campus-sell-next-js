/**
 * ResponsiveGridDemo - Demonstration component showing the responsive product grid system
 * This component showcases different variants and configurations of the ProductGrid
 */

import React, { useState } from 'react';
import ProductGrid from '../ProductGrid';
import { useViewport } from '@/hooks/useViewport';

// Demo product data
const demoProducts = [
  {
    id: '1',
    title: 'MacBook Pro 13"',
    price: 1299.99,
    image: '/images/demo/macbook.jpg',
    description: 'Powerful laptop for students and professionals',
    likes: 45,
    views: 320,
    category: 'Electronics'
  },
  {
    id: '2',
    title: 'Calculus Textbook',
    price: 89.99,
    image: '/images/demo/textbook.jpg',
    description: 'Essential mathematics textbook for engineering students',
    likes: 23,
    views: 156,
    category: 'Books'
  },
  {
    id: '3',
    title: 'Desk Lamp',
    price: 34.99,
    image: '/images/demo/lamp.jpg',
    description: 'Adjustable LED desk lamp perfect for studying',
    likes: 18,
    views: 89,
    category: 'Furniture'
  },
  {
    id: '4',
    title: 'Wireless Headphones',
    price: 199.99,
    image: '/images/demo/headphones.jpg',
    description: 'Noise-cancelling headphones for focused study sessions',
    likes: 67,
    views: 445,
    category: 'Electronics'
  },
  {
    id: '5',
    title: 'Coffee Maker',
    price: 79.99,
    image: '/images/demo/coffee.jpg',
    description: 'Single-serve coffee maker for dorm rooms',
    likes: 31,
    views: 203,
    category: 'Appliances'
  },
  {
    id: '6',
    title: 'Backpack',
    price: 49.99,
    image: '/images/demo/backpack.jpg',
    description: 'Durable backpack with laptop compartment',
    likes: 29,
    views: 178,
    category: 'Accessories'
  },
  {
    id: '7',
    title: 'Scientific Calculator',
    price: 24.99,
    image: '/images/demo/calculator.jpg',
    description: 'Advanced calculator for engineering courses',
    likes: 15,
    views: 92,
    category: 'Electronics'
  },
  {
    id: '8',
    title: 'Desk Chair',
    price: 159.99,
    image: '/images/demo/chair.jpg',
    description: 'Ergonomic office chair for long study sessions',
    likes: 38,
    views: 267,
    category: 'Furniture'
  }
];

const ResponsiveGridDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState('default');
  const [maxColumns, setMaxColumns] = useState(null);
  const { deviceType, width, isMobile, isTablet, isDesktop } = useViewport();

  const variants = [
    { value: 'default', label: 'Default Grid' },
    { value: 'compact', label: 'Compact Grid' },
    { value: 'featured', label: 'Featured Grid' }
  ];

  const columnOptions = [
    { value: null, label: 'Auto (Responsive)' },
    { value: 2, label: 'Max 2 Columns' },
    { value: 3, label: 'Max 3 Columns' },
    { value: 6, label: 'Max 6 Columns' }
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Responsive Product Grid Demo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Interactive demonstration of the responsive product grid system with different variants and configurations.
          </p>
        </div>

        {/* Viewport Info */}
        <div className="bg-card rounded-lg p-4 mb-6 border border-border">
          <h3 className="text-lg font-semibold mb-2">Current Viewport</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Width:</span>
              <span className="ml-2 font-mono">{width}px</span>
            </div>
            <div>
              <span className="text-muted-foreground">Device:</span>
              <span className="ml-2 capitalize">{deviceType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mobile:</span>
              <span className="ml-2">{isMobile ? '✅' : '❌'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Desktop:</span>
              <span className="ml-2">{isDesktop ? '✅' : '❌'}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card rounded-lg p-4 sm:p-6 mb-8 border border-border">
          <h3 className="text-lg font-semibold mb-4">Grid Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Variant Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Grid Variant</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
              >
                {variants.map(variant => (
                  <option key={variant.value} value={variant.value}>
                    {variant.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Column Override */}
            <div>
              <label className="block text-sm font-medium mb-2">Column Override</label>
              <select
                value={maxColumns || ''}
                onChange={(e) => setMaxColumns(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
              >
                {columnOptions.map(option => (
                  <option key={option.value || 'auto'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expected Layout Info */}
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Expected Layout:</h4>
            <div className="text-sm text-muted-foreground">
              {selectedVariant === 'compact' && (
                <span>Compact: 1 col (mobile) → 3 cols (tablet) → 5-6 cols (desktop)</span>
              )}
              {selectedVariant === 'featured' && (
                <span>Featured: 1 col (mobile) → 2 cols (tablet) → 3-4 cols (desktop)</span>
              )}
              {selectedVariant === 'default' && (
                <span>Default: 1 col (mobile) → 2-3 cols (tablet) → 4 cols (desktop)</span>
              )}
              {maxColumns && (
                <span className="block mt-1">Max columns override: {maxColumns}</span>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Grid Demo */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Live Grid Demo</h3>
          <ProductGrid
            products={demoProducts}
            variant={selectedVariant}
            maxColumns={maxColumns}
            className="transition-all duration-300"
          />
        </div>

        {/* Breakpoint Visualization */}
        <div className="bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Responsive Breakpoints</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted">
              <span className="font-medium">Mobile (< 768px)</span>
              <span className="text-sm text-muted-foreground">1 column, compact spacing</span>
              <span className={`w-3 h-3 rounded-full ${width < 768 ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted">
              <span className="font-medium">Tablet (768px - 1023px)</span>
              <span className="text-sm text-muted-foreground">2-3 columns, medium spacing</span>
              <span className={`w-3 h-3 rounded-full ${width >= 768 && width < 1024 ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-muted">
              <span className="font-medium">Desktop (≥ 1024px)</span>
              <span className="text-sm text-muted-foreground">4+ columns, generous spacing</span>
              <span className={`w-3 h-3 rounded-full ${width >= 1024 ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="mt-8 bg-card rounded-lg p-4 sm:p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Implementation Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Responsive Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Adaptive grid columns based on screen size</li>
                <li>• Scalable spacing and gutters</li>
                <li>• Touch-friendly interactions (44px targets)</li>
                <li>• Responsive image sizing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Accessibility Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Proper ARIA grid attributes</li>
                <li>• Keyboard navigation support</li>
                <li>• Screen reader friendly</li>
                <li>• High contrast support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveGridDemo;