"use client";

import React from 'react';
import { useViewport, useBreakpoint, useResponsiveGrid, useResponsiveSpacing } from '../../hooks/useViewport';

/**
 * Example component demonstrating responsive utility usage
 * This component shows how to use the responsive hooks and utilities
 */
const ResponsiveExample = () => {
  const viewport = useViewport();
  const breakpoint = useBreakpoint();
  const grid = useResponsiveGrid('products');
  const spacing = useResponsiveSpacing();

  return (
    <div className={`${spacing.container} py-8`}>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Responsive Utilities Demo</h2>
        
        {/* Viewport Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Viewport Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded">
              <p><strong>Width:</strong> {viewport.width}px</p>
              <p><strong>Height:</strong> {viewport.height}px</p>
              <p><strong>Device Type:</strong> {viewport.deviceType}</p>
            </div>
            <div className="bg-muted p-4 rounded">
              <p><strong>Is Mobile:</strong> {viewport.isMobile ? '✅' : '❌'}</p>
              <p><strong>Is Tablet:</strong> {viewport.isTablet ? '✅' : '❌'}</p>
              <p><strong>Is Desktop:</strong> {viewport.isDesktop ? '✅' : '❌'}</p>
              <p><strong>Is Touch Device:</strong> {viewport.isTouchDevice ? '✅' : '❌'}</p>
            </div>
          </div>
        </div>

        {/* Breakpoint Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Breakpoint Information</h3>
          <div className="bg-muted p-4 rounded">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <span className={`px-2 py-1 rounded text-sm ${breakpoint.xs ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                XS: {breakpoint.xs ? '✅' : '❌'}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${breakpoint.sm ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                SM: {breakpoint.sm ? '✅' : '❌'}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${breakpoint.md ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                MD: {breakpoint.md ? '✅' : '❌'}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${breakpoint.lg ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                LG: {breakpoint.lg ? '✅' : '❌'}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${breakpoint.xl ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                XL: {breakpoint.xl ? '✅' : '❌'}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${breakpoint['2xl'] ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                2XL: {breakpoint['2xl'] ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>

        {/* Grid Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Grid Configuration</h3>
          <div className="bg-muted p-4 rounded">
            <p><strong>Current Columns:</strong> {grid.columns}</p>
            <p><strong>Device Type:</strong> {grid.deviceType}</p>
            <p><strong>Grid Classes:</strong> {grid.gridCols}</p>
          </div>
        </div>

        {/* Spacing Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Spacing Configuration</h3>
          <div className="bg-muted p-4 rounded">
            <p><strong>Container:</strong> {spacing.container}</p>
            <p><strong>Gap:</strong> {spacing.gap}</p>
            <p><strong>Padding:</strong> {spacing.padding}px</p>
            <p><strong>Margin:</strong> {spacing.margin}px</p>
            <p><strong>Touch Target:</strong> {spacing.getTouchTarget()}px</p>
          </div>
        </div>

        {/* Responsive Grid Demo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Responsive Grid Demo</h3>
          <div className={`grid ${grid.gridCols} ${spacing.gap}`}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-accent text-accent-foreground p-4 rounded text-center">
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Typography Demo */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Responsive Typography</h3>
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Responsive Heading
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
              Responsive Subheading
            </h2>
            <p className="text-base lg:text-lg">
              This is responsive body text that scales with the viewport size.
            </p>
            <p className="text-sm lg:text-base text-muted-foreground">
              This is responsive small text for captions and metadata.
            </p>
          </div>
        </div>

        {/* Touch Target Demo */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Touch Target Demo</h3>
          <div className="flex flex-wrap gap-4">
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
              style={{ minHeight: `${spacing.getTouchTarget()}px` }}
            >
              Touch-Friendly Button
            </button>
            <button 
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded hover:bg-secondary/90 transition-colors"
              style={{ minHeight: `${viewport.config.touchTargets.recommended}px` }}
            >
              Recommended Size
            </button>
            <button 
              className="bg-accent text-accent-foreground px-8 py-4 rounded hover:bg-accent/90 transition-colors"
              style={{ minHeight: `${viewport.config.touchTargets.comfortable}px` }}
            >
              Comfortable Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveExample;