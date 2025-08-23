"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveSpacing } from '@/hooks/useViewport';

/**
 * Responsive Container component with adaptive padding and max-widths
 * Provides consistent container behavior across all screen sizes
 */
const Container = ({ 
  children, 
  className = '', 
  size = 'default',
  noPadding = false,
  as: Component = 'div',
  ...props 
}) => {
  const { container: responsiveContainer } = useResponsiveSpacing();

  // Container size variants
  const sizeVariants = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  // Base container classes
  const baseClasses = 'mx-auto w-full';
  
  // Responsive padding (can be disabled with noPadding prop)
  const paddingClasses = noPadding ? '' : responsiveContainer;
  
  // Size-specific max-width
  const sizeClasses = sizeVariants[size] || sizeVariants.default;

  return (
    <Component
      className={cn(
        baseClasses,
        sizeClasses,
        paddingClasses,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;