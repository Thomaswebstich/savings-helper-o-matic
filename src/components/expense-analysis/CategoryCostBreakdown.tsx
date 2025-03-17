
import { useMemo } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';
import { StackedBar } from '@/components/ui/stacked-bar';

interface CategoryCostBreakdownProps {
  filteredExpenses: Expense[];
  currency: Currency;
}

export function CategoryCostBreakdown({ 
  filteredExpenses, 
  currency 
}: CategoryCostBreakdownProps) {
  
  // Calculate category data
  const { categoryData, totalAmount, timePeriodStats } = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return { 
        categoryData: [], 
        totalAmount: 0,
        timePeriodStats: { days: 1, weeks: 0.143, months: 0.033 }
      };
    }
    
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
    
    // Calculate time period stats for correct averages
    const timePeriodStats = {
      days: daysDiff,
      weeks: daysDiff / 7,
      months: daysDiff / 30
    };
    
    // Sort by amount
    const categoryData = Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        percentage: (category.total / totalSpending) * 100
      }))
      .sort((a, b) => b.total - a.total);
      
    return { 
      categoryData, 
      totalAmount: totalSpending,
      timePeriodStats
    };
      
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

  // Create stacked bar data
  const getStackedBarData = () => {
    return categoryData.map((category, index) => ({
      id: category.id,
      value: category.percentage,
      color: getCategoryColor(category.id, index)
    }));
  };
  
  // Render category data for each time period
  const renderCategories = (period: 'daily' | 'weekly' | 'monthly') => {
    if (categoryData.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-4">
          No expense data available
        </div>
      );
    }
    
    const divisor = period === 'daily' 
      ? timePeriodStats.days 
      : period === 'weekly' 
        ? timePeriodStats.weeks 
        : timePeriodStats.months;
    
    return (
      <>
        {/* Stacked bar for overall breakdown */}
        <div className="mb-4 mt-2">
          <StackedBar segments={getStackedBarData()} height={8} className="mb-2" />
          <div className="flex flex-wrap gap-2 text-xs">
            {categoryData.slice(0, 5).map((category, idx) => (
              <span key={category.id} className="inline-flex items-center gap-1">
                <span 
                  className="inline-block h-2 w-2 rounded-sm" 
                  style={{ backgroundColor: getCategoryColor(category.id, idx) }}
                />
                <span>{category.name}</span>
                <span className="text-muted-foreground">
                  {category.percentage.toFixed(1)}%
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
                    style={{ backgroundColor: getCategoryColor(category.id, index) }} 
                  />
                  <div>
                    <div className="text-sm font-medium truncate max-w-[120px]">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% of total</div>
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
  };
  
  return (
    <>
      <TabsContent value="daily" className="mt-3">
        <div className="text-sm font-medium mb-2">Daily Cost by Category</div>
        {renderCategories('daily')}
      </TabsContent>
      
      <TabsContent value="weekly" className="mt-3">
        <div className="text-sm font-medium mb-2">Weekly Cost by Category</div>
        {renderCategories('weekly')}
      </TabsContent>
      
      <TabsContent value="monthly" className="mt-3">
        <div className="text-sm font-medium mb-2">Monthly Cost by Category</div>
        {renderCategories('monthly')}
      </TabsContent>
    </>
  );
}
