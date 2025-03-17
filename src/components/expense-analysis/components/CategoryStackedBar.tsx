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
    displayOrder?: number;
  }>;
}

export function CategoryStackedBar({ 
  stackedBarData, 
  categoryData 
}: CategoryStackedBarProps) {
  if (stackedBarData.length === 0) return null;
  
  // Create a map to get the displayOrder of each category
  const categoryOrderMap = new Map<string, number>();
  categoryData.forEach(cat => {
    categoryOrderMap.set(cat.categoryId, cat.displayOrder ?? 999);
  });
  
  // Sort the stacked bar data by category displayOrder if available, otherwise preserve original order
  const orderedStackedBarData = [...stackedBarData]
    .sort((a, b) => {
      const orderA = categoryOrderMap.get(a.id) ?? 999;
      const orderB = categoryOrderMap.get(b.id) ?? 999;
      
      // First sort by displayOrder
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If no displayOrder difference, preserve original order by finding position in original array
      const indexA = stackedBarData.findIndex(item => item.id === a.id);
      const indexB = stackedBarData.findIndex(item => item.id === b.id);
      return indexA - indexB;
    })
    .map(segment => {
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
      <StackedBar segments={orderedStackedBarData} height={6} className="mb-2" />
      <div className="flex flex-wrap gap-1.5 text-xs">
        {orderedStackedBarData.slice(0, 4).map(segment => {
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
