
import { Category, convertCurrency } from '@/lib/data';
import { StackedBar } from '@/components/ui/stacked-bar';
import { Badge } from '@/components/ui/badge';

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
  // Prepare data for the stacked bar
  const segments = [...categoryTotals.entries()]
    .map(([categoryId, amount]) => {
      const category = categoryMap.get(categoryId);
      const categoryName = category ? category.name : 'Unknown';
      const color = getCategoryColor(categoryId);
      
      // For the percentage calculation, handle case when showing income ratio
      const denominator = showAgainstIncome && monthlyIncome > 0 ? monthlyIncome : total;
      const percentage = denominator > 0 ? (amount / denominator) * 100 : 0;
      
      return {
        id: categoryId,
        value: percentage,
        color: color,
        name: categoryName
      };
    })
    .sort((a, b) => b.value - a.value);
  
  // Calculate remaining percentage when showing against income
  let remainingSegment = null;
  if (showAgainstIncome && monthlyIncome > 0) {
    const savingsPercentage = ((monthlyIncome - total) / monthlyIncome) * 100;
    if (savingsPercentage > 0) {
      remainingSegment = {
        id: 'savings',
        value: savingsPercentage,
        color: '#10b981', // green-500
        name: 'Savings'
      };
      segments.push(remainingSegment);
    }
  }
  
  return (
    <div className="px-2 pb-2">
      <StackedBar segments={segments} height={4} />
      {/* Legend for categories */}
      <div className="flex flex-wrap gap-1 mt-1 text-xs">
        {segments.slice(0, 4).map(segment => (
          <Badge 
            key={segment.id} 
            variant="outline" 
            className="px-1 py-0 text-[10px] border-0"
          >
            <span 
              className="inline-block w-2 h-2 rounded-sm mr-1" 
              style={{ backgroundColor: segment.color }}
            />
            {segment.name} ({Math.round(segment.value)}%)
          </Badge>
        ))}
        {segments.length > 4 && (
          <Badge variant="outline" className="px-1 py-0 text-[10px] border-0">
            +{segments.length - 4} more
          </Badge>
        )}
      </div>
    </div>
  );
}
