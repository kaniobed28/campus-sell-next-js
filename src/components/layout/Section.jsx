"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsiveSpacing } from '@/hooks/useViewport';
import Container from './Container';

/**
 * Responsive Section component for consistent spacing across pages
 * Provides standardized section layouts with responsive spacing
 */
const Section = ({ 
  children, 
  className = '', 
  containerProps = {},
  spacing = 'default',
  background = 'default',
  as: Component = 'section',
  noContainer = false,
  ...props 
}) => {
  const { deviceType } = useResponsiveSpacing();

  // Spacing variants for different section types
  const spacingVariants = {
    none: '',
    sm: 'py-8 md:py-12',
    default: 'py-12 md:py-16 lg:py-20',
    lg: 'py-16 md:py-20 lg:py-24',
    xl: 'py-20 md:py-24 lg:py-32'
  };

  // Background variants
  const backgroundVariants = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    card: 'bg-card',
    primary: 'bg-primary text-primary-foreground',
    gradient: 'bg-gradient-to-br from-background to-muted'
  };

  // Base section classes
  const baseClasses = 'theme-transition';
  
  // Spacing classes
  const spacingClasses = spacingVariants[spacing] || spacingVariants.default;
  
  // Background classes
  const backgroundClasses = backgroundVariants[background] || backgroundVariants.default;

  const sectionContent = noContainer ? children : (
    <Container {...containerProps}>
      {children}
    </Container>
  );

  return (
    <Component
      className={cn(
        baseClasses,
        spacingClasses,
        backgroundClasses,
        className
      )}
      {...props}
    >
      {sectionContent}
    </Component>
  );
};

export default Section;