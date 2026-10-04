import React from 'react';
import { Spinner } from './Spinner';
import { cn } from '@/utils/cn';

export const Loading = ({ fullScreen = false, text = 'Đang tải dữ liệu...', className }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <Spinner size="lg" text={text} className={className} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Spinner size="md" text={text} />
    </div>
  );
};

export default Loading;
