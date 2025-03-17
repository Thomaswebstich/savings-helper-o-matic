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
  categoryLegendData?: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
  }>;
}

export function ExpenseMonthStackedBar({
  categoryTotals,
  total,
  categoryMap,
  getCategoryColor,
  showAgainstIncome = false,
  monthlyIncome = 0,
  categoryLegendData = []
}: ExpenseMonthStackedBarProps) {
  if (categoryTotals.size === 0) return null;
  
  // Prepare data for stacked bar chart
  const getStackedBarData = () => {
    // If showing against income, use income as the total amount for percentages
    const totalAmount = showAgainstIncome && monthlyIncome > 0 ? monthlyIncome : total;
    
    // Create an array to hold all categories with their values
    const categoryData = Array.from(categoryTotals.entries()).map(([categoryId, amount]) => {
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
        color: color,
        category,
        // Use displayOrder or a large number as fallback
        displayOrder: category?.displayOrder ?? 999
      };
    });
    
    // If we have categoryLegendData, use its order
    if (categoryLegendData.length > 0) {
      // Create a map of positions from the legend data
      const orderMap = new Map<string, number>();
      categoryLegendData.forEach((item, index) => {
        orderMap.set(item.categoryId, index);
      });
      
      // Sort the data according to the legend order
      return categoryData
        .sort((a, b) => {
          const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
          const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
          return orderA - orderB;
        })
        .map(item => ({
          id: item.id,
          value: item.value,
          color: item.color
        }));
    }
    
    // Otherwise sort by displayOrder then by value (highest first)
    return categoryData
      .sort((a, b) => {
        // First sort by displayOrder
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        // If displayOrder is the same or undefined, sort by amount
        return b.value - a.value;
      })
      .map(item => ({
        id: item.id,
        value: item.value,
        color: item.color
      }));
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
