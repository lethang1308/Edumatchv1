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
        <div className="divide-y divide-line">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-soft/50 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="text-control font-medium text-ink">{item.title}</div>
                <div className="text-caption text-faint">{item.time}</div>
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
