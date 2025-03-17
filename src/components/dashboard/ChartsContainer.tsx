
import { FinancialCharts } from '@/components/FinancialCharts';
import { ExpenseAnalysis } from '@/components/ExpenseAnalysis';
import { SavingsProjection } from '@/components/SavingsProjection';
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
      <div>
        <FinancialCharts 
          monthlyData={monthlyData} 
          categoryData={categoryData}
          onTimeRangeChange={onTimeRangeChange}
          displayCurrency={displayCurrency}
        />
      </div>
      
      <div>
        <ExpenseAnalysis 
          expenses={expenses}
          categoryData={categoryData}
          currency={displayCurrency}
          timeRange={timeRange}
        />
      </div>
      
      <div>
        <SavingsProjection 
          monthlyData={monthlyData} 
          currency={displayCurrency}
        />
      </div>
    </div>
  );
}
