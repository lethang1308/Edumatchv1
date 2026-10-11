import React from 'react';
import { cn } from '@/utils/cn';

const badgeVariants = {
  default: 'bg-soft text-muted border-line',
  primary: 'bg-primary-light text-primary border-primary/20',
  success: 'bg-tag text-primary border-primary/20',
  warning: 'bg-badge-gold-bg text-badge-gold border-badge-gold/20',
  danger: 'bg-danger-light text-danger border-danger/25',
  info: 'bg-mint text-primary border-primary/20',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-caption',
  md: 'px-2.5 py-1 text-caption',
  lg: 'px-3 py-1.5 text-control',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        badgeVariants[variant] || badgeVariants.default,
        badgeSizes[size] || badgeSizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-muted': variant === 'default',
            'bg-primary': variant === 'primary' || variant === 'success' || variant === 'info',
            'bg-badge-gold': variant === 'warning',
            'bg-danger': variant === 'danger',
          })}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
