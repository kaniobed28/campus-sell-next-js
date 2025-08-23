"use client";

import React from 'react';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';

const ResponsiveAdminForm = ({
  children,
  onSubmit,
  className = "",
  stickyActions = null
}) => {
  const { formConfig, touchConfig } = useAdminResponsive();

  const getLayoutClasses = () => {
    switch (formConfig.layout) {
      case 'stacked':
        return 'space-y-4';
      case 'grid':
        return `grid grid-cols-${formConfig.columns} gap-${formConfig.spacing === 'compact' ? '4' : formConfig.spacing === 'normal' ? '6' : '8'}`;
      default:
        return 'space-y-6';
    }
  };

  return (
    <form onSubmit={onSubmit} className={`${className}`}>
      <div className={getLayoutClasses()}>
        {children}
      </div>
      
      {stickyActions && formConfig.stickyActions && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6 -mx-6 -mb-6">
          <div className="flex justify-end space-x-3">
            {stickyActions}
          </div>
        </div>
      )}
    </form>
  );
};

const FormField = ({
  label,
  children,
  error = null,
  required = false,
  description = null,
  className = ""
}) => {
  const { touchConfig } = useAdminResponsive();

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      <div className="relative">
        {React.cloneElement(children, {
          className: `${children.props.className || ''} ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
            'border-gray-300 focus:border-primary focus:ring-primary'
          }`,
          style: {
            minHeight: touchConfig.minTouchTarget,
            ...children.props.style
          }
        })}
      </div>
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

const FormActions = ({ children, align = 'right', className = "" }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex ${alignClasses[align]} space-x-3 pt-6 ${className}`}>
      {children}
    </div>
  );
};

const FormButton = ({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = ""
}) => {
  const { touchConfig } = useAdminResponsive();

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]} ${sizeClasses[size]}
        rounded-lg font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      style={{
        minHeight: touchConfig.minTouchTarget,
        minWidth: touchConfig.minTouchTarget
      }}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

const FormInput = React.forwardRef(({
  type = 'text',
  placeholder = '',
  className = "",
  ...props
}, ref) => {
  const { touchConfig } = useAdminResponsive();

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        ${className}
      `}
      style={{
        minHeight: touchConfig.minTouchTarget
      }}
      {...props}
    />
  );
});

FormInput.displayName = 'FormInput';

const FormTextarea = React.forwardRef(({
  rows = 4,
  placeholder = '',
  className = "",
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      placeholder={placeholder}
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200 resize-vertical
        ${className}
      `}
      {...props}
    />
  );
});

FormTextarea.displayName = 'FormTextarea';

const FormSelect = React.forwardRef(({
  children,
  className = "",
  ...props
}, ref) => {
  const { touchConfig } = useAdminResponsive();

  return (
    <select
      ref={ref}
      className={`
        w-full px-3 py-2 border rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200 bg-white
        ${className}
      `}
      style={{
        minHeight: touchConfig.minTouchTarget
      }}
      {...props}
    >
      {children}
    </select>
  );
});

FormSelect.displayName = 'FormSelect';

// Export all components
ResponsiveAdminForm.Field = FormField;
ResponsiveAdminForm.Actions = FormActions;
ResponsiveAdminForm.Button = FormButton;
ResponsiveAdminForm.Input = FormInput;
ResponsiveAdminForm.Textarea = FormTextarea;
ResponsiveAdminForm.Select = FormSelect;

export default ResponsiveAdminForm;