
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  value: string | number | ReactNode;
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
    <div className={cn("glass-card p-3 animate-slide-up", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
            <div className="flex items-center gap-1.5">
              <div className="text-base font-semibold">{value}</div>
              
              {trend && (
                <div className={cn(
                  "text-xs flex items-center",
                  trend.isPositive ? "text-emerald-500" : "text-red-500"
                )}>
                  <span>{trend.isPositive ? "↑" : "↓"}</span>
                  <span>{Math.round(trend.value)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
