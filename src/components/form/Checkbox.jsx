import React from 'react';
import { cn } from '@/utils/cn';

export const Checkbox = React.forwardRef(
  ({ className, label, name, id, error, disabled, checked, onChange, ...props }, ref) => {
    const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1">
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-center gap-2.5 cursor-pointer select-none text-control text-ink',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="w-4 h-4 rounded border-line-strong text-primary focus:ring-focus transition-colors"
            {...props}
          />
          {label && <span>{label}</span>}
        </label>
        {error && <p className="text-caption text-danger font-medium">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
