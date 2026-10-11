import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

export const ErrorState = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-surface border border-danger/25 bg-danger-light/50',
        className
      )}
    >
      <div className="p-3 bg-danger-light rounded-full text-danger mb-3">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-h4 font-semibold text-danger">{title}</h4>
      <p className="text-body text-danger max-w-sm mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Thử lại
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
