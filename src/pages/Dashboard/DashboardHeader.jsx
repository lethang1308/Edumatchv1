import React from 'react';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { Button } from '@/components/common/Button';
import { Plus } from 'lucide-react';

export const DashboardHeader = ({ title = 'Bảng điều khiển', breadcrumbs = [], onAction }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
      <div className="space-y-1">
        {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-1" />}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      </div>

      {onAction && (
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onAction}
        >
          Thao tác mẫu
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
