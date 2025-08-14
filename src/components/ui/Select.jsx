"use client";

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

/**
 * Responsive select component with touch-friendly interface
 */
const Select = React.forwardRef(({
  className,
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  error = false,
  success = false,
  disabled = false,
  size = 'md',
  searchable = false,
  multiple = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || value[0];
      }
      return `${value.length} selected`;
    }
    
    const option = options.find(opt => opt.value === value);
    return option?.label || placeholder;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(optionValue);
      
      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(optionValue);
      }
      
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div className="relative w-full" ref={selectRef}>
      {/* Select trigger */}
      <button
        ref={ref}
        type="button"
        className={cn(
          'input-base',
          'flex w-full items-center justify-between rounded-md',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          sizeClass,
          stateClasses[currentState],
          className
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        {...props}
      >
        <span className={cn(
          'truncate',
          !value || (multiple && Array.isArray(value) && value.length === 0)
            ? 'text-muted-foreground'
            : 'text-foreground'
        )}>
          {getDisplayValue()}
        </span>
        
        <svg
          className={cn(
            'h-4 w-4 transition-transform duration-200 flex-shrink-0 ml-2',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg',
          'max-h-60 overflow-auto',
          'animate-in fade-in-0 zoom-in-95'
        )}>
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                ref={searchInputRef}
                type="text"
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Options */}
          <div className="py-1" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                      'min-h-[44px] md:min-h-[36px] flex items-center',
                      isSelected && 'bg-accent text-accent-foreground font-medium'
                    )}
                    onClick={() => handleOptionSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {multiple && (
                      <div className="mr-2 flex-shrink-0">
                        <div className={cn(
                          'w-4 h-4 border border-input rounded flex items-center justify-center',
                          isSelected && 'bg-primary border-primary'
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };