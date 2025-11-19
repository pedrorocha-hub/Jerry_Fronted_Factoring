import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  href?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  className = '',
  href
}) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden border border-gray-800 shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-[#121212] hover:border-[#00FF80]/50 hover:bg-gray-900/50 ${href ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-[#00FF80]/10 border border-[#00FF80]/20 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-[#00FF80]" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
        </div>
        {href && (
          <div className="mt-4 text-gray-500 text-xs flex items-center group-hover:text-[#00FF80] transition-colors">
            <span>Ver detalles</span>
            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;