import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export const FormError = ({ message, className }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 text-caption font-medium text-danger bg-danger-light border border-danger/25 rounded-control',
        className
      )}
    >
      <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;
