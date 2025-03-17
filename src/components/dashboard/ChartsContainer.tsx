
import { FinancialCharts } from '@/components/FinancialCharts';
import { MonthlyTotal, CategoryTotal, Expense, Category, Currency } from '@/lib/data';

interface ChartsContainerProps {
  expenses: Expense[];
  monthlyData: MonthlyTotal[];
  categoryData: CategoryTotal[];
  categories: Category[];
  displayCurrency: Currency;
  timeRange: { monthsBack: number, monthsForward: number };
  onTimeRangeChange?: (range: { monthsBack: number, monthsForward: number }) => void;
}

export function ChartsContainer({
  expenses,
  monthlyData,
  categoryData,
  categories,
  displayCurrency,
  timeRange,
  onTimeRangeChange
}: ChartsContainerProps) {
  return (
    <div className="mt-4 mb-5">
      <FinancialCharts
        monthlyData={monthlyData}
        categoryData={categoryData}
        expenses={expenses}
        categories={categories}
        onTimeRangeChange={onTimeRangeChange}
        displayCurrency={displayCurrency}
      />
    </div>
  );
}
