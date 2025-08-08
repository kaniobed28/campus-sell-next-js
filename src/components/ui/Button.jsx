"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
    variant: {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        destructive: 'btn-destructive',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        xl: 'h-12 px-10 text-lg',
        icon: 'h-10 w-10',
    },
};

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    asChild = false,
    children,
    ...props
}, ref) => {
    const baseClasses = [
        'inline-flex items-center justify-center rounded-md font-medium',
        'focus-ring disabled:pointer-events-none disabled:opacity-50',
        'theme-transition',
    ];

    const variantClass = buttonVariants.variant[variant] || buttonVariants.variant.primary;
    const sizeClass = buttonVariants.size[size] || buttonVariants.size.md;

    const buttonClasses = cn(
        baseClasses,
        variantClass,
        sizeClass,
        {
            'cursor-not-allowed opacity-50': disabled || loading,
        },
        className
    );

    if (asChild) {
        return React.cloneElement(children, {
            className: cn(buttonClasses, children.props.className),
            ref,
            ...props,
        });
    }

    return (
        <button
            className={buttonClasses}
            ref={ref}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button, buttonVariants };