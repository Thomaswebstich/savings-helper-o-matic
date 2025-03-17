
import { StackedBar } from '@/components/ui/stacked-bar';
import { extractColorFromClass } from '@/components/expense-analysis/utils/category-breakdown-utils';

interface ExpenseMonthStackedBarProps {
  categoryTotals: Map<string, number>;
  total: number;
  categoryMap: Map<string, Category>;
  getCategoryColor: (categoryId: string) => string;
  showAgainstIncome?: boolean;
  monthlyIncome?: number;
}

export function ExpenseMonthStackedBar({
  categoryTotals,
  total,
  categoryMap,
  getCategoryColor,
  showAgainstIncome = false,
  monthlyIncome = 0
}: ExpenseMonthStackedBarProps) {
  if (categoryTotals.size === 0) return null;
  
  // Prepare data for stacked bar chart
  const getStackedBarData = () => {
    // If showing against income, use income as the total amount for percentages
    const totalAmount = showAgainstIncome && monthlyIncome > 0 ? monthlyIncome : total;
    
    return Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by amount (highest first)
      .map(([categoryId, amount]) => {
        // Calculate percentage based on the total amount for this month
        const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
        
        // Get the category color from the categoryMap first (prioritize taxonomy color)
        const category = categoryMap.get(categoryId);
        
        // Extract actual color value if it's a Tailwind class
        let color = getCategoryColor(categoryId);
        if (category?.color) {
          color = extractColorFromClass(category.color);
        }
        
        return {
          id: categoryId,
          value: percentage,
          color: color
        };
      });
  };

  const stackedBarData = getStackedBarData();

  return (
    <div className="px-4 pb-2 pt-1">
      <StackedBar 
        segments={stackedBarData} 
        height={4}
        className="mb-1.5"
      />
      <div className="flex flex-wrap gap-2 text-xs">
        {stackedBarData
          .slice(0, 3) // Only show top 3 categories in the legend
          .map(segment => {
            const category = categoryMap.get(segment.id);
            return (
              <span 
                key={segment.id} 
                className="inline-flex items-center gap-1"
              >
                <span 
                  className="inline-block h-2 w-2 rounded-sm" 
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-muted-foreground">
                  {category?.name || segment.id}
                </span>
              </span>
            );
          })
        }
        
        {showAgainstIncome && monthlyIncome > 0 && (
          <span className="ml-auto text-muted-foreground">
            % of monthly income
          </span>
        )}
      </div>
    </div>
  );
}
