
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from '../CategoryBadge';
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';
import { format } from 'date-fns';

interface ExpenseInsightsProps {
  filteredExpenses: Expense[];
  currency: Currency;
}

export function ExpenseInsights({ 
  filteredExpenses, 
  currency 
}: ExpenseInsightsProps) {
  
  // Calculate biggest expense
  const biggestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return null;
    
    return filteredExpenses.reduce((biggest, current) => {
      const biggestAmount = convertCurrency(biggest.amount, biggest.currency || "THB", currency);
      const currentAmount = convertCurrency(current.amount, current.currency || "THB", currency);
      
      return currentAmount > biggestAmount ? current : biggest;
    }, filteredExpenses[0]);
  }, [filteredExpenses, currency]);
  
  // Find most expensive day
  const mostExpensiveDay = useMemo(() => {
    if (filteredExpenses.length === 0) return { date: null, total: 0 };
    
    const dailyTotals = filteredExpenses.reduce((map, expense) => {
      const dateKey = format(expense.date instanceof Date ? expense.date : new Date(expense.date), 'yyyy-MM-dd');
      const current = map.get(dateKey) || { date: expense.date, total: 0 };
      
      current.total += convertCurrency(expense.amount, expense.currency || "THB", currency);
      map.set(dateKey, current);
      
      return map;
    }, new Map<string, { date: Date, total: number }>());
    
    const mostExpensive = Array.from(dailyTotals.values())
      .sort((a, b) => b.total - a.total)[0];
      
    return mostExpensive || { date: null, total: 0 };
  }, [filteredExpenses, currency]);

  return (
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
                {formatCurrency(mostExpensiveDay.total, currency)}
              </div>
              {mostExpensiveDay.date && (
                <div className="text-sm">
                  {format(mostExpensiveDay.date instanceof Date ? mostExpensiveDay.date : new Date(mostExpensiveDay.date), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
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
