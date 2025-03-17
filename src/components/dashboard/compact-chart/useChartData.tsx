
import { useState, useEffect } from 'react';
import { MonthlyTotal, convertCurrency } from '@/lib/data';

interface ChartDataPoint {
  date: string;
  month: string;
  income: number;
  expenses: number;
  savings: number;
  isProjection: boolean;
}

export function useChartData(monthlyData: MonthlyTotal[], showCompounded: boolean = false) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [visibleMonths, setVisibleMonths] = useState({ start: 0, end: 12 });
  const [timeRange, setTimeRange] = useState({ monthsBack: 9, monthsForward: 3 });
  
  useEffect(() => {
    setIsLoading(true);
    
    if (monthlyData && monthlyData.length > 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      let transformedData = monthlyData.map((month) => {
        const [monthName, yearStr] = month.month.split(' ');
        const date = new Date(`${monthName} 1, ${yearStr}`);
        
        const isProjection = (date.getFullYear() > currentYear) || 
                             (date.getFullYear() === currentYear && date.getMonth() > currentMonth);
        
        return {
          date: date.toISOString().split('T')[0],
          month: month.month,
          income: month.income,
          expenses: month.expenses,
          savings: month.savings,
          isProjection
        };
      });
      
      // If showing compounded savings, calculate cumulative savings for projected months
      if (showCompounded) {
        // Start with the last actual (non-projected) month's savings
        const lastActualMonth = transformedData.findIndex(item => item.isProjection) - 1;
        let cumulativeSavings = lastActualMonth >= 0 ? transformedData[lastActualMonth].savings : 0;
        
        transformedData = transformedData.map((item, index) => {
          if (item.isProjection) {
            cumulativeSavings += item.savings;
            return { ...item, savings: cumulativeSavings };
          }
          return item;
        });
      }
      
      setData(transformedData);
      
      const currentMonthIndex = transformedData.findIndex(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      
      const initialPosition = currentMonthIndex >= 0 
        ? Math.max(0, Math.min(currentMonthIndex - 6, transformedData.length - 12))
        : Math.max(0, transformedData.length - 12);
      
      setSliderPosition(initialPosition);
      setVisibleMonths({
        start: initialPosition,
        end: Math.min(initialPosition + 12, transformedData.length)
      });
      
      setIsLoading(false);
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [monthlyData, showCompounded]);
  
  const handleSliderChange = (value: number[]) => {
    if (value.length === 0) return;
    
    const newStart = value[0];
    const newEnd = Math.min(newStart + 12, data.length);
    
    setSliderPosition(newStart);
    setVisibleMonths({ start: newStart, end: newEnd });
  };
  
  const handleAdjustProjection = (change: number) => {
    const newMonthsForward = Math.max(1, Math.min(12, timeRange.monthsForward + change));
    
    if (newMonthsForward === timeRange.monthsForward) return;
    
    setTimeRange(prev => ({ 
      ...prev, 
      monthsForward: newMonthsForward,
      monthsBack: 21 - newMonthsForward 
    }));
  };
  
  const visibleData = data.slice(visibleMonths.start, visibleMonths.end);
  const projectedMonthsCount = visibleData.filter(d => d.isProjection).length;
  
  const currentData = visibleData.length > 0 ? visibleData[visibleData.length - 1] : { income: 0, expenses: 0, savings: 0 };
  const prevData = visibleData.length > 1 ? visibleData[visibleData.length - 2] : null;
  
  return {
    data,
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
  };
}
