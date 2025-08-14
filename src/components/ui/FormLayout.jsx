"use client";

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Responsive form layout component with adaptive column layouts
 * Provides consistent spacing and responsive behavior across all form layouts
 */
const FormLayout = React.forwardRef(({
  className,
  columns = 1,
  gap = 'md',
  children,
  ...props
}, ref) => {
  const gapClasses = {
    sm: 'gap-3 md:gap-2',
    md: 'gap-4 md:gap-4',
    lg: 'gap-6 md:gap-5',
    xl: 'gap-8 md:gap-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClass = gapClasses[gap] || gapClasses.md;
  const columnClass = columnClasses[columns] || columnClasses[1];

  return (
    <div
      ref={ref}
      className={cn(
        'grid w-full',
        columnClass,
        gapClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

FormLayout.displayName = 'FormLayout';

/**
 * Form section component for grouping related form fields
 */
const FormSection = React.forwardRef(({
  className,
  title,
  description,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'space-y-4 md:space-y-3',
        className
      )}
      {...props}
    >
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground md:text-base">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground md:text-xs">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
});

FormSection.displayName = 'FormSection';

/**
 * Form row component for inline form elements
 */
const FormRow = React.forwardRef(({
  className,
  align = 'start',
  gap = 'md',
  wrap = true,
  children,
  ...props
}, ref) => {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gapClasses = {
    sm: 'gap-2 md:gap-1',
    md: 'gap-4 md:gap-3',
    lg: 'gap-6 md:gap-4',
  };

  const alignClass = alignClasses[align] || alignClasses.start;
  const gapClass = gapClasses[gap] || gapClasses.md;

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        alignClass,
        gapClass,
        wrap ? 'flex-wrap' : 'flex-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

FormRow.displayName = 'FormRow';

/**
 * Form actions component for submit/cancel buttons
 */
const FormActions = React.forwardRef(({
  className,
  align = 'end',
  gap = 'md',
  stack = true,
  children,
  ...props
}, ref) => {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  const gapClasses = {
    sm: 'gap-2 md:gap-1',
    md: 'gap-4 md:gap-3',
    lg: 'gap-6 md:gap-4',
  };

  const alignClass = alignClasses[align] || alignClasses.end;
  const gapClass = gapClasses[gap] || gapClasses.md;

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        alignClass,
        gapClass,
        stack ? 'flex-col sm:flex-row' : 'flex-row',
        'pt-4 md:pt-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

FormActions.displayName = 'FormActions';

export { FormLayout, FormSection, FormRow, FormActions };