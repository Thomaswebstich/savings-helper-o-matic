
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ExpenseForm } from '@/components/expense-form';
import { SettingsManager } from '@/components/SettingsManager';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useExpenseActions } from '@/hooks/useExpenseActions';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ChartsContainer } from '@/components/dashboard/ChartsContainer';
import { ExpenseTableWrapper } from '@/components/dashboard/ExpenseTableWrapper';

export default function Index() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const {
    expenses,
    setExpenses,
    categories,
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
  } = useDashboardData();
  
  const {
    isFormOpen,
    setIsFormOpen,
    currentExpense,
    handleEditExpense,
    handleFormSubmit,
    handleDeleteExpense,
    handleCloseForm,
    addExpenseFromReceipt,
    openAddExpenseForm
  } = useExpenseActions({ 
    expenses, 
    setExpenses, 
    categories 
  });
  
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
        onAddExpense={openAddExpenseForm}
        displayCurrency={displayCurrency}
        onCurrencyChange={setDisplayCurrency}
      />
      
      <main className="container mx-auto px-3 py-4">
        <DashboardHeader
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-4 h-24 animate-pulse-slow" />
            ))}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 glass-card p-4 h-[350px] animate-pulse-slow" />
          </div>
        ) : (
          <>
            <OverviewCards
              totalExpenses={totalExpenses}
              monthlyIncome={monthlyIncome}
              currentMonthData={currentMonthData}
              expenseChange={expenseChange}
              savingsChange={savingsChange}
              displayCurrency={displayCurrency}
              monthlyData={monthlyData}
            />
            
            {expenses.length > 0 ? (
              <>
                <ChartsContainer
                  expenses={expenses}
                  monthlyData={monthlyData}
                  categoryData={categoryData}
                  displayCurrency={displayCurrency}
                  timeRange={timeRange}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </>
            ) : (
              <EmptyState onAddExpenseClick={openAddExpenseForm} />
            )}
            
            <ExpenseTableWrapper 
              expenses={expenses}
              categories={categories}
              onAddExpense={openAddExpenseForm}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              monthlyIncome={monthlyIncome}
            />
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
