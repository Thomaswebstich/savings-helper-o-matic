
import { CURRENCY_SYMBOLS, Currency, convertCurrency } from '@/lib/data';

interface ChartSummaryProps {
  currentData: {
    income: number;
    expenses: number;
    savings: number;
  };
  prevData: {
    income: number;
    expenses: number;
    savings: number;
  } | null;
  displayCurrency: Currency;
  showSavings: boolean;
}

export function ChartSummary({ 
  currentData, 
  prevData, 
  displayCurrency, 
  showSavings 
}: ChartSummaryProps) {
  // Calculate percentage changes
  const incomeChange = prevData && prevData.income ? ((currentData.income - prevData.income) / prevData.income) * 100 : 0;
  const expenseChange = prevData && prevData.expenses ? ((currentData.expenses - prevData.expenses) / prevData.expenses) * 100 : 0;
  const savingsChange = prevData && prevData.savings ? ((currentData.savings - prevData.savings) / prevData.savings) * 100 : 0;
  
  const isIncomePositive = incomeChange >= 0;
  const isExpensePositive = expenseChange <= 0;
  const isSavingsPositive = savingsChange >= 0;

  return (
    <div className="flex flex-col items-end text-xs w-full md:w-auto">
      <div className="flex flex-wrap gap-3 md:gap-4">
        <div className="flex items-center gap-1">
          <span className="text-blue-500">Income:</span>
          <span>{`${CURRENCY_SYMBOLS[displayCurrency]}${Math.round(currentData.income).toLocaleString()}`}</span>
          {incomeChange !== 0 && (
            <span className={isIncomePositive ? "text-green-500" : "text-red-500"}>
              {isIncomePositive ? "+" : ""}{Math.round(incomeChange)}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-rose-500">Expenses:</span>
          <span>{`${CURRENCY_SYMBOLS[displayCurrency]}${Math.round(currentData.expenses).toLocaleString()}`}</span>
          {expenseChange !== 0 && (
            <span className={isExpensePositive ? "text-green-500" : "text-red-500"}>
              {isExpensePositive ? "" : "+"}{Math.round(expenseChange)}%
            </span>
          )}
        </div>
        {showSavings && (
          <div className="flex items-center gap-1">
            <span className="text-green-500">Savings:</span>
            <span>{`${CURRENCY_SYMBOLS[displayCurrency]}${Math.round(currentData.savings).toLocaleString()}`}</span>
            {savingsChange !== 0 && (
              <span className={isSavingsPositive ? "text-green-500" : "text-red-500"}>
                {isSavingsPositive ? "+" : ""}{Math.round(savingsChange)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
