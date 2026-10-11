import React from 'react';
import { cn } from '@/utils/cn';

export const Divider = ({ label, className, orientation = 'horizontal', ...props }) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('inline-block w-px self-stretch bg-line', className)} {...props} />
    );
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center py-2', className)} {...props}>
        <div className="flex-grow border-t border-line" />
        <span className="flex-shrink mx-4 text-caption font-medium text-faint uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-grow border-t border-line" />
      </div>
    );
  }

  return <hr className={cn('border-0 border-t border-line my-4', className)} {...props} />;
};

export default Divider;
