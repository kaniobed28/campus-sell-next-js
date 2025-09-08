"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveGrid, useResponsiveSpacing } from '@/hooks/useViewport';

/**
 * Responsive Grid component for consistent grid layouts
 * Automatically adapts column count based on screen size and content type
 */
const Grid = ({ 
  children, 
  className = '', 
  contentType = 'default',
  columns = null, // Override automatic columns
  gap = 'default',
  as: Component = 'div',
  ...props 
}) => {
  const { getColumns } = useResponsiveGrid(contentType);
  const { gap: responsiveGap } = useResponsiveSpacing();

  // Gap variants
  const gapVariants = {
    none: 'gap-0',
    sm: 'gap-2 md:gap-3',
    default: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10'
  };

  // Use provided columns or get from responsive config
  const gridColumns = columns || getColumns();
  
  // Base grid classes
  const baseClasses = 'grid';
  
  // Responsive grid columns - using Tailwind's responsive prefixes
  const columnClasses = contentType === 'products' 
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    : contentType === 'categories'
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
    : `grid-cols-1 md:grid-cols-${Math.min(gridColumns, 4)}`;
  
  // Gap classes
  const gapClasses = gap === 'responsive' ? responsiveGap : (gapVariants[gap] || gapVariants.default);

  return (
    <Component
      className={cn(
        baseClasses,
        columnClasses,
        gapClasses,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Responsive Flex component for flexible layouts
 * Provides common flex patterns with responsive behavior
 */
export const Flex = ({ 
  children, 
  className = '', 
  direction = 'row',
  wrap = 'wrap',
  justify = 'start',
  align = 'stretch',
  gap = 'default',
  as: Component = 'div',
  ...props 
}) => {
  const { gap: responsiveGap } = useResponsiveSpacing();

  // Direction variants
  const directionVariants = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse',
    responsive: 'flex-col md:flex-row' // Common responsive pattern
  };

  // Wrap variants
  const wrapVariants = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  // Justify variants
  const justifyVariants = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  // Align variants
  const alignVariants = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  // Gap variants
  const gapVariants = {
    none: 'gap-0',
    sm: 'gap-2 md:gap-3',
    default: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10'
  };

  // Base flex classes
  const baseClasses = 'flex';
  
  // Build classes
  const directionClasses = directionVariants[direction] || directionVariants.row;
  const wrapClasses = wrapVariants[wrap] || wrapVariants.wrap;
  const justifyClasses = justifyVariants[justify] || justifyVariants.start;
  const alignClasses = alignVariants[align] || alignVariants.stretch;
  const gapClasses = gap === 'responsive' ? responsiveGap : (gapVariants[gap] || gapVariants.default);

  return (
    <Component
      className={cn(
        baseClasses,
        directionClasses,
        wrapClasses,
        justifyClasses,
        alignClasses,
        gapClasses,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Grid;