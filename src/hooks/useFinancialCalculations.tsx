
import { useMemo } from 'react';
import { 
  Expense, 
  Currency, 
  calculateMonthlyTotals, 
  convertCurrency, 
  IncomeSource, 
  MonthlyTotal 
} from '@/lib/data';

interface FinancialCalculationsProps {
  expenses: Expense[];
  incomeSources: IncomeSource[];
  displayCurrency: Currency;
  timeRange: { monthsBack: number, monthsForward: number };
}

export function useFinancialCalculations({ 
  expenses, 
  incomeSources, 
  displayCurrency, 
  timeRange 
}: FinancialCalculationsProps) {
  
  const monthlyData = useMemo(() => {
    if (expenses.length === 0) return [];
    return calculateMonthlyTotals(expenses, incomeSources, timeRange.monthsBack, timeRange.monthsForward);
  }, [expenses, incomeSources, timeRange]);
  
  const currentMonthData = useMemo(() => {
    if (monthlyData.length === 0) return null;
    
    // Find the index of the current month (the one right before projections start)
    const currentMonthIndex = monthlyData.findIndex((month, index, array) => {
      if (index < array.length - 1) {
        const currentDate = new Date(month.month);
        const nextDate = new Date(array[index + 1].month);
        return nextDate > currentDate && nextDate > new Date();
      }
      return false;
    });
    
    const data = currentMonthIndex >= 0 
      ? monthlyData[currentMonthIndex] 
      : monthlyData[monthlyData.length - timeRange.monthsForward - 1] || null;
      
    if (!data) return null;
    
    return {
      month: data.month,
      income: convertCurrency(data.income, "THB", displayCurrency),
      expenses: convertCurrency(data.expenses, "THB", displayCurrency),
      savings: convertCurrency(data.savings, "THB", displayCurrency)
    };
  }, [monthlyData, displayCurrency, timeRange.monthsForward]);
  
  const expenseChange = useMemo(() => {
    if (monthlyData.length < 2) return { value: 0, isPositive: false };
    
    const currentMonth = monthlyData[monthlyData.length - timeRange.monthsForward - 1];
    const previousMonth = monthlyData[monthlyData.length - timeRange.monthsForward - 2];
    
    if (!currentMonth || !previousMonth) return { value: 0, isPositive: false };
    
    const change = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
    return {
      value: Math.abs(change),
      isPositive: change < 0
    };
  }, [monthlyData, timeRange.monthsForward]);
  
  const savingsChange = useMemo(() => {
    if (monthlyData.length < 2) return { value: 0, isPositive: false };
    
    const currentMonth = monthlyData[monthlyData.length - timeRange.monthsForward - 1];
    const previousMonth = monthlyData[monthlyData.length - timeRange.monthsForward - 2];
    
    if (!currentMonth || !previousMonth) return { value: 0, isPositive: false };
    
    const change = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100;
    return {
      value: Math.abs(change),
      isPositive: change > 0
    };
  }, [monthlyData, timeRange.monthsForward]);
  
  const totalExpenses = useMemo(() => {
    const totalInTHB = expenses.reduce((total, expense) => {
      const amountInTHB = convertCurrency(expense.amount, expense.currency, "THB");
      return total + amountInTHB;
    }, 0);
    
    return convertCurrency(totalInTHB, "THB", displayCurrency);
  }, [expenses, displayCurrency]);

  return {
    monthlyData,
    currentMonthData,
    expenseChange,
    savingsChange,
    totalExpenses
  };
}
