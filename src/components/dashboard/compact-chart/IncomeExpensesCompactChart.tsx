
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Currency, MonthlyTotal } from '@/lib/data';
import { useChartData } from './useChartData';
import { ChartHeader } from './ChartHeader';
import { ChartSummary } from './ChartSummary';
import { IncomeExpensesChart } from './IncomeExpensesChart';
import { ChartControls } from '@/components/charts/ChartControls';

interface IncomeExpensesCompactChartProps {
  monthlyData: MonthlyTotal[];
  displayCurrency: Currency;
}

export function IncomeExpensesCompactChart({ 
  monthlyData,
  displayCurrency 
}: IncomeExpensesCompactChartProps) {
  const [showSavings, setShowSavings] = useState(false);
  
  const {
    visibleData,
    isLoading,
    currentData,
    prevData,
    timeRange,
    visibleMonths,
    sliderPosition,
    projectedMonthsCount,
    handleSliderChange,
    handleAdjustProjection
  } = useChartData(monthlyData);
  
  if (isLoading) {
    return (
      <Card className="h-[300px] w-full">
        <CardHeader className="p-4 pb-0">
          <h3 className="text-sm font-medium">Income & Expenses</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-0">
        <ChartHeader
          title="Income & Expenses"
          projectedMonthsCount={projectedMonthsCount}
          showSavings={showSavings}
          setShowSavings={setShowSavings}
        />
        
        <ChartSummary
          currentData={currentData}
          prevData={prevData}
          displayCurrency={displayCurrency}
          showSavings={showSavings}
        />
      </CardHeader>
      <CardContent className="p-4 pt-2 h-[260px]">
        <IncomeExpensesChart
          visibleData={visibleData}
          displayCurrency={displayCurrency}
          showSavings={showSavings}
        />
      </CardContent>
      <CardFooter className="px-4 pt-0 pb-4">
        <ChartControls
          timeRange={timeRange}
          visibleMonths={visibleMonths}
          totalDataLength={visibleData.length + visibleMonths.start}
          onSliderChange={handleSliderChange}
          onAdjustProjection={handleAdjustProjection}
          sliderPosition={sliderPosition}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
