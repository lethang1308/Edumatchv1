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
            'inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-700',
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
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
            {...props}
          />
          {label && <span>{label}</span>}
        </label>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
