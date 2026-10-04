import React from 'react';
import { cn } from '@/utils/cn';

const sizes = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  full: 'max-w-full',
};

export const Container = ({ size = 'lg', className, children, ...props }) => {
  return (
    <div
      className={cn('w-full mx-auto px-4 sm:px-6 lg:px-8', sizes[size] || sizes.lg, className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
