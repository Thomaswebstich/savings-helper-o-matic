
import { useMemo } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';

interface CategoryCostBreakdownProps {
  filteredExpenses: Expense[];
  currency: Currency;
}

export function CategoryCostBreakdown({ 
  filteredExpenses, 
  currency 
}: CategoryCostBreakdownProps) {
  
  // Calculate category averages
  const categoryAverages = useMemo(() => {
    if (filteredExpenses.length === 0) return [];
    
    const categoryMap = new Map<string, {
      id: string,
      name: string,
      total: number,
      count: number,
      color?: string
    }>();
    
    // Group by category
    filteredExpenses.forEach(expense => {
      const categoryId = expense.categoryId || 'uncategorized';
      const categoryName = expense.category || 'Uncategorized';
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          total: 0,
          count: 0
        });
      }
      
      const entry = categoryMap.get(categoryId)!;
      entry.total += convertCurrency(expense.amount, expense.currency || "THB", currency);
      entry.count += 1;
    });
    
    // Find date range
    const dates = filteredExpenses.map(e => e.date instanceof Date ? e.date : new Date(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total for percentages
    const totalSpending = filteredExpenses.reduce((sum, expense) => 
      sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
    
    // Calculate averages and sort
    return Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        daily: category.total / daysDiff,
        weekly: (category.total / daysDiff) * 7,
        monthly: (category.total / daysDiff) * 30,
        percentage: (category.total / totalSpending) * 100
      }))
      .sort((a, b) => b.total - a.total);
      
  }, [filteredExpenses, currency]);
  
  // Get category color (ensuring same colors as in charts)
  const getCategoryColor = (categoryId: string, index: number): string => {
    const colors = [
      "#0ea5e9", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#94a3b8"  // slate
    ];
    
    // Use index or hash the category ID for consistent color
    if (index !== undefined) return colors[index % colors.length];
    
    const hash = categoryId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <>
      <TabsContent value="daily" className="mt-3">
        <div className="text-sm font-medium mb-2">Daily Cost by Category</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {categoryAverages.map((category, index) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-8 rounded-sm mr-2" 
                  style={{ backgroundColor: getCategoryColor(category.id, index) }} 
                />
                <div>
                  <div className="text-sm font-medium truncate max-w-[120px]">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(category.daily, currency)}</div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="weekly" className="mt-3">
        <div className="text-sm font-medium mb-2">Weekly Cost by Category</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {categoryAverages.map((category, index) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-8 rounded-sm mr-2" 
                  style={{ backgroundColor: getCategoryColor(category.id, index) }} 
                />
                <div>
                  <div className="text-sm font-medium truncate max-w-[120px]">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(category.weekly, currency)}</div>
                <div className="text-xs text-muted-foreground">per week</div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="monthly" className="mt-3">
        <div className="text-sm font-medium mb-2">Monthly Cost by Category</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {categoryAverages.map((category, index) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-8 rounded-sm mr-2" 
                  style={{ backgroundColor: getCategoryColor(category.id, index) }} 
                />
                <div>
                  <div className="text-sm font-medium truncate max-w-[120px]">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% of total</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(category.monthly, currency)}</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </>
  );
}
