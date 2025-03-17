
import { useMemo } from 'react';
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from 'lucide-react';
import { subDays, isAfter, isBefore } from 'date-fns';
import { StackedBar } from '@/components/ui/stacked-bar';

interface ExpenseStatsProps {
  filteredExpenses: Expense[];
  categoryData: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    budget?: number;
    percentage: number;
    color?: string;
  }>;
  currency: Currency;
  totalSpending: number;
}

export function ExpenseStats({ 
  filteredExpenses, 
  categoryData, 
  currency, 
  totalSpending 
}: ExpenseStatsProps) {
  
  // Calculate averages
  const { averages, daysDiff } = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return { 
        averages: { daily: 0, weekly: 0, monthly: 0 },
        daysDiff: 1
      };
    }
    
    // Find date range
    const dates = filteredExpenses.map(e => e.date instanceof Date ? e.date : new Date(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate days between
    const days = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total in display currency
    const total = filteredExpenses.reduce((sum, expense) => {
      return sum + convertCurrency(expense.amount, expense.currency || "THB", currency);
    }, 0);
    
    return {
      averages: {
        daily: total / days,
        weekly: (total / days) * 7,
        monthly: (total / days) * 30
      },
      daysDiff: days
    };
  }, [filteredExpenses, currency]);
  
  // Calculate spending trend
  const spendingTrend = useMemo(() => {
    if (filteredExpenses.length < 7) return { trend: 0, isPositive: false };
    
    const now = new Date();
    const halfwayPoint = subDays(now, Math.floor(filteredExpenses.length / 2));
    
    const recentExpenses = filteredExpenses.filter(expense => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      return isAfter(expenseDate, halfwayPoint);
    });
    
    const olderExpenses = filteredExpenses.filter(expense => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      return isBefore(expenseDate, halfwayPoint) || expenseDate.getTime() === halfwayPoint.getTime();
    });
    
    if (olderExpenses.length === 0) return { trend: 0, isPositive: false };
    
    const recentTotal = recentExpenses.reduce((sum, expense) => 
      sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
    
    const olderTotal = olderExpenses.reduce((sum, expense) => 
      sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
    
    const trend = ((recentTotal - olderTotal) / olderTotal) * 100;
    
    return {
      trend: Math.abs(trend),
      isPositive: trend <= 0 // Lower spending is positive
    };
  }, [filteredExpenses, currency]);
  
  // Prepare stacked bar data
  const stackedBarData = useMemo(() => {
    if (categoryData.length === 0) return [];
    
    return categoryData
      .filter(cat => cat.percentage > 0)
      .slice(0, 8)  // Limit to top 8 categories
      .map(cat => ({
        id: cat.categoryId,
        value: cat.percentage,
        color: cat.color || getCategoryColor(cat.categoryId, 0)
      }));
  }, [categoryData]);
  
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
    
    // Try to find color in categoryData first
    const categoryInfo = categoryData.find(c => c.categoryId === categoryId);
    if (categoryInfo?.color) return categoryInfo.color;
    
    // Use index or hash the category ID for consistent color
    if (index !== undefined) return colors[index % colors.length];
    
    const hash = categoryId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Spending Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(totalSpending, currency)}</div>
        <p className="text-xs text-muted-foreground">Total for this period</p>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Daily avg</span>
            <span className="font-medium">{formatCurrency(averages.daily, currency)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Weekly avg</span>
            <span className="font-medium">{formatCurrency(averages.weekly, currency)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Monthly avg</span>
            <span className="font-medium">{formatCurrency(averages.monthly, currency)}</span>
          </div>
        </div>
        
        {/* Stacked bar chart showing category breakdown */}
        {stackedBarData.length > 0 && (
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
        )}
        
        {spendingTrend.trend > 0 && (
          <div className="mt-3 flex items-center">
            {spendingTrend.isPositive ? (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className="text-xs">
              {spendingTrend.isPositive ? 'Down' : 'Up'} {spendingTrend.trend.toFixed(1)}% from previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
