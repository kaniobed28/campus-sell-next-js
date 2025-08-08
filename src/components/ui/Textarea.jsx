"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef(({
  className,
  error = false,
  success = false,
  disabled = false,
  ...props
}, ref) => {
  const baseClasses = [
    'input-base',
    'flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'resize-vertical',
  ];

  const stateClasses = {
    error: 'border-destructive focus:ring-destructive',
    success: 'border-success focus:ring-success',
    default: 'border-input focus:ring-ring',
  };

  const currentState = error ? 'error' : success ? 'success' : 'default';

  return (
    <textarea
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

Textarea.displayName = 'Textarea';

export { Textarea };