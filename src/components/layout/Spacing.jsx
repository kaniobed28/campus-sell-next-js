"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveSpacing } from '@/hooks/useViewport';

/**
 * Responsive Spacer component for consistent spacing
 * Uses design tokens from responsive configuration
 */
export const Spacer = ({ 
  size = 'default',
  direction = 'vertical',
  className = '',
  ...props 
}) => {
  const { deviceType } = useResponsiveSpacing();

  // Spacing size variants based on design tokens
  const spacingVariants = {
    xs: {
      vertical: 'h-2 md:h-3',
      horizontal: 'w-2 md:w-3'
    },
    sm: {
      vertical: 'h-4 md:h-6',
      horizontal: 'w-4 md:w-6'
    },
    default: {
      vertical: 'h-6 md:h-8',
      horizontal: 'w-6 md:w-8'
    },
    lg: {
      vertical: 'h-8 md:h-12',
      horizontal: 'w-8 md:w-12'
    },
    xl: {
      vertical: 'h-12 md:h-16',
      horizontal: 'w-12 md:w-16'
    },
    '2xl': {
      vertical: 'h-16 md:h-20',
      horizontal: 'w-16 md:w-20'
    }
  };

  const sizeClasses = spacingVariants[size]?.[direction] || spacingVariants.default[direction];

  return (
    <div
      className={cn(sizeClasses, className)}
      {...props}
    />
  );
};

/**
 * Responsive Stack component for vertical spacing between elements
 * Automatically adds consistent spacing between child elements
 */
export const Stack = ({ 
  children, 
  spacing = 'default',
  className = '',
  as: Component = 'div',
  ...props 
}) => {
  // Spacing variants using CSS gap
  const spacingVariants = {
    xs: 'space-y-2 md:space-y-3',
    sm: 'space-y-3 md:space-y-4',
    default: 'space-y-4 md:space-y-6',
    lg: 'space-y-6 md:space-y-8',
    xl: 'space-y-8 md:space-y-10',
    '2xl': 'space-y-10 md:space-y-12'
  };

  const spacingClasses = spacingVariants[spacing] || spacingVariants.default;

  return (
    <Component
      className={cn(spacingClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Responsive Inline component for horizontal spacing between elements
 * Automatically adds consistent spacing between inline child elements
 */
export const Inline = ({ 
  children, 
  spacing = 'default',
  className = '',
  as: Component = 'div',
  ...props 
}) => {
  // Spacing variants using CSS gap
  const spacingVariants = {
    xs: 'space-x-2 md:space-x-3',
    sm: 'space-x-3 md:space-x-4',
    default: 'space-x-4 md:space-x-6',
    lg: 'space-x-6 md:space-x-8',
    xl: 'space-x-8 md:space-x-10',
    '2xl': 'space-x-10 md:space-x-12'
  };

  const spacingClasses = spacingVariants[spacing] || spacingVariants.default;

  return (
    <Component
      className={cn('flex flex-wrap items-center', spacingClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Responsive Padding component for consistent internal spacing
 * Uses design tokens for consistent padding across components
 */
export const Padding = ({ 
  children, 
  size = 'default',
  sides = 'all',
  className = '',
  as: Component = 'div',
  ...props 
}) => {
  // Padding size variants
  const paddingVariants = {
    xs: {
      all: 'p-2 md:p-3',
      x: 'px-2 md:px-3',
      y: 'py-2 md:py-3',
      top: 'pt-2 md:pt-3',
      right: 'pr-2 md:pr-3',
      bottom: 'pb-2 md:pb-3',
      left: 'pl-2 md:pl-3'
    },
    sm: {
      all: 'p-3 md:p-4',
      x: 'px-3 md:px-4',
      y: 'py-3 md:py-4',
      top: 'pt-3 md:pt-4',
      right: 'pr-3 md:pr-4',
      bottom: 'pb-3 md:pb-4',
      left: 'pl-3 md:pl-4'
    },
    default: {
      all: 'p-4 md:p-6',
      x: 'px-4 md:px-6',
      y: 'py-4 md:py-6',
      top: 'pt-4 md:pt-6',
      right: 'pr-4 md:pr-6',
      bottom: 'pb-4 md:pb-6',
      left: 'pl-4 md:pl-6'
    },
    lg: {
      all: 'p-6 md:p-8',
      x: 'px-6 md:px-8',
      y: 'py-6 md:py-8',
      top: 'pt-6 md:pt-8',
      right: 'pr-6 md:pr-8',
      bottom: 'pb-6 md:pb-8',
      left: 'pl-6 md:pl-8'
    },
    xl: {
      all: 'p-8 md:p-10',
      x: 'px-8 md:px-10',
      y: 'py-8 md:py-10',
      top: 'pt-8 md:pt-10',
      right: 'pr-8 md:pr-10',
      bottom: 'pb-8 md:pb-10',
      left: 'pl-8 md:pl-10'
    }
  };

  const paddingClasses = paddingVariants[size]?.[sides] || paddingVariants.default[sides];

  return (
    <Component
      className={cn(paddingClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Responsive Margin component for consistent external spacing
 * Uses design tokens for consistent margins across components
 */
export const Margin = ({ 
  children, 
  size = 'default',
  sides = 'all',
  className = '',
  as: Component = 'div',
  ...props 
}) => {
  // Margin size variants
  const marginVariants = {
    xs: {
      all: 'm-2 md:m-3',
      x: 'mx-2 md:mx-3',
      y: 'my-2 md:my-3',
      top: 'mt-2 md:mt-3',
      right: 'mr-2 md:mr-3',
      bottom: 'mb-2 md:mb-3',
      left: 'ml-2 md:ml-3'
    },
    sm: {
      all: 'm-3 md:m-4',
      x: 'mx-3 md:mx-4',
      y: 'my-3 md:my-4',
      top: 'mt-3 md:mt-4',
      right: 'mr-3 md:mr-4',
      bottom: 'mb-3 md:mb-4',
      left: 'ml-3 md:ml-4'
    },
    default: {
      all: 'm-4 md:m-6',
      x: 'mx-4 md:mx-6',
      y: 'my-4 md:my-6',
      top: 'mt-4 md:mt-6',
      right: 'mr-4 md:mr-6',
      bottom: 'mb-4 md:mb-6',
      left: 'ml-4 md:ml-6'
    },
    lg: {
      all: 'm-6 md:m-8',
      x: 'mx-6 md:mx-8',
      y: 'my-6 md:my-8',
      top: 'mt-6 md:mt-8',
      right: 'mr-6 md:mr-8',
      bottom: 'mb-6 md:mb-8',
      left: 'ml-6 md:ml-8'
    },
    xl: {
      all: 'm-8 md:m-10',
      x: 'mx-8 md:mx-10',
      y: 'my-8 md:my-10',
      top: 'mt-8 md:mt-10',
      right: 'mr-8 md:mr-10',
      bottom: 'mb-8 md:mb-10',
      left: 'ml-8 md:ml-10'
    }
  };

  const marginClasses = marginVariants[size]?.[sides] || marginVariants.default[sides];

  return (
    <Component
      className={cn(marginClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
};