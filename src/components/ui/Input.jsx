"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error = false,
  success = false,
  disabled = false,
  size = 'md',
  ...props
}, ref) => {
  const baseClasses = [
    'input-base',
    'flex w-full rounded-md text-base md:text-sm',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-200',
  ];

  const sizeClasses = {
    sm: 'h-10 px-3 py-2 text-sm md:h-8 md:px-2 md:py-1',
    md: 'h-12 px-4 py-3 text-base md:h-10 md:px-3 md:py-2 md:text-sm',
    lg: 'h-14 px-5 py-4 text-lg md:h-11 md:px-4 md:py-2 md:text-base',
    touch: 'h-12 px-4 py-3 text-base min-h-[44px]',
  };

  const stateClasses = {
    error: 'border-destructive focus:ring-destructive focus:border-destructive',
    success: 'border-success focus:ring-success focus:border-success',
    default: 'border-input focus:ring-ring focus:border-ring',
  };

  const currentState = error ? 'error' : success ? 'success' : 'default';
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <input
      type={type}
      className={cn(
        baseClasses,
        sizeClass,
        stateClasses[currentState],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };