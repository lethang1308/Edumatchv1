import React from 'react';
import { cn } from '@/utils/cn';

export const Input = React.forwardRef(
  (
    {
      className,
      label,
      name,
      id,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-control font-medium text-ink">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-faint pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full rounded-control border bg-surface px-3.5 py-2 text-control text-ink placeholder:text-faint transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
              'disabled:bg-soft disabled:text-muted disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-danger focus:ring-danger focus:border-transparent'
                : 'border-line hover:border-line-strong',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-faint flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="text-caption text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-caption text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
