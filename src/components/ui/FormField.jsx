"use client";

import React from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';
import { Input } from './Input';

const FormField = ({
  label,
  id,
  error,
  success,
  helperText,
  required = false,
  size = 'md',
  fullWidth = true,
  className,
  children,
  ...props
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;

  const containerClasses = cn(
    'space-y-2 md:space-y-1.5',
    fullWidth ? 'w-full' : 'w-auto',
    className
  );

  return (
    <div className={containerClasses}>
      {label && (
        <Label htmlFor={fieldId} required={required} size={size}>
          {label}
        </Label>
      )}
      
      {children ? (
        React.cloneElement(children, {
          id: fieldId,
          error: !!error,
          success: !!success,
          size: size,
          'aria-describedby': cn(errorId, helperId).trim() || undefined,
          'aria-invalid': !!error,
          ...props,
        })
      ) : (
        <Input
          id={fieldId}
          error={!!error}
          success={!!success}
          size={size}
          aria-describedby={cn(errorId, helperId).trim() || undefined}
          aria-invalid={!!error}
          {...props}
        />
      )}
      
      {/* Responsive error display with better touch targets */}
      {error && (
        <div className="flex items-start gap-2 mt-1">
          <svg 
            className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <p id={errorId} className="form-error text-sm md:text-xs" role="alert">
            {error}
          </p>
        </div>
      )}
      
      {/* Success state with icon */}
      {success && !error && (
        <div className="flex items-start gap-2 mt-1">
          <svg 
            className="h-4 w-4 text-success mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" 
            />
          </svg>
          <p className="form-success text-sm md:text-xs">
            {typeof success === 'string' ? success : '✓ Valid'}
          </p>
        </div>
      )}
      
      {/* Helper text */}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-muted-foreground md:text-xs">
          {helperText}
        </p>
      )}
    </div>
  );
};

export { FormField };