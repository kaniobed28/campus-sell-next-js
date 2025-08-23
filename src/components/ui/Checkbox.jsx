"use client";

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Responsive checkbox component with touch-friendly targets
 */
const Checkbox = React.forwardRef(({
  className,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  error = false,
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: {
      checkbox: 'h-4 w-4',
      container: 'min-h-[36px] md:min-h-[32px]',
      label: 'text-sm md:text-xs',
      description: 'text-xs md:text-xs'
    },
    md: {
      checkbox: 'h-5 w-5',
      container: 'min-h-[44px] md:min-h-[36px]',
      label: 'text-base md:text-sm',
      description: 'text-sm md:text-xs'
    },
    lg: {
      checkbox: 'h-6 w-6',
      container: 'min-h-[48px] md:min-h-[40px]',
      label: 'text-lg md:text-base',
      description: 'text-base md:text-sm'
    },
    touch: {
      checkbox: 'h-5 w-5',
      container: 'min-h-[44px]',
      label: 'text-base',
      description: 'text-sm'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked, e);
    }
  };

  return (
    <div className={cn('flex items-start gap-3', sizes.container, className)}>
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        
        <label
          htmlFor={checkboxId}
          className={cn(
            'relative flex items-center justify-center rounded border-2 cursor-pointer',
            'transition-all duration-200',
            'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            sizes.checkbox,
            checked
              ? error
                ? 'bg-destructive border-destructive'
                : 'bg-primary border-primary'
              : error
                ? 'border-destructive bg-background'
                : 'border-input bg-background hover:border-ring',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {checked && (
            <svg
              className={cn(
                'text-primary-foreground',
                error && 'text-destructive-foreground',
                size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      </div>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'block font-medium cursor-pointer',
                'transition-colors duration-200',
                error ? 'text-destructive' : 'text-foreground',
                disabled && 'opacity-50 cursor-not-allowed',
                sizes.label
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p className={cn(
              'mt-1 text-muted-foreground',
              disabled && 'opacity-50',
              sizes.description
            )}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

/**
 * Checkbox group component for multiple related checkboxes
 */
const CheckboxGroup = ({
  className,
  label,
  description,
  error,
  required = false,
  children,
  orientation = 'vertical',
  size = 'md',
  ...props
}) => {
  const orientationClasses = {
    vertical: 'flex-col space-y-3 md:space-y-2',
    horizontal: 'flex-row flex-wrap gap-4 md:gap-3'
  };

  return (
    <fieldset className={cn('space-y-3 md:space-y-2', className)} {...props}>
      {label && (
        <legend className={cn(
          'text-sm font-medium text-foreground md:text-xs',
          error && 'text-destructive'
        )}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground md:text-xs">
          {description}
        </p>
      )}
      
      <div className={cn(
        'flex',
        orientationClasses[orientation]
      )}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              size: child.props.size || size,
              error: child.props.error || error,
            });
          }
          return child;
        })}
      </div>
      
      {error && (
        <div className="flex items-start gap-2 mt-1">
          <svg 
            className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <p className="form-error text-sm md:text-xs" role="alert">
            {error}
          </p>
        </div>
      )}
    </fieldset>
  );
};

export { Checkbox, CheckboxGroup };