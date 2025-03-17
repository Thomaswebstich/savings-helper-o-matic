
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Expense, 
  Category,
  CategoryBudget,
  IncomeSource,
  calculateMonthlyTotals, 
  calculateCategoryTotals, 
  fetchCategories,
  fetchCategoryBudgets,
  fetchIncomeSources,
  calculateTotalMonthlyIncome,
  convertCurrency,
  Currency,
} from '@/lib/data';
import { toast } from '@/hooks/use-toast';

export function useDashboardData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("THB");
  const [timeRange, setTimeRange] = useState({ monthsBack: 6, monthsForward: 3 });
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const budgetsData = await fetchCategoryBudgets(currentMonth);
        setBudgets(budgetsData);
        
        const incomeData = await fetchIncomeSources();
        setIncomeSources(incomeData);
        
        const { data: expensesData, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (expensesData && expensesData.length > 0) {
          const transformedExpenses: Expense[] = expensesData.map(item => ({
            id: item.id,
            description: item.description,
            amount: Number(item.amount),
            date: new Date(item.date),
            categoryId: item.category_id || '',
            category: item.category,
            isRecurring: item.is_recurring || false,
            recurrenceInterval: item.recurrence_interval as any,
            stopDate: item.stop_date ? new Date(item.stop_date) : undefined,
            currency: item.currency as Currency || 'THB'
          }));
          
          const sortedExpenses = transformedExpenses.sort((a, b) => 
            a.date.getTime() - b.date.getTime()
          );
          
          setExpenses(sortedExpenses);
        } else {
          console.log("No expenses found in database");
          setExpenses([]);
          toast({
            title: "No expenses found",
            description: "Add your first expense to get started",
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive"
        });
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  useEffect(() => {
    const updateCategoryData = async () => {
      if (expenses.length === 0 || categories.length === 0) {
        setCategoryData([]);
        return;
      }
      
      try {
        const data = await calculateCategoryTotals(expenses, categories, budgets);
        setCategoryData(data);
      } catch (error) {
        console.error('Error calculating category totals:', error);
        setCategoryData([]);
      }
    };
    
    updateCategoryData();
  }, [expenses, categories, budgets]);

  const refreshData = async () => {
    try {
      const [categoriesData, budgetsData, incomeData] = await Promise.all([
        fetchCategories(),
        fetchCategoryBudgets(new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
        fetchIncomeSources()
      ]);
      
      setCategories(categoriesData);
      setBudgets(budgetsData);
      setIncomeSources(incomeData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  
  const monthlyIncome = useMemo(() => {
    const totalInTHB = calculateTotalMonthlyIncome(incomeSources);
    return convertCurrency(totalInTHB, "THB", displayCurrency);
  }, [incomeSources, displayCurrency]);
  
  const monthlyData = useMemo(() => {
    if (expenses.length === 0) return [];
    return calculateMonthlyTotals(expenses, incomeSources, timeRange.monthsBack, timeRange.monthsForward);
  }, [expenses, incomeSources, timeRange]);
  
  const currentMonthData = useMemo(() => {
    if (monthlyData.length === 0) return null;
    
    const data = monthlyData[monthlyData.length - timeRange.monthsForward - 1];
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
