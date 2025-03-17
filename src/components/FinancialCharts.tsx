
import { useState } from 'react';
import { MonthlyTotal, CategoryTotal, Currency } from '@/lib/data';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { IncomeExpensesChart } from './charts/IncomeExpensesChart';
import { SavingsChart } from './charts/SavingsChart';
import { CategoriesChart } from './charts/CategoriesChart';
import { ChartControls } from './charts/ChartControls';
import { convertMonthlyData, convertCategoryData, preparePieData } from './charts/financialChartUtils';

interface FinancialChartsProps {
  monthlyData: MonthlyTotal[];
  categoryData: CategoryTotal[];
  onTimeRangeChange?: (range: { monthsBack: number, monthsForward: number }) => void;
  displayCurrency?: Currency;
}

export function FinancialCharts({ 
  monthlyData, 
  categoryData,
  onTimeRangeChange,
  displayCurrency = "THB"
}: FinancialChartsProps) {
  const [visibleMonths, setVisibleMonths] = useState({
    start: Math.max(0, monthlyData.length - 6),
    end: monthlyData.length
  });
  
  const [timeRange, setTimeRange] = useState({
    monthsBack: 6,
    monthsForward: 3
  });
  
  const convertedMonthlyData = convertMonthlyData(monthlyData, displayCurrency);
  const convertedCategoryData = convertCategoryData(categoryData, displayCurrency);
  
  const visibleData = convertedMonthlyData.slice(visibleMonths.start, visibleMonths.end);
  const pieData = preparePieData(convertedCategoryData);
  
  const handleSliderChange = (value: number[]) => {
    const newStart = value[0];
    const newEnd = Math.min(newStart + 12, convertedMonthlyData.length);
    
    setVisibleMonths({
      start: newStart,
      end: newEnd
    });
  };
  
  const adjustProjection = (change: number) => {
    if (timeRange.monthsForward + change >= 1 && timeRange.monthsForward + change <= 12) {
      const newRange = {
        monthsBack: timeRange.monthsBack,
        monthsForward: timeRange.monthsForward + change
      };
      setTimeRange(newRange);
      if (onTimeRangeChange) {
        onTimeRangeChange(newRange);
      }
    }
  };
  
  const hasFutureData = monthlyData.length > 0 && new Date().getMonth() !== new Date(visibleData[visibleData.length - 1].month).getMonth();

  return (
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
            visibleMonths={visibleMonths}
            totalDataLength={convertedMonthlyData.length}
            onSliderChange={handleSliderChange}
            onAdjustProjection={adjustProjection}
          />
        </div>
          
        <TabsContent value="income-expenses" className="pt-2">
          <IncomeExpensesChart 
            visibleData={visibleData}
            displayCurrency={displayCurrency}
            hasFutureData={hasFutureData}
          />
        </TabsContent>
        
        <TabsContent value="savings" className="pt-2">
          <SavingsChart
            visibleData={visibleData}
            displayCurrency={displayCurrency}
            hasFutureData={hasFutureData}
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
  );
}
