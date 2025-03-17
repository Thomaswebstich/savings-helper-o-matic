
import { useMemo } from 'react';
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from 'lucide-react';
import { subDays, isAfter, isBefore } from 'date-fns';

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
  const averages = useMemo(() => {
    if (filteredExpenses.length === 0) {
      return { daily: 0, weekly: 0, monthly: 0 };
    }
    
    // Find date range
    const dates = filteredExpenses.map(e => e.date instanceof Date ? e.date : new Date(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Calculate days between
    const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate total in display currency
    const total = filteredExpenses.reduce((sum, expense) => {
      return sum + convertCurrency(expense.amount, expense.currency || "THB", currency);
    }, 0);
    
    return {
      daily: total / daysDiff,
      weekly: (total / daysDiff) * 7,
      monthly: (total / daysDiff) * 30
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
  
  // Get category averages for mini chart
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
        // Find color from categoryData
        const categoryInfo = categoryData.find(c => c.categoryId === categoryId);
        
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          total: 0,
          count: 0,
          color: categoryInfo?.color
        });
      }
      
      const entry = categoryMap.get(categoryId)!;
      entry.total += convertCurrency(expense.amount, expense.currency || "THB", currency);
      entry.count += 1;
    });
    
    // Find date range (same as in averages)
    const dates = filteredExpenses.map(e => e.date instanceof Date ? e.date : new Date(e.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate averages and sort
    return Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        daily: category.total / daysDiff,
        weekly: (category.total / daysDiff) * 7,
        monthly: (category.total / daysDiff) * 30,
        percentage: category.total / filteredExpenses.reduce((sum, e) => 
          sum + convertCurrency(e.amount, e.currency || "THB", currency), 0) * 100
      }))
      .sort((a, b) => b.total - a.total);
      
  }, [filteredExpenses, categoryData, currency]);
  
  // Get mini bars for category breakdown
  const getMiniBars = (data: typeof categoryAverages, maxItems = 5) => {
    if (data.length === 0) return null;
    
    const topItems = data.slice(0, maxItems);
    const maxValue = Math.max(...topItems.map(item => item.daily));
    
    return (
      <div className="flex items-end h-8 mt-1 gap-1">
        {topItems.map((item, index) => (
          <div 
            key={item.id} 
            className="h-full flex flex-col justify-end"
            style={{ width: `${100 / maxItems}%` }}
          >
            <div 
              className="rounded-t w-full" 
              style={{ 
                height: getBarWidth(item.daily, maxValue),
                backgroundColor: item.color || getCategoryColor(item.id, index)
              }}
            />
          </div>
        ))}
      </div>
    );
  };
  
  // Get bar width for mini charts
  const getBarWidth = (value: number, max: number) => {
    return `${Math.max(1, (value / max) * 100)}%`;
  };
  
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
        
        {/* Mini bar chart showing category breakdown */}
        {getMiniBars(categoryAverages)}
        
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
