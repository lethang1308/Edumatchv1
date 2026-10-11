import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-sm shadow-primary/20 focus-visible:ring-focus',
  secondary: 'bg-soft hover:bg-tag text-ink focus-visible:ring-focus',
  outline: 'border border-line-strong hover:bg-tag text-primary focus-visible:ring-focus',
  ghost: 'hover:bg-soft text-ink focus-visible:ring-focus',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus-visible:ring-rose-500',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 focus-visible:ring-emerald-500',
};

const sizes = {
  sm: 'h-8 px-3 text-caption gap-1.5',
  md: 'h-[var(--control-height)] px-4 text-control gap-2',
  lg: 'h-[var(--control-height)] px-6 text-body gap-2.5',
};

export const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isBtnLoading = loading || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isBtnLoading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-control transition-all duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className
        )}
        {...props}
      >
        {isBtnLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isBtnLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
