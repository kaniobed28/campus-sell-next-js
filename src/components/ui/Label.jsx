"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const Label = React.forwardRef(({
  className,
  required = false,
  size = 'md',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'text-xs md:text-xs',
    md: 'text-sm md:text-xs',
    lg: 'text-base md:text-sm',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <label
      ref={ref}
      className={cn(
        'form-label',
        'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        'transition-colors duration-200',
        sizeClass,
        className
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span className="text-destructive ml-1 text-base md:text-sm" aria-label="required">
          *
        </span>
      )}
    </label>
  );
});

Label.displayName = 'Label';

export { Label };