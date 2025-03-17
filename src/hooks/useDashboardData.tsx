
import { useState } from 'react';
import { Currency } from '@/lib/data';
import { useExpenseData } from './useExpenseData';
import { useCategoriesData } from './useCategoriesData';
import { useIncomeData } from './useIncomeData';
import { useFinancialCalculations } from './useFinancialCalculations';
import { useCategoryTotals } from './useCategoryTotals';

export function useDashboardData() {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("THB");
  const [timeRange, setTimeRange] = useState({ monthsBack: 9, monthsForward: 12 }); // Set default to 12 months forward
  
  // Use our specialized hooks
  const { expenses, setExpenses, isLoading: expensesLoading } = useExpenseData();
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

  // Combined refresh function
  const refreshData = async () => {
    await Promise.all([
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
    monthlyIncome,
    monthlyData,
    currentMonthData,
    expenseChange,
    savingsChange,
    totalExpenses
  };
}
