
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function DataCard({ title, value, icon, description, trend, className }: DataCardProps) {
  return (
    <div className={cn("glass-card p-6 animate-slide-up", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="flex items-end gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        
        {trend && (
          <div className={cn(
            "text-sm flex items-center gap-1",
            trend.isPositive ? "text-emerald-500" : "text-red-500"
          )}>
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}
