
import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { DataCard } from '@/components/DataCard';
import { ExpenseTable } from '@/components/ExpenseTable';
import { FinancialCharts } from '@/components/FinancialCharts';
import { SavingsProjection } from '@/components/SavingsProjection';
import { ExpenseAnalysis } from '@/components/ExpenseAnalysis';
import { IncomeEditor } from '@/components/IncomeEditor';
import { 
  Expense, 
  generateMockExpenses, 
  calculateMonthlyTotals, 
  calculateCategoryTotals, 
  formatCurrency,
  Currency,
  convertCurrency,
  MONTHLY_INCOME
} from '@/lib/data';
import { ExpenseForm, ExpenseFormValues } from '@/components/ExpenseForm';
import { Banknote, Calendar, Coins, CreditCard, ReceiptText, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Index() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("THB");
  const [monthlyIncome, setMonthlyIncome] = useState<number>(MONTHLY_INCOME);
  const [timeRange, setTimeRange] = useState({ monthsBack: 6, monthsForward: 3 });
  
  // Load mock data on component mount
  useEffect(() => {
    // Simulate loading delay for a more realistic experience
    const timer = setTimeout(() => {
      const mockData = generateMockExpenses();
      setExpenses(mockData);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate monthly totals for charts with current time range
  const monthlyData = useMemo(() => {
    if (expenses.length === 0) return [];
    return calculateMonthlyTotals(expenses, monthlyIncome, timeRange.monthsBack, timeRange.monthsForward);
  }, [expenses, monthlyIncome, timeRange]);
  
  // Calculate category totals
  const categoryData = useMemo(() => {
    if (expenses.length === 0) return [];
    return calculateCategoryTotals(expenses);
  }, [expenses]);
  
  // Calculate current month totals
  const currentMonthData = useMemo(() => {
    if (monthlyData.length === 0) return null;
    
    const data = monthlyData[monthlyData.length - timeRange.monthsForward - 1]; // Get the most recent actual month
    if (!data) return null;
    
    // Convert totals to display currency
    return {
      month: data.month,
      income: convertCurrency(data.income, "THB", displayCurrency),
      expenses: convertCurrency(data.expenses, "THB", displayCurrency),
      savings: convertCurrency(data.savings, "THB", displayCurrency)
    };
  }, [monthlyData, displayCurrency, timeRange.monthsForward]);
  
  // Calculate month-over-month change for expenses
  const expenseChange = useMemo(() => {
    if (monthlyData.length < 2) return { value: 0, isPositive: false };
    
    const currentMonth = monthlyData[monthlyData.length - timeRange.monthsForward - 1];
    const previousMonth = monthlyData[monthlyData.length - timeRange.monthsForward - 2];
    
    if (!currentMonth || !previousMonth) return { value: 0, isPositive: false };
    
    const change = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
    return {
      value: Math.abs(change),
      isPositive: change < 0 // Lower expenses is positive trend
    };
  }, [monthlyData, timeRange.monthsForward]);
  
  // Calculate month-over-month change for savings
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
  
  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    const totalInTHB = expenses.reduce((total, expense) => {
      const amountInTHB = convertCurrency(expense.amount, expense.currency, "THB");
      return total + amountInTHB;
    }, 0);
    
    return convertCurrency(totalInTHB, "THB", displayCurrency);
  }, [expenses, displayCurrency]);
  
  // Handle adding a new expense
  const handleAddExpense = (data: ExpenseFormValues) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...data
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    toast({
      title: "Success",
      description: "Expense added successfully",
    });
  };
  
  // Handle editing an expense
  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsFormOpen(true);
  };
  
  // Handle form submission for both add and edit
  const handleFormSubmit = (data: ExpenseFormValues) => {
    if (currentExpense) {
      // Update existing expense
      setExpenses(prev => 
        prev.map(exp => 
          exp.id === currentExpense.id 
            ? { ...exp, ...data } 
            : exp
        )
      );
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      setCurrentExpense(null);
    } else {
      // Add new expense
      handleAddExpense(data);
    }
  };
  
  // Handle deleting an expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    toast({
      title: "Success",
      description: "Expense deleted successfully",
    });
  };
  
  // Close form and reset current expense
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentExpense(null);
  };
  
  // Handle income change
  const handleIncomeChange = (newIncome: number) => {
    setMonthlyIncome(newIncome);
    toast({
      title: "Income Updated",
      description: `Monthly income set to ${formatCurrency(newIncome, displayCurrency)}`,
    });
  };
  
  // Handle time range change from charts
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
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Financial Dashboard</h1>
          <p className="text-muted-foreground">Track, analyze, and plan your personal finances</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-32 animate-pulse-slow" />
            ))}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 glass-card p-6 h-[400px] animate-pulse-slow" />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <DataCard
                title="Total Expenses"
                value={formatCurrency(totalExpenses, displayCurrency)}
                icon={<ReceiptText className="h-5 w-5" />}
                trend={expenseChange.value !== 0 ? expenseChange : undefined}
              />
              <DataCard
                title="Monthly Income"
                value={
                  <IncomeEditor 
                    income={currentMonthData ? currentMonthData.income : monthlyIncome} 
                    currency={displayCurrency} 
                    onIncomeChange={handleIncomeChange} 
                  />
                }
                icon={<Banknote className="h-5 w-5" />}
              />
              <DataCard
                title="Monthly Expenses"
                value={currentMonthData ? formatCurrency(currentMonthData.expenses, displayCurrency) : "0"}
                icon={<CreditCard className="h-5 w-5" />}
                description="Current month spending"
              />
              <DataCard
                title="Monthly Savings"
                value={currentMonthData ? formatCurrency(currentMonthData.savings, displayCurrency) : "0"}
                icon={<Coins className="h-5 w-5" />}
                trend={savingsChange.value !== 0 ? savingsChange : undefined}
              />
            </div>
            
            {/* Financial Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <FinancialCharts 
                  monthlyData={monthlyData} 
                  categoryData={categoryData}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </div>
              <div className="lg:col-span-1">
                <SavingsProjection 
                  monthlyData={monthlyData} 
                  currency={displayCurrency}
                />
              </div>
            </div>
            
            {/* Expense Analysis - New component */}
            <div className="mb-8">
              <ExpenseAnalysis 
                expenses={expenses}
                categoryData={categoryData}
                currency={displayCurrency}
              />
            </div>
            
            {/* Expenses Table */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Expenses</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              <ExpenseTable 
                expenses={expenses} 
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
      
      {/* Add/Edit Expense Form */}
      <ExpenseForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        onSubmit={handleFormSubmit}
        initialValues={currentExpense}
      />
    </div>
  );
}
