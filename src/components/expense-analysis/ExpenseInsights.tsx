
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, Currency } from '@/lib/data';
import { findBiggestExpense, findMostExpensiveDay } from './utils/insights-utils';
import { BiggestExpense } from './components/BiggestExpense';
import { MostExpensiveDay } from './components/MostExpensiveDay';

interface ExpenseInsightsProps {
  filteredExpenses: Expense[];
  currency: Currency;
}

export function ExpenseInsights({ 
  filteredExpenses, 
  currency 
}: ExpenseInsightsProps) {
  
  // Calculate biggest expense
  const biggestExpense = useMemo(() => 
    findBiggestExpense(filteredExpenses, currency),
    [filteredExpenses, currency]
  );
  
  // Find most expensive day
  const mostExpensiveDay = useMemo(() => 
    findMostExpensiveDay(filteredExpenses, currency),
    [filteredExpenses, currency]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {biggestExpense ? (
          <div className="space-y-3">
            <BiggestExpense 
              expense={biggestExpense} 
              currency={currency} 
            />
            
            <MostExpensiveDay 
              date={mostExpensiveDay.date}
              total={mostExpensiveDay.total}
              currency={currency}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-2">
            No expense data for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
