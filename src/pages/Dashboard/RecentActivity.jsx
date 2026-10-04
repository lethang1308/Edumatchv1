import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

export const RecentActivity = ({ items = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Các sự kiện và tương tác mới nhất trong hệ thống</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="text-sm font-medium text-slate-800">{item.title}</div>
                <div className="text-xs text-slate-400">{item.time}</div>
              </div>
              <Badge variant={item.statusVariant || 'default'}>{item.status}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
