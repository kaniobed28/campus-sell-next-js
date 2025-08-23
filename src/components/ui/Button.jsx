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
        sm: 'h-9 px-3 text-sm md:h-8 md:px-2 md:text-xs',
        md: 'h-12 px-4 py-3 text-base md:h-10 md:px-4 md:py-2 md:text-sm',
        lg: 'h-14 px-6 py-4 text-lg md:h-11 md:px-8 md:py-2 md:text-base',
        xl: 'h-16 px-8 py-5 text-xl md:h-12 md:px-10 md:py-2 md:text-lg',
        icon: 'h-12 w-12 md:h-10 md:w-10',
        touch: 'h-12 px-6 py-3 text-base min-h-[44px] min-w-[44px]',
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