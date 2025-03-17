import { StackedBar } from '@/components/ui/stacked-bar';
import { extractColorFromClass } from '../utils/category-breakdown-utils';

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
  
  // Make sure each segment uses the correct color from categoryData if available
  const enhancedStackedBarData = stackedBarData.map(segment => {
    // Try to find color in categoryData
    const category = categoryData.find(c => c.categoryId === segment.id);
    
    // If we have a color in categoryData, use it after extracting the actual hex value
    if (category?.color) {
      return {
        ...segment,
        color: extractColorFromClass(category.color)
      };
    }
    
    // Otherwise keep the original color
    return segment;
  });
  
  return (
    <div className="mt-4">
      <StackedBar segments={enhancedStackedBarData} height={6} className="mb-2" />
      <div className="flex flex-wrap gap-1.5 text-xs">
        {enhancedStackedBarData.slice(0, 4).map(segment => {
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
