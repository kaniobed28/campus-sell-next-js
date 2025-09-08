"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef(({
  className,
  error = false,
  success = false,
  disabled = false,
  size = 'md',
  rows = 4,
  ...props
}, ref) => {
  const baseClasses = [
    'input-base',
    'flex w-full rounded-md text-base md:text-sm',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'resize-vertical',
    'transition-all duration-200',
  ];

  const sizeClasses = {
    sm: 'min-h-[80px] px-3 py-2 text-sm md:min-h-[60px] md:px-2 md:py-1',
    md: 'min-h-[100px] px-4 py-3 text-base md:min-h-[80px] md:px-3 md:py-2 md:text-sm',
    lg: 'min-h-[120px] px-5 py-4 text-lg md:min-h-[100px] md:px-4 md:py-2 md:text-base',
    touch: 'min-h-[100px] px-4 py-3 text-base',
  };

  const stateClasses = {
    error: 'border-destructive focus:ring-destructive focus:border-destructive',
    success: 'border-success focus:ring-success focus:border-success',
    default: 'border-input focus:ring-ring focus:border-ring',
  };

  const currentState = error ? 'error' : success ? 'success' : 'default';
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <textarea
      className={cn(
        baseClasses,
        sizeClass,
        stateClasses[currentState],
        className
      )}
      ref={ref}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };