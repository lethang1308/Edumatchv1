import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Select = React.forwardRef(
  (
    {
      className,
      label,
      name,
      id,
      error,
      options = [],
      placeholder = 'Chọn một mục...',
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-control font-medium text-ink">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            disabled={disabled}
            className={cn(
              'w-full appearance-none rounded-control border bg-surface px-3.5 py-2 pr-10 text-control text-ink transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
              'disabled:bg-soft disabled:text-muted disabled:cursor-not-allowed',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-line hover:border-line-strong',
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-faint">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && <p className="text-caption text-danger font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
