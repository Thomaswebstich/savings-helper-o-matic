
import { useState } from 'react';
import { Currency } from '@/lib/data';
import { useExpenseData } from './useExpenseData';
import { useCategoriesData } from './useCategoriesData';
import { useIncomeData } from './useIncomeData';
import { useFinancialCalculations } from './useFinancialCalculations';
import { useCategoryTotals } from './useCategoryTotals';

export function useDashboardData() {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("THB");
  const [timeRange, setTimeRange] = useState({ monthsBack: 9, monthsForward: 12 });
  
  // Use our specialized hooks
  const { expenses, setExpenses, isLoading: expensesLoading, refreshExpenses } = useExpenseData();
  const { categories, budgets, refreshCategoryData } = useCategoriesData();
  const { incomeSources, monthlyIncome, refreshIncomeData, isLoading: incomeLoading } = useIncomeData(displayCurrency);
  
  // Get category totals
  const categoryData = useCategoryTotals(expenses, categories, budgets);
  
  // Calculate financial data
  const { 
    monthlyData, 
    currentMonthData, 
    expenseChange, 
    savingsChange, 
    totalExpenses 
  } = useFinancialCalculations({
    expenses,
    incomeSources,
    displayCurrency,
    timeRange
  });
  
  // Combine loading states
  const isLoading = expensesLoading || incomeLoading;

  // Enhanced refresh function
  const refreshData = async () => {
    await Promise.all([
      refreshExpenses(),
      refreshCategoryData(),
      refreshIncomeData()
    ]);
  };

  return {
    expenses,
    setExpenses,
    categories,
    incomeSources,
    isLoading,
    displayCurrency,
    setDisplayCurrency,
    timeRange,
    setTimeRange,
    categoryData,
    refreshData,
    refreshExpenses,
    monthlyIncome,
    monthlyData,
    currentMonthData,
    expenseChange,
    savingsChange,
    totalExpenses
  };
}
