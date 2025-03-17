
import { DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Currency, MonthlyTotal, CURRENCY_SYMBOLS, formatCurrency, convertCurrency } from '@/lib/data';

interface SavingsRateProps {
  currentMonthData: MonthlyTotal | undefined;
  savingsRate: number;
  currency: Currency;
}

export function SavingsRate({ currentMonthData, savingsRate, currency }: SavingsRateProps) {
  // Convert current month data to display currency
  const currentMonthDisplayData = currentMonthData ? {
    savings: convertCurrency(currentMonthData.savings, "THB", currency)
  } : { savings: 0 };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Current Savings Rate</div>
        <div className="font-medium">{savingsRate.toFixed(1)}%</div>
      </div>
      <Progress value={savingsRate} className="h-2" />
      <div className="mt-2 bg-muted/50 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">This Month</div>
            <div className="text-lg font-medium">
              {currentMonthData ? formatCurrency(currentMonthDisplayData.savings, currency) : `${CURRENCY_SYMBOLS[currency]}0`}
            </div>
          </div>
        </div>
        <span className={currentMonthData && currentMonthData.savings > 0 ? "text-green-600" : "text-red-600"}>
          {currentMonthData && currentMonthData.savings > 0 ? "+" : ""}
          {currentMonthData ? savingsRate.toFixed(0) : "0"}%
        </span>
      </div>
    </div>
  );
}
