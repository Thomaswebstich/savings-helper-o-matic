
import { Expense, Currency, convertCurrency } from '@/lib/data';
import { subDays, isAfter, isBefore } from 'date-fns';
import { extractColorFromClass } from './category-breakdown-utils';

// Calculate spending averages (daily, weekly, monthly)
export function calculateAverages(filteredExpenses: Expense[], currency: Currency) {
  if (filteredExpenses.length === 0) {
    return { 
      averages: { daily: 0, weekly: 0, monthly: 0 },
      daysDiff: 1
    };
  }
  
  // Find date range
  const dates = filteredExpenses.map(e => e.date instanceof Date ? e.date : new Date(e.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  // Calculate days between
  const days = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate total in display currency
  const total = filteredExpenses.reduce((sum, expense) => {
    return sum + convertCurrency(expense.amount, expense.currency || "THB", currency);
  }, 0);
  
  return {
    averages: {
      daily: total / days,
      weekly: (total / days) * 7,
      monthly: (total / days) * 30
    },
    daysDiff: days
  };
}

// Calculate spending trend (comparing recent vs older expenses)
export function calculateSpendingTrend(filteredExpenses: Expense[], currency: Currency) {
  if (filteredExpenses.length < 7) return { trend: 0, isPositive: false };
  
  const now = new Date();
  const halfwayPoint = subDays(now, Math.floor(filteredExpenses.length / 2));
  
  const recentExpenses = filteredExpenses.filter(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    return isAfter(expenseDate, halfwayPoint);
  });
  
  const olderExpenses = filteredExpenses.filter(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    return isBefore(expenseDate, halfwayPoint) || expenseDate.getTime() === halfwayPoint.getTime();
  });
  
  if (olderExpenses.length === 0) return { trend: 0, isPositive: false };
  
  const recentTotal = recentExpenses.reduce((sum, expense) => 
    sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
  
  const olderTotal = olderExpenses.reduce((sum, expense) => 
    sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
  
  const trend = ((recentTotal - olderTotal) / olderTotal) * 100;
  
  return {
    trend: Math.abs(Math.round(trend)),
    isPositive: trend <= 0 // Lower spending is positive
  };
}

// Prepare stacked bar data for categories
export function prepareStackedBarData(categoryData: Array<{
  categoryId: string;
  categoryName: string;
  amount: number;
  budget?: number;
  percentage: number;
  color?: string;
}>) {
  if (categoryData.length === 0) return [];
  
  return categoryData
    .filter(cat => cat.percentage > 0)
    .slice(0, 8)  // Limit to top 8 categories
    .map(cat => ({
      id: cat.categoryId,
      value: cat.percentage,
      color: cat.color ? extractColorFromClass(cat.color) : getCategoryColor(cat.categoryId, 0, categoryData)
    }));
}

// Get category color (ensuring same colors as in charts)
export function getCategoryColor(
  categoryId: string, 
  index: number, 
  categoryData: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    budget?: number;
    percentage: number;
    color?: string;
  }>
): string {
  const colors = [
    "#0ea5e9", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#94a3b8"  // slate
  ];
  
  // Try to find color in categoryData first
  const categoryInfo = categoryData.find(c => c.categoryId === categoryId);
  if (categoryInfo?.color) {
    // Extract the actual color from the class name if it's a Tailwind class
    return extractColorFromClass(categoryInfo.color);
  }
  
  // Use index or hash the category ID for consistent color
  if (index !== undefined) return colors[index % colors.length];
  
  const hash = categoryId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}
