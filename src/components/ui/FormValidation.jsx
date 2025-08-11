"use client";

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Responsive form validation summary component
 * Displays validation errors in a touch-friendly format
 */
const FormValidationSummary = ({
  errors = {},
  className,
  title = "Please fix the following errors:",
  showCount = true,
  ...props
}) => {
  const errorEntries = Object.entries(errors).filter(([_, error]) => error);
  
  if (errorEntries.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-destructive/20 bg-destructive/5 p-4 md:p-3',
        'space-y-3 md:space-y-2',
        className
      )}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <div className="flex items-start gap-3">
        <svg 
          className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" 
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
        <div className="flex-1">
          <h3 className="text-sm font-medium text-destructive md:text-xs">
            {title}
            {showCount && ` (${errorEntries.length})`}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-destructive md:text-xs">
            {errorEntries.map(([field, error]) => (
              <li key={field} className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline validation message component
 */
const ValidationMessage = ({
  type = 'error',
  message,
  className,
  showIcon = true,
  ...props
}) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      container: 'text-destructive',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    success: {
      container: 'text-success',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      container: 'text-warning',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      container: 'text-info',
      icon: (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const style = typeStyles[type] || typeStyles.error;

  return (
    <div
      className={cn(
        'flex items-start gap-2 mt-1',
        style.container,
        className
      )}
      role={type === 'error' ? 'alert' : 'status'}
      {...props}
    >
      {showIcon && (
        <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
          {style.icon}
        </span>
      )}
      <span className="text-sm md:text-xs">
        {message}
      </span>
    </div>
  );
};

/**
 * Form field strength indicator (for passwords, etc.)
 */
const FieldStrengthIndicator = ({
  strength = 0,
  maxStrength = 4,
  labels = ['Weak', 'Fair', 'Good', 'Strong'],
  className,
  ...props
}) => {
  const percentage = (strength / maxStrength) * 100;
  const label = labels[strength - 1] || '';

  const strengthColors = {
    1: 'bg-destructive',
    2: 'bg-warning',
    3: 'bg-info',
    4: 'bg-success',
  };

  const strengthColor = strengthColors[strength] || 'bg-muted';

  return (
    <div className={cn('space-y-2', className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Strength</span>
        {label && (
          <span className={cn(
            'text-xs font-medium',
            strength <= 1 ? 'text-destructive' : 
            strength <= 2 ? 'text-warning' :
            strength <= 3 ? 'text-info' : 'text-success'
          )}>
            {label}
          </span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            strengthColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export { FormValidationSummary, ValidationMessage, FieldStrengthIndicator };