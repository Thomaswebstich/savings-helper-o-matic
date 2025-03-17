
import { Expense, Currency } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IncomeExpensesChart } from '../charts/IncomeExpensesChart';
import { SavingsChart } from '../charts/SavingsChart';
import { CategoriesChart } from '../charts/CategoriesChart';
import { ChartControls } from '../charts/ChartControls';
import { convertMonthlyData, convertCategoryData, preparePieData } from '../charts/financialChartUtils';

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
  const convertedMonthlyData = convertMonthlyData(monthlyData, displayCurrency);
  const convertedCategoryData = convertCategoryData(categoryData, displayCurrency);
  const pieData = preparePieData(convertedCategoryData);
  
  return (
    <div className="grid grid-cols-1 gap-4 mb-5">
      <div className="glass-card space-y-2 p-4 animate-slide-up">
        <Tabs defaultValue="income-expenses">
          <div className="flex items-center justify-between">
            <TabsList className="h-8">
              <TabsTrigger value="income-expenses" className="text-xs px-2 py-1">Income & Expenses</TabsTrigger>
              <TabsTrigger value="savings" className="text-xs px-2 py-1">Savings</TabsTrigger>
              <TabsTrigger value="categories" className="text-xs px-2 py-1">Categories</TabsTrigger>
            </TabsList>
            
            <ChartControls
              timeRange={timeRange}
              onAdjustProjection={(change) => {
                const newRange = {
                  monthsBack: timeRange.monthsBack,
                  monthsForward: timeRange.monthsForward + change
                };
                onTimeRangeChange(newRange);
              }}
            />
          </div>
            
          <TabsContent value="income-expenses" className="pt-2">
            <IncomeExpensesChart 
              visibleData={convertedMonthlyData}
              displayCurrency={displayCurrency}
              hasFutureData={timeRange.monthsForward > 0}
              expenses={expenses}
            />
          </TabsContent>
          
          <TabsContent value="savings" className="pt-2">
            <SavingsChart
              visibleData={convertedMonthlyData}
              displayCurrency={displayCurrency}
              hasFutureData={timeRange.monthsForward > 0}
              monthsForward={timeRange.monthsForward}
            />
          </TabsContent>
          
          <TabsContent value="categories" className="pt-2">
            <CategoriesChart
              pieData={pieData}
              convertedCategoryData={convertedCategoryData}
              displayCurrency={displayCurrency}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
