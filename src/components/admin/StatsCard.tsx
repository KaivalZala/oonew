import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
}

export function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>
            {change && (
              <p className="text-sm text-green-600 mt-1">
                {change}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color} ml-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}