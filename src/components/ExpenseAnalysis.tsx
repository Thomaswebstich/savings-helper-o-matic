
import { useMemo, useState } from 'react';
import { Expense, formatCurrency, Currency, convertCurrency, CURRENCY_SYMBOLS } from '@/lib/data';
import { CategoryBadge } from './CategoryBadge';
import { Progress } from '@/components/ui/progress';
import { BarChart, TrendingDown, TrendingUp, CalendarDays, Calendar, Clock } from 'lucide-react';
import { addDays, format, isAfter, isBefore, subDays, subMonths, subWeeks, isWithinInterval } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

interface ExpenseAnalysisProps {
  expenses: Expense[];
  categoryData: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    budget?: number;
    percentage: number;
    color?: string;
  }>;
  currency?: Currency;
  timeRange?: { monthsBack: number, monthsForward: number };
}

export function ExpenseAnalysis({ 
  expenses, 
  categoryData, 
  currency = "THB",
  timeRange = { monthsBack: 6, monthsForward: 3 }
}: ExpenseAnalysisProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'this-month' | 'last-month'>('30d');

  // Filter expenses based on selected period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;
    
    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        startDate = subDays(now, 30);
    }
    
    return expenses.filter(expense => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });
  }, [expenses, period]);
  
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
  
  // Get bar width for mini charts
  const getBarWidth = (value: number, max: number) => {
    return `${Math.max(1, (value / max) * 100)}%`;
  };
  
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
  
  // Calculate biggest expense
  const biggestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    
    return filteredExpenses.reduce((biggest, current) => {
      const biggestAmount = convertCurrency(biggest.amount, biggest.currency || "THB", currency);
      const currentAmount = convertCurrency(current.amount, current.currency || "THB", currency);
      
      return currentAmount > biggestAmount ? current : biggest;
    }, filteredExpenses[0]);
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
  
  // Format period text for display
  const getPeriodText = () => {
    const now = new Date();
    
    switch (period) {
      case '7d':
        return `Last 7 days (${format(subDays(now, 7), 'MMM d')} - ${format(now, 'MMM d')})`;
      case '30d':
        return `Last 30 days (${format(subDays(now, 30), 'MMM d')} - ${format(now, 'MMM d')})`;
      case '90d':
        return `Last 90 days (${format(subDays(now, 90), 'MMM d')} - ${format(now, 'MMM d')})`;
      case 'this-month':
        return `This month (${format(new Date(now.getFullYear(), now.getMonth(), 1), 'MMM d')} - ${format(now, 'MMM d')})`;
      case 'last-month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return `Last month (${format(lastMonthStart, 'MMM d')} - ${format(lastMonthEnd, 'MMM d')})`;
      default:
        return 'Custom period';
    }
  };
  
  // Get total spending
  const totalSpending = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => 
      sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
  }, [filteredExpenses, currency]);
  
  return (
    <div className="glass-card p-4 animate-slide-up w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-medium">Expense Analysis</h3>
          <p className="text-sm text-muted-foreground">{getPeriodText()}</p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="last-month">Last month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryAverages.slice(0, 5).map((category, index) => (
              <div key={category.id}>
                <div className="flex justify-between items-center mb-1">
                  <CategoryBadge 
                    category={category.name} 
                    className="mr-2 text-xs py-0.5 px-1.5"
                  />
                  <span className="text-sm font-medium">{formatCurrency(category.total, currency)}</span>
                </div>
                <Progress 
                  value={category.percentage} 
                  className="h-1.5"
                  indicatorColor={getCategoryColor(category.id, index)}
                />
              </div>
            ))}
            
            {categoryAverages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-2">
                No expense data for this period
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {biggestExpense ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Biggest expense</div>
                  <div className="font-medium">{formatCurrency(convertCurrency(biggestExpense.amount, biggestExpense.currency || "THB", currency), currency)}</div>
                  <div className="text-sm flex items-center gap-1">
                    <span>{biggestExpense.description}</span>
                    <CategoryBadge 
                      category={biggestExpense.category || 'Other'} 
                      className="text-xs py-0 px-1"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground">Most expensive day</div>
                  <div className="font-medium">
                    {formatCurrency(Math.max(...Array.from(
                      filteredExpenses.reduce((map, expense) => {
                        const dateKey = format(expense.date instanceof Date ? expense.date : new Date(expense.date), 'yyyy-MM-dd');
                        const current = map.get(dateKey) || 0;
                        map.set(dateKey, current + convertCurrency(expense.amount, expense.currency || "THB", currency));
                        return map;
                      }, new Map<string, number>()).values()
                    ), currency)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-2">
                No expense data for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily" className="text-xs">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Monthly
          </TabsTrigger>
        </Tabs>
        
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
      </Tabs>
    </div>
  );
}
