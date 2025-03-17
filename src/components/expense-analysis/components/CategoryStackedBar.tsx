
import { StackedBar } from '@/components/ui/stacked-bar';

interface CategoryStackedBarProps {
  stackedBarData: Array<{
    id: string;
    value: number;
    color: string;
  }>;
  categoryData: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    budget?: number;
    percentage: number;
    color?: string;
  }>;
}

export function CategoryStackedBar({ 
  stackedBarData, 
  categoryData 
}: CategoryStackedBarProps) {
  if (stackedBarData.length === 0) return null;
  
  return (
    <div className="mt-4">
      <StackedBar segments={stackedBarData} height={6} className="mb-2" />
      <div className="flex flex-wrap gap-1.5 text-xs">
        {stackedBarData.slice(0, 4).map(segment => {
          const category = categoryData.find(c => c.categoryId === segment.id);
          return (
            <span key={segment.id} className="inline-flex items-center gap-1">
              <span 
                className="inline-block h-2 w-2 rounded-sm" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-muted-foreground">
                {category?.categoryName || segment.id}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
