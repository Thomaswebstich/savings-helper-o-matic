
import { IncomeSource, Expense, Category, Currency } from './types';
import { format, getMonth, getYear } from 'date-fns';

// Helper function to format currency
export function formatCurrency(amount: number, currency: Currency = 'THB'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Function to calculate total monthly income
export function calculateTotalMonthlyIncome(incomeSources: IncomeSource[]): number {
  return incomeSources.reduce((total, source) => total + source.amount, 0);
}

// Function to group expenses by month
export function groupExpensesByMonth(expenses: Expense[]) {
  return expenses.reduce((groups: { [key: string]: Expense[] }, expense) => {
    const monthYear = format(expense.date, 'MMMM yyyy');
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(expense);
    return groups;
  }, {});
}

export function calculateCategoryTotals(expenses: Expense[], categoryMap: Map<string, Category>): Map<string, number> {
  const categoryTotals = new Map<string, number>();

  expenses.forEach(expense => {
    if (expense.categoryId) {
      const categoryId = expense.categoryId;
      const currentTotal = categoryTotals.get(categoryId) || 0;
      categoryTotals.set(categoryId, currentTotal + expense.amount);
    }
  });

  return categoryTotals;
}

// Helper function to calculate income for a specific month
export function calculateMonthIncomeForDate(incomeSources: IncomeSource[], monthDate: Date): number {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  
  console.log(`Calculating income for: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);
  
  let totalIncome = 0;
  
  incomeSources.forEach(income => {
    const startDate = new Date(income.startDate);
    
    // Check if one-time income falls within this month
    if (!income.isRecurring) {
      if (startDate >= monthStart && startDate <= monthEnd) {
        console.log(`Adding one-time income for ${income.description}: ${income.amount}`);
        totalIncome += income.amount;
      }
      return;
    }
    
    // Handle recurring income
    if (startDate <= monthEnd) {
      // Check if this recurring income has ended
      if (income.endDate) {
        const endDate = new Date(income.endDate);
        if (endDate < monthStart) {
          return; // Income has ended before this month
        }
      }
      
      console.log(`Adding recurring income for ${income.description}: ${income.amount}`);
      totalIncome += income.amount;
    }
  });
  
  console.log(`Total income for month: ${totalIncome}`);
  return totalIncome;
}
