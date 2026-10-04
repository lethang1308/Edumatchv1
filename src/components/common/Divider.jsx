import React from 'react';
import { cn } from '@/utils/cn';

export const Divider = ({ label, className, orientation = 'horizontal', ...props }) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('inline-block w-px self-stretch bg-slate-200', className)} {...props} />
    );
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center py-2', className)} {...props}>
        <div className="flex-grow border-t border-slate-200" />
        <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>
    );
  }

  return <hr className={cn('border-0 border-t border-slate-200 my-4', className)} {...props} />;
};

export default Divider;
