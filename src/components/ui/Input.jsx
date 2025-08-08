"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error = false,
  success = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = [
    'input-base',
    'flex h-10 w-full rounded-md px-3 py-2 text-sm',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ];

  const stateClasses = {
    error: 'border-destructive focus:ring-destructive',
    success: 'border-success focus:ring-success',
    default: 'border-input focus:ring-ring',
  };

  const currentState = error ? 'error' : success ? 'success' : 'default';

  return (
    <input
      type={type}
      className={cn(
        baseClasses,
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