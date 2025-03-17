
import { useMemo, useState } from 'react';
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';
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

// Importing our newly created components
import { ExpenseStats } from './expense-analysis/ExpenseStats';
import { TopCategories } from './expense-analysis/TopCategories';
import { ExpenseInsights } from './expense-analysis/ExpenseInsights';
import { CategoryCostBreakdown } from './expense-analysis/CategoryCostBreakdown';

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
  
  // Calculate total spending
  const totalSpending = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => 
      sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
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
        <ExpenseStats 
          filteredExpenses={filteredExpenses} 
          categoryData={categoryData} 
          currency={currency} 
          totalSpending={totalSpending}
        />

        <TopCategories 
          categoryData={categoryData} 
          filteredExpenses={filteredExpenses} 
          currency={currency} 
        />
        
        <ExpenseInsights 
          filteredExpenses={filteredExpenses} 
          currency={currency}
        />
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
        </TabsList>
        
        <CategoryCostBreakdown 
          filteredExpenses={filteredExpenses} 
          currency={currency}
        />
      </Tabs>
    </div>
  );
}
