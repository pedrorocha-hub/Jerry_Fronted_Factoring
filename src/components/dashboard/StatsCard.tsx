import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  gradient?: string;
  href?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  className = '',
  gradient = 'from-blue-500 to-blue-600',
  href
}) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br ${gradient} ${href ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-10"></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
          <p className="text-white/80 text-sm font-medium">{title}</p>
        </div>
        {href && (
          <div className="mt-3 text-white/60 text-xs">
            Clic para ver detalles →
          </div>
        )}
      </CardContent>
      
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
    </Card>
  );
};

export default StatsCard;