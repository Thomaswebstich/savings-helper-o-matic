
import { useMemo } from 'react';
import { DataCard } from '@/components/DataCard';
import { Banknote, CreditCard, Coins, ReceiptText } from 'lucide-react';
import { Currency, formatCurrency, convertCurrency } from '@/lib/data';

interface OverviewCardsProps {
  totalExpenses: number;
  monthlyIncome: number;
  currentMonthData: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  } | null;
  expenseChange: { value: number; isPositive: boolean };
  savingsChange: { value: number; isPositive: boolean };
  displayCurrency: Currency;
}

export function OverviewCards({
  totalExpenses,
  monthlyIncome,
  currentMonthData,
  expenseChange,
  savingsChange,
  displayCurrency
}: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <DataCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses, displayCurrency)}
        icon={<ReceiptText className="h-4 w-4" />}
        trend={expenseChange.value !== 0 ? expenseChange : undefined}
      />
      <DataCard
        title="Monthly Income"
        value={formatCurrency(monthlyIncome, displayCurrency)}
        icon={<Banknote className="h-4 w-4" />}
      />
      <DataCard
        title="Monthly Expenses"
        value={currentMonthData ? formatCurrency(currentMonthData.expenses, displayCurrency) : "0"}
        icon={<CreditCard className="h-4 w-4" />}
        description="Current month spending"
      />
      <DataCard
        title="Monthly Savings"
        value={currentMonthData ? formatCurrency(currentMonthData.savings, displayCurrency) : "0"}
        icon={<Coins className="h-4 w-4" />}
        trend={savingsChange.value !== 0 ? savingsChange : undefined}
      />
    </div>
  );
}
