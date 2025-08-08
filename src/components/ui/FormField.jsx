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
  className,
  children,
  ...props
}) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText ? `${fieldId}-helper` : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      
      {children ? (
        React.cloneElement(children, {
          id: fieldId,
          error: !!error,
          success: !!success,
          'aria-describedby': cn(errorId, helperId).trim() || undefined,
          'aria-invalid': !!error,
          ...props,
        })
      ) : (
        <Input
          id={fieldId}
          error={!!error}
          success={!!success}
          aria-describedby={cn(errorId, helperId).trim() || undefined}
          aria-invalid={!!error}
          {...props}
        />
      )}
      
      {error && (
        <p id={errorId} className="form-error" role="alert">
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="form-success">
          {typeof success === 'string' ? success : '✓ Valid'}
        </p>
      )}
      
      {helperText && !error && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

export { FormField };