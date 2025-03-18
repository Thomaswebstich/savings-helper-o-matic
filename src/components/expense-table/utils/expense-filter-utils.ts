
import { Expense, Category, convertCurrency } from '@/lib/data';
import { format, parse, isWithinInterval, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns';
import { MonthGroup, SortConfig } from '../types';

export const filterExpense = (
  expense: Expense, 
  searchTerm: string, 
  selectedCategories: string[]
): boolean => {
  const matchesSearch = !searchTerm || 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.amount.toString().includes(searchTerm);
    
  const matchesCategory = selectedCategories.length === 0 || 
    selectedCategories.includes(expense.categoryId || '');
    
  return matchesSearch && matchesCategory;
};

export const groupExpensesByMonth = (
  expenses: Expense[], 
  sortConfig: SortConfig
): MonthGroup[] => {
  const groups: Map<string, MonthGroup> = new Map();
  
  // First, create the groups and add expenses to them
  expenses.forEach(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const monthKey = format(expenseDate, 'yyyy-MM');
    const monthLabel = format(expenseDate, 'MMMM yyyy');
    
    if (!groups.has(monthKey)) {
      groups.set(monthKey, {
        month: startOfMonth(expenseDate),
        label: monthLabel,
        expenses: [],
        total: 0,
        categoryTotals: new Map()
      });
    }
    
    const group = groups.get(monthKey)!;
    group.expenses.push(expense);
  });
  
  // Then calculate totals and category breakdowns in a separate pass
  for (const group of groups.values()) {
    // Reset total to ensure we calculate it correctly
    group.total = 0;
    group.categoryTotals.clear();
    
    // Calculate total in THB for consistency
    group.expenses.forEach(expense => {
      const amountInTHB = convertCurrency(expense.amount, expense.currency || "THB", "THB");
      group.total += amountInTHB;
      
      // Track totals by category
      const categoryId = expense.categoryId || 'uncategorized';
      const currentCategoryTotal = group.categoryTotals.get(categoryId) || 0;
      group.categoryTotals.set(categoryId, currentCategoryTotal + amountInTHB);
    });
  }
  
  // Apply sorting to each group's expenses based on the current sort config
  for (const group of groups.values()) {
    if (sortConfig.key) {
      group.expenses.sort((a, b) => {
        if (sortConfig.key === 'date') {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return sortConfig.direction === 'asc' 
            ? dateA.getTime() - dateB.getTime() 
            : dateB.getTime() - dateA.getTime();
        } else if (sortConfig.key === 'amount') {
          // Convert both amounts to THB for fair comparison
          const amountA = convertCurrency(a.amount, a.currency || "THB", "THB");
          const amountB = convertCurrency(b.amount, b.currency || "THB", "THB");
          
          return sortConfig.direction === 'asc' 
            ? amountA - amountB 
            : amountB - amountA;
        } else {
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          
          // Handle string comparisons
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          return 0;
        }
      });
    }
  }
  
  // Convert map to array and sort by date (most recent first)
  return Array.from(groups.values())
    .sort((a, b) => {
      const dateA = a.month;
      const dateB = b.month;
      return dateB.getTime() - dateA.getTime();
    });
};

export const filterExpensesByDate = (
  expenses: Expense[], 
  dateFilter: { start: Date | null; end: Date | null }
): Expense[] => {
  if (!dateFilter.start && !dateFilter.end) {
    return expenses;
  }
  
  return expenses.filter(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    
    let isWithinRange = true;
    
    if (dateFilter.start) {
      isWithinRange = isWithinRange && expenseDate >= dateFilter.start;
    }
    
    if (dateFilter.end) {
      isWithinRange = isWithinRange && expenseDate <= dateFilter.end;
    }
    
    return isWithinRange;
  });
};

export const filterExpensesByCategory = (
  expenses: Expense[], 
  categoryIds: string[]
): Expense[] => {
  if (!categoryIds.length) {
    return expenses;
  }
  
  return expenses.filter(expense => {
    const categoryId = expense.categoryId || '';
    return categoryIds.includes(categoryId);
  });
};

export const filterExpensesBySearchTerm = (
  expenses: Expense[], 
  searchTerm: string
): Expense[] => {
  if (!searchTerm.trim()) {
    return expenses;
  }
  
  const lowercasedTerm = searchTerm.toLowerCase();
  
  return expenses.filter(expense => {
    const description = expense.description.toLowerCase();
    const amount = expense.amount.toString();
    
    return (
      description.includes(lowercasedTerm) ||
      amount.includes(lowercasedTerm)
    );
  });
};

export const filterExpensesByRecurring = (
  expenses: Expense[], 
  showRecurring: boolean | null
): Expense[] => {
  if (showRecurring === null) {
    return expenses;
  }
  
  return expenses.filter(expense => {
    return showRecurring ? expense.isRecurring : !expense.isRecurring;
  });
};

export const sortFilteredExpenses = (
  expenses: Expense[], 
  sortConfig: SortConfig
): Expense[] => {
  const sortedExpenses = [...expenses];
  
  if (sortConfig.key) {
    sortedExpenses.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return sortConfig.direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      } else if (sortConfig.key === 'amount') {
        // Convert both amounts to THB for fair comparison
        const amountA = convertCurrency(a.amount, a.currency || "THB", "THB");
        const amountB = convertCurrency(b.amount, b.currency || "THB", "THB");
        
        return sortConfig.direction === 'asc' 
          ? amountA - amountB 
          : amountB - amountA;
      } else {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      }
    });
  }
  
  return sortedExpenses;
};
