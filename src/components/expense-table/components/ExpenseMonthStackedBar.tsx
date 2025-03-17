
import { StackedBar } from '@/components/ui/stacked-bar';
import { extractColorFromClass } from '@/components/expense-analysis/utils/category-breakdown-utils';
import { Category } from '@/lib/data';

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
    </div>
  );
}
