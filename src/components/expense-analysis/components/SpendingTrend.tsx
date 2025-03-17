
import { TrendingDown, TrendingUp } from 'lucide-react';

interface SpendingTrendProps {
  trend: number;
  isPositive: boolean;
}

export function SpendingTrend({ trend, isPositive }: SpendingTrendProps) {
  if (trend === 0) return null;
  
  return (
    <div className="mt-3 flex items-center">
      {isPositive ? (
        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
      ) : (
        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
      )}
      <span className="text-xs">
        {isPositive ? 'Down' : 'Up'} {Math.round(trend)}% from previous period
      </span>
    </div>
  );
}
