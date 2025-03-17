
import { formatCurrency, Currency } from '@/lib/data';
import { StackedBar } from '@/components/ui/stacked-bar';
import { getCategoryColor, getStackedBarData } from '../utils/category-breakdown-utils';

interface CategoryInfo {
  id: string;
  name: string;
  total: number;
  count: number;
  color?: string;
  percentage?: number;
}

interface CategoryPeriodBreakdownProps {
  categoryData: CategoryInfo[];
  divisor: number;
  period: 'daily' | 'weekly' | 'monthly';
  currency: Currency;
}

export function CategoryPeriodBreakdown({
  categoryData,
  divisor,
  period,
  currency
}: CategoryPeriodBreakdownProps) {
  if (categoryData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No expense data available
      </div>
    );
  }
  
  return (
    <>
      {/* Stacked bar for overall breakdown */}
      <div className="mb-4 mt-2">
        <StackedBar segments={getStackedBarData(categoryData)} height={8} className="mb-2" />
        <div className="flex flex-wrap gap-2 text-xs">
          {categoryData.slice(0, 5).map((category, idx) => (
            <span key={category.id} className="inline-flex items-center gap-1">
              <span 
                className="inline-block h-2 w-2 rounded-sm" 
                style={{ backgroundColor: category.color || getCategoryColor(category.id, idx, categoryData) }}
              />
              <span>{category.name}</span>
              <span className="text-muted-foreground">
                {category.percentage?.toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {categoryData.map((category, index) => {
          // Calculate average for the time period
          const avgAmount = category.total / divisor;
          
          return (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-8 rounded-sm mr-2" 
                  style={{ backgroundColor: category.color || getCategoryColor(category.id, index, categoryData) }} 
                />
                <div>
                  <div className="text-sm font-medium truncate max-w-[120px]">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.percentage?.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(avgAmount, currency)}</div>
                <div className="text-xs text-muted-foreground">per {period.slice(0, -2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
