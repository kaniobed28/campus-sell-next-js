"use client";

import React from 'react';
import { cn } from '../../lib/utils';

const Label = React.forwardRef(({
  className,
  required = false,
  ...props
}, ref) => (
  <label
    ref={ref}
    className={cn(
      'form-label',
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  >
    {props.children}
    {required && <span className="text-destructive ml-1">*</span>}
  </label>
));

Label.displayName = 'Label';

export { Label };