
import { Expense, Currency } from '@/lib/data';

interface ChartsContainerProps {
  expenses: Expense[];
  monthlyData: any[];
  categoryData: any[];
  displayCurrency: Currency;
  timeRange: { monthsBack: number, monthsForward: number };
  onTimeRangeChange: (newRange: { monthsBack: number, monthsForward: number }) => void;
}

export function ChartsContainer({
  expenses,
  monthlyData,
  categoryData,
  displayCurrency,
  timeRange,
  onTimeRangeChange
}: ChartsContainerProps) {
  return (
    <div className="grid grid-cols-1 gap-4 mb-5">
      {/* Charts removed as requested */}
    </div>
  );
}
