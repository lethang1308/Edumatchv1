import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const FormError = ({ message, className }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg',
        className
      )}
    >
      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
