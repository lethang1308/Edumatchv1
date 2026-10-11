import React from 'react';
import { cn } from '@/utils/cn';

export const Textarea = React.forwardRef(
  (
    { className, label, name, id, error, helperText, rows = 3, disabled, required, ...props },
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

        <textarea
          ref={ref}
          id={inputId}
          name={name}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full rounded-control border bg-surface px-3.5 py-2 text-control text-ink placeholder:text-faint transition-colors resize-y',
            'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
            'disabled:bg-soft disabled:text-muted disabled:cursor-not-allowed',
            error
              ? 'border-danger focus:ring-danger'
              : 'border-line hover:border-line-strong',
            className
          )}
          {...props}
        />

        {error && <p className="text-caption text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="text-caption text-muted">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
