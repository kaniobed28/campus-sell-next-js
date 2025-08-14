"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useViewport } from "@/hooks/useViewport";

const QuantitySelector = ({
  value = 1,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
  size = "default", // "sm", "default", "lg"
  variant = "default", // "default", "compact", "inline"
  label = "Quantity",
  showLabel = true,
  debounceMs = 300,
  className = "",
  ...props
}) => {
  const { isTouchDevice } = useViewport();
  const [localValue, setLocalValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback((newValue) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (onChange && newValue !== value) {
        onChange(newValue);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [onChange, value, debounceMs, debounceTimer]);

  // Handle value change
  const handleValueChange = (newValue) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setLocalValue(clampedValue);
    debouncedOnChange(clampedValue);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const inputValue = parseInt(e.target.value) || min;
    handleValueChange(inputValue);
  };

  // Handle increment
  const handleIncrement = () => {
    if (localValue < max) {
      handleValueChange(localValue + 1);
    }
  };

  // Handle decrement
  const handleDecrement = () => {
    if (localValue > min) {
      handleValueChange(localValue - 1);
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          button: "px-2 py-1 text-sm",
          input: "w-12 text-sm py-1",
          touchTarget: "min-w-[36px] min-h-[36px]"
        };
      case "lg":
        return {
          button: "px-4 py-3 text-lg",
          input: "w-20 text-lg py-3",
          touchTarget: "min-w-[48px] min-h-[48px]"
        };
      default:
        return {
          button: "px-3 py-2",
          input: "w-16 py-2",
          touchTarget: "min-w-[44px] min-h-[44px]"
        };
    }
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          container: "flex items-center gap-1",
          buttonClass: "rounded-md border border-border hover:bg-accent",
          inputClass: "text-center border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
        };
      case "inline":
        return {
          container: "inline-flex items-center gap-1",
          buttonClass: "rounded-full bg-accent hover:bg-accent/80 text-accent-foreground",
          inputClass: "text-center bg-transparent border-0 focus:ring-2 focus:ring-primary rounded-md"
        };
      default:
        return {
          container: "flex items-center",
          buttonClass: "hover:bg-accent hover:text-accent-foreground transition-colors",
          inputClass: "text-center border-0 border-l border-r border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const touchTargetClass = isTouchDevice ? sizeStyles.touchTarget : '';

  // Generate unique ID for accessibility
  const inputId = `quantity-${Math.random().toString(36).substr(2, 9)}`;

  if (variant === "compact" || variant === "inline") {
    return (
      <div className={`${variantStyles.container} ${className}`} {...props}>
        {showLabel && (
          <label htmlFor={inputId} className="text-sm font-medium mr-2">
            {label}:
          </label>
        )}
        
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || localValue <= min}
          className={`
            ${sizeStyles.button} ${variantStyles.buttonClass} ${touchTargetClass}
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center
          `}
          aria-label="Decrease quantity"
        >
          −
        </button>
        
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          value={localValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={`
            ${sizeStyles.input} ${variantStyles.inputClass}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`${label} (current: ${localValue})`}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || localValue >= max}
          className={`
            ${sizeStyles.button} ${variantStyles.buttonClass} ${touchTargetClass}
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center
          `}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  // Default variant with connected buttons
  return (
    <div className={`${variantStyles.container} ${className}`} {...props}>
      {showLabel && (
        <label htmlFor={inputId} className="text-sm font-medium mr-3">
          {label}:
        </label>
      )}
      
      <div className="flex items-center border border-border rounded-md overflow-hidden">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || localValue <= min}
          className={`
            ${sizeStyles.button} ${variantStyles.buttonClass} ${touchTargetClass}
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-l-md border-r border-border
            flex items-center justify-center
          `}
          aria-label="Decrease quantity"
        >
          −
        </button>
        
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          value={localValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={`
            ${sizeStyles.input} ${variantStyles.inputClass}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`${label} (current: ${localValue})`}
        />
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || localValue >= max}
          className={`
            ${sizeStyles.button} ${variantStyles.buttonClass} ${touchTargetClass}
            disabled:opacity-50 disabled:cursor-not-allowed
            rounded-r-md border-l border-border
            flex items-center justify-center
          `}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      
      {/* Validation message */}
      {localValue < min && (
        <p className="text-sm text-red-600 mt-1">
          Minimum quantity is {min}
        </p>
      )}
      {localValue > max && (
        <p className="text-sm text-red-600 mt-1">
          Maximum quantity is {max}
        </p>
      )}
    </div>
  );
};

export default QuantitySelector;