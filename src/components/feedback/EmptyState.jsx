import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có dữ liệu nào để hiển thị.',
  action,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-surface border border-dashed border-line bg-soft/50',
        className
      )}
    >
      <div className="p-3 bg-surface rounded-full shadow-sm border border-line text-faint mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-h4 font-semibold text-ink">{title}</h4>
      {description && (
        <p className="text-body text-muted max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      )}

      {action ||
        (actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        ))}
    </div>
  );
};

export default EmptyState;
