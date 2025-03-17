
import { Expense, Category, formatCurrency } from '@/lib/data';
import { format, startOfMonth } from 'date-fns';
import { MonthGroup, SortConfig } from '../types';

/**
 * Filter expenses based on search and category filters
 */
export function filterExpense(expense: Expense, search: string, selectedCategories: string[]): boolean {
  // Filter by search term
  const matchesSearch = 
    expense.description.toLowerCase().includes(search.toLowerCase()) ||
    formatCurrency(expense.amount).includes(search);
  
  // Filter by selected categories
  const matchesCategory = selectedCategories.length === 0 || 
    selectedCategories.includes(expense.categoryId);
  
  return matchesSearch && matchesCategory;
}

/**
 * Group expenses by month and calculate totals
 */
export function groupExpensesByMonth(
  filteredExpenses: Expense[], 
  sortConfig: SortConfig, 
  categoryMap: Map<string, Category>
): MonthGroup[] {
  const groups: MonthGroup[] = [];
  const monthMap = new Map<string, MonthGroup>();
  
  // Sort expenses by date first
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return sortConfig.key === 'date' && sortConfig.direction === 'asc' 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
  
  // Group expenses by month
  sortedExpenses.forEach(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const monthStart = startOfMonth(expenseDate);
    const monthKey = format(monthStart, 'yyyy-MM');
    const monthLabel = format(monthStart, 'MMMM yyyy');
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthStart,
        label: monthLabel,
        expenses: [],
        total: 0,
        categoryTotals: new Map<string, number>()
      });
    }
    
    const group = monthMap.get(monthKey)!;
    group.expenses.push(expense);
    group.total += expense.amount;
    
    // Update category totals
    const categoryId = expense.categoryId || 'uncategorized';
    const currentTotal = group.categoryTotals.get(categoryId) || 0;
    group.categoryTotals.set(categoryId, currentTotal + expense.amount);
  });
  
  // Convert map to array and sort by month (most recent first)
  Array.from(monthMap.values()).forEach(group => {
    // Sort expenses within the month group based on sortConfig
    sortExpensesInGroup(group, sortConfig, categoryMap);
    groups.push(group);
  });
  
  // Sort month groups by date (most recent first)
  return groups.sort((a, b) => b.month.getTime() - a.month.getTime());
}

/**
 * Sort expenses within a month group based on sort configuration
 */
function sortExpensesInGroup(
  group: MonthGroup, 
  sortConfig: SortConfig, 
  categoryMap: Map<string, Category>
): void {
  group.expenses.sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return sortConfig.direction === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }
    
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    
    if (sortConfig.key === 'description') {
      return sortConfig.direction === 'asc'
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    }
    
    if (sortConfig.key === 'category') {
      const catA = categoryMap.get(a.categoryId)?.name || '';
      const catB = categoryMap.get(b.categoryId)?.name || '';
      return sortConfig.direction === 'asc'
        ? catA.localeCompare(catB)
        : catB.localeCompare(catA);
    }
    
    return 0;
  });
}

// Utility for determining category colors
export function getCategoryColor(categoryId: string): string {
  const colors = [
    "#0ea5e9", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#94a3b8"  // slate
  ];
  
  // Hash the category ID to get consistent color
  const hash = categoryId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}
