
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
    if (!Array.isArray(expenses) || expenses.length === 0) return [];
    return calculateMonthlyTotals(expenses, incomeSources || [], timeRange.monthsBack, timeRange.monthsForward);
  }, [expenses, incomeSources, timeRange]);
  
  const currentMonthData = useMemo(() => {
    if (!Array.isArray(monthlyData) || monthlyData.length === 0) return null;
    
    // Find the current month data
    const currentDate = new Date();
    const currentMonthYear = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;
    
    // First try to find by exact month/year string
    let data = monthlyData.find(m => m.month === currentMonthYear);
    
    // If not found, find by month/year components
    if (!data) {
      const currentMonthIndex = monthlyData.findIndex(month => {
        if (!month || !month.month) return false;
        
        try {
          const monthDate = new Date(month.month);
          return monthDate.getMonth() === currentDate.getMonth() && 
                monthDate.getFullYear() === currentDate.getFullYear();
        } catch (e) {
          console.error('Error parsing month date:', e);
          return false;
        }
      });
      
      data = currentMonthIndex >= 0 
        ? monthlyData[currentMonthIndex] 
        : monthlyData[monthlyData.length - timeRange.monthsForward - 1] || null;
    }
      
    if (!data) return null;
    
    return {
      month: data.month,
      income: convertCurrency(data.income || 0, "THB", displayCurrency),
      expenses: convertCurrency(data.expenses || 0, "THB", displayCurrency),
      savings: convertCurrency(data.savings || 0, "THB", displayCurrency)
    };
  }, [monthlyData, displayCurrency, timeRange.monthsForward]);
  
  const expenseChange = useMemo(() => {
    if (!Array.isArray(monthlyData) || monthlyData.length < 2) return { value: 0, isPositive: false };
    
    // Get current month data
    const currentDate = new Date();
    const currentMonthIndex = monthlyData.findIndex(month => {
      if (!month || !month.month) return false;
      
      try {
        const monthDate = new Date(month.month);
        return monthDate.getMonth() === currentDate.getMonth() && 
              monthDate.getFullYear() === currentDate.getFullYear();
      } catch (e) {
        return false;
      }
    });
    
    if (currentMonthIndex <= 0) return { value: 0, isPositive: false };
    
    const currentMonth = monthlyData[currentMonthIndex];
    const previousMonth = monthlyData[currentMonthIndex - 1];
    
    if (!previousMonth || previousMonth.expenses === 0 || previousMonth.expenses === undefined) {
      return { value: 0, isPositive: false };
    }
    
    const currentExpenses = currentMonth.expenses || 0;
    const previousExpenses = previousMonth.expenses || 0;
    
    const change = previousExpenses > 0 ? 
      ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;
      
    return {
      value: Math.abs(change),
      isPositive: change < 0 // Less spending is positive
    };
  }, [monthlyData]);
  
  const savingsChange = useMemo(() => {
    if (!Array.isArray(monthlyData) || monthlyData.length < 2) return { value: 0, isPositive: false };
    
    // Get current month data
    const currentDate = new Date();
    const currentMonthIndex = monthlyData.findIndex(month => {
      if (!month || !month.month) return false;
      
      try {
        const monthDate = new Date(month.month);
        return monthDate.getMonth() === currentDate.getMonth() && 
              monthDate.getFullYear() === currentDate.getFullYear();
      } catch (e) {
        return false;
      }
    });
    
    if (currentMonthIndex <= 0) return { value: 0, isPositive: false };
    
    const currentMonth = monthlyData[currentMonthIndex];
    const previousMonth = monthlyData[currentMonthIndex - 1];
    
    if (!previousMonth || previousMonth.savings === 0 || previousMonth.savings === undefined) {
      return { value: 0, isPositive: false };
    }
    
    const currentSavings = currentMonth.savings || 0;
    const previousSavings = previousMonth.savings || 0;
    
    const change = previousSavings !== 0 ? 
      ((currentSavings - previousSavings) / Math.abs(previousSavings)) * 100 : 0;
      
    return {
      value: Math.abs(change),
      isPositive: change > 0 // More savings is positive
    };
  }, [monthlyData]);
  
  const totalExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return 0;
    
    const totalInTHB = expenses.reduce((total, expense) => {
      const currencyToUse = expense.currency || "THB";
      const amountInTHB = convertCurrency(expense.amount, currencyToUse, "THB");
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
