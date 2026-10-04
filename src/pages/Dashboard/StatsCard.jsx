import React from 'react';
import { Card, CardContent } from '@/components/common/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatsCard = ({ title, value, change, isPositive, icon: Icon }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
          {change && (
            <div className="flex items-center gap-1 mt-1 text-xs font-medium">
              {isPositive ? (
                <span className="text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {change}
                </span>
              ) : (
                <span className="text-rose-600 flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {change}
                </span>
              )}
              <span className="text-slate-400">so với tháng trước</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
