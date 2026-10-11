import React from 'react';
import { cn } from '@/utils/cn';

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-surface border border-line bg-surface text-ink shadow-sm transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 border-b border-line', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3
      className={cn('font-semibold text-h3 leading-none tracking-tight text-ink', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn('text-body text-muted', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('flex items-center p-6 pt-0 border-t border-line mt-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
