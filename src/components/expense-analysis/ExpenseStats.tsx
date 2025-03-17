
import { useMemo } from 'react';
import { Expense, formatCurrency, Currency } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import the new utility functions and components
import { 
  calculateAverages,
  calculateSpendingTrend,
  prepareStackedBarData
} from './utils/expense-stats-utils';
import { SpendingAverages } from './components/SpendingAverages';
import { CategoryStackedBar } from './components/CategoryStackedBar';
import { SpendingTrend } from './components/SpendingTrend';

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
  
  // Calculate averages using utility function
  const { averages, daysDiff } = useMemo(() => 
    calculateAverages(filteredExpenses, currency),
    [filteredExpenses, currency]
  );
  
  // Calculate spending trend using utility function
  const spendingTrend = useMemo(() => 
    calculateSpendingTrend(filteredExpenses, currency),
    [filteredExpenses, currency]
  );
  
  // Prepare stacked bar data using utility function
  const stackedBarData = useMemo(() => 
    prepareStackedBarData(categoryData),
    [categoryData]
  );
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Spending Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(totalSpending, currency)}</div>
        <p className="text-xs text-muted-foreground">Total for this period</p>
        
        {/* Spending Averages Component */}
        <SpendingAverages 
          daily={averages.daily}
          weekly={averages.weekly}
          monthly={averages.monthly}
          currency={currency}
        />
        
        {/* Category Stacked Bar Component */}
        <CategoryStackedBar 
          stackedBarData={stackedBarData}
          categoryData={categoryData}
        />
        
        {/* Spending Trend Component */}
        <SpendingTrend
          trend={spendingTrend.trend}
          isPositive={spendingTrend.isPositive}
        />
      </CardContent>
    </Card>
  );
}
