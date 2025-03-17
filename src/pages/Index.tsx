import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { DataCard } from '@/components/DataCard';
import { ExpenseTable } from '@/components/ExpenseTable';
import { FinancialCharts } from '@/components/FinancialCharts';
import { SavingsProjection } from '@/components/SavingsProjection';
import { ExpenseAnalysis } from '@/components/ExpenseAnalysis';
import { 
  Expense, 
  Category,
  CategoryBudget,
  IncomeSource,
  calculateMonthlyTotals, 
  calculateCategoryTotals, 
  formatCurrency,
  Currency,
  convertCurrency,
  fetchCategories,
  fetchCategoryBudgets,
  fetchIncomeSources,
  calculateTotalMonthlyIncome,
  CURRENCY_SYMBOLS
} from '@/lib/data';
import { ExpenseForm, ExpenseFormValues } from '@/components/ExpenseForm';
import { SettingsManager } from '@/components/SettingsManager';
import { Banknote, Calendar, Coins, CreditCard, ReceiptText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Index() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
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
  
  const handleAddExpense = async (data: ExpenseFormValues) => {
    console.log("Adding new expense with form data:", data);
    
    const categoryId = data.category;
    
    let categoryName = '';
    if (categoryId) {
      const foundCategory = categories.find(c => c.id === categoryId);
      if (foundCategory) {
        categoryName = foundCategory.name;
        console.log(`Found category: ${categoryName} for ID: ${categoryId}`);
      } else {
        console.warn(`Could not find category with ID: ${categoryId}`);
      }
    }
    
    const expenseDate = new Date(data.date);
    expenseDate.setHours(12, 0, 0, 0);
    
    let stopDate = undefined;
    if (data.stopDate) {
      stopDate = new Date(data.stopDate);
      stopDate.setHours(12, 0, 0, 0);
    }
    
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...data,
      date: expenseDate,
      stopDate: stopDate,
      categoryId: categoryId
    };
    
    console.log("Created new expense object:", newExpense);
    
    setExpenses(prev => [newExpense, ...prev]);
    
    try {
      const formattedDate = expenseDate.toISOString().split('T')[0];
      const formattedStopDate = stopDate ? stopDate.toISOString().split('T')[0] : null;
      
      console.log("Formatted date for DB:", formattedDate);
      console.log("Formatted stop date for DB:", formattedStopDate);
      
      const { data: dbData, error } = await supabase
        .from('expenses')
        .insert({
          description: newExpense.description,
          amount: newExpense.amount,
          date: formattedDate,
          category: categoryName,
          category_id: categoryId,
          is_recurring: newExpense.isRecurring,
          recurrence_interval: newExpense.recurrenceInterval,
          stop_date: formattedStopDate,
          currency: newExpense.currency
        });
        
      if (error) {
        console.error('Error details from Supabase:', error);
        throw error;
      }
      
      console.log("Successfully added expense to database:", dbData);
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense to database, but it's available in your current session",
        variant: "destructive"
      });
    }
  };
  
  const handleEditExpense = (expense: Expense) => {
    console.log("Editing expense:", expense);
    
    const preparedExpense: Expense = {
      ...expense,
      date: expense.date instanceof Date ? expense.date : new Date(expense.date),
      stopDate: expense.stopDate ? 
        (expense.stopDate instanceof Date ? expense.stopDate : new Date(expense.stopDate)) 
        : undefined
    };
    
    preparedExpense.date.setHours(12, 0, 0, 0);
    if (preparedExpense.stopDate) {
      preparedExpense.stopDate.setHours(12, 0, 0, 0);
    }
    
    setCurrentExpense(preparedExpense);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (data: ExpenseFormValues) => {
    console.log("Form submitted with data:", data);
    
    if (currentExpense) {
      let categoryName = '';
      const foundCategory = categories.find(c => c.id === data.category);
      if (foundCategory) {
        categoryName = foundCategory.name;
      }
      
      console.log("Updating expense with categoryId:", data.category, "and name:", categoryName);
      
      const updatedDate = new Date(data.date);
      updatedDate.setHours(12, 0, 0, 0);
      
      let updatedStopDate = undefined;
      if (data.stopDate) {
        updatedStopDate = new Date(data.stopDate);
        updatedStopDate.setHours(12, 0, 0, 0);
      }
      
      const updatedExpense: Expense = { 
        ...currentExpense, 
        description: data.description,
        amount: data.amount,
        date: updatedDate,
        categoryId: data.category,
        category: categoryName,
        isRecurring: data.isRecurring,
        recurrenceInterval: data.recurrenceInterval,
        stopDate: updatedStopDate,
        currency: data.currency
      };
      
      console.log("Final updated expense object:", updatedExpense);
      
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === currentExpense.id 
            ? updatedExpense 
            : exp
        )
      );
      
      try {
        const formattedDate = updatedDate.toISOString().split('T')[0];
        const formattedStopDate = updatedStopDate ? updatedStopDate.toISOString().split('T')[0] : null;
        
        console.log("Formatted date for DB update:", formattedDate);
        console.log("Formatted stop date for DB update:", formattedStopDate);
        
        const { error } = await supabase
          .from('expenses')
          .update({
            description: data.description,
            amount: data.amount,
            date: formattedDate,
            category: categoryName,
            category_id: data.category,
            is_recurring: data.isRecurring,
            recurrence_interval: data.recurrenceInterval,
            stop_date: formattedStopDate,
            currency: data.currency
          })
          .eq('id', currentExpense.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } catch (error) {
        console.error('Error updating expense:', error);
        toast({
          title: "Error",
          description: "Failed to update expense in database, but it's updated in your current session",
          variant: "destructive"
        });
      }
      
      setCurrentExpense(null);
    } else {
      handleAddExpense(data);
    }
  };
  
  const handleDeleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense from database, but it's removed from your current session",
        variant: "destructive"
      });
    }
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentExpense(null);
  };
  
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    refreshData();
  };
  
  const handleTimeRangeChange = (newRange: { monthsBack: number, monthsForward: number }) => {
    setTimeRange(newRange);
  };
  
  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar 
        onAddExpense={() => {
          setCurrentExpense(null);
          setIsFormOpen(true);
        }}
        displayCurrency={displayCurrency}
        onCurrencyChange={setDisplayCurrency}
      />
      
      <main className="container mx-auto px-3 py-4">
        <div className="mb-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold mb-0.5">Financial Dashboard</h1>
            <p className="text-muted-foreground text-sm">Track, analyze, and plan your personal finances</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Manage Settings
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-24 animate-pulse-slow" />
            ))}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 glass-card p-4 h-[350px] animate-pulse-slow" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <DataCard
                title="Total Expenses"
                value={formatCurrency(totalExpenses, displayCurrency)}
                icon={<ReceiptText className="h-4 w-4" />}
                trend={expenseChange.value !== 0 ? expenseChange : undefined}
              />
              <DataCard
                title="Monthly Income"
                value={formatCurrency(monthlyIncome, displayCurrency)}
                icon={<Banknote className="h-4 w-4" />}
              />
              <DataCard
                title="Monthly Expenses"
                value={currentMonthData ? formatCurrency(currentMonthData.expenses, displayCurrency) : "0"}
                icon={<CreditCard className="h-4 w-4" />}
                description="Current month spending"
              />
              <DataCard
                title="Monthly Savings"
                value={currentMonthData ? formatCurrency(currentMonthData.savings, displayCurrency) : "0"}
                icon={<Coins className="h-4 w-4" />}
                trend={savingsChange.value !== 0 ? savingsChange : undefined}
              />
            </div>
            
            {expenses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 mb-5">
                  <div>
                    <FinancialCharts 
                      monthlyData={monthlyData} 
                      categoryData={categoryData}
                      onTimeRangeChange={handleTimeRangeChange}
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
              </>
            ) : (
              <div className="glass-card p-6 mb-5 text-center">
                <h2 className="text-lg font-medium mb-2">No Expenses Found</h2>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first expense using the "+ Add Expense" button.
                </p>
                <Button 
                  onClick={() => {
                    setCurrentExpense(null);
                    setIsFormOpen(true);
                  }}
                >
                  Add Your First Expense
                </Button>
              </div>
            )}
            
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Expenses</h2>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              <ExpenseTable 
                expenses={expenses}
                categories={categories}
                onAddExpense={() => {
                  setCurrentExpense(null);
                  setIsFormOpen(true);
                }}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>
          </>
        )}
      </main>
      
      <ExpenseForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        onSubmit={handleFormSubmit}
        initialValues={currentExpense}
        categories={categories}
      />
      
      <SettingsManager
        open={isSettingsOpen}
        onClose={handleCloseSettings}
      />
    </div>
  );
}
