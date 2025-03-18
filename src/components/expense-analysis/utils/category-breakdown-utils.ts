
import { Expense, Currency, convertCurrency } from '@/lib/data';
import { startOfDay, endOfDay, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';

interface CategoryInfo {
  id: string;
  name: string;
  total: number;
  count: number;
  color?: string;
  percentage?: number;
}

export interface CategoryBreakdownResult {
  categoryData: CategoryInfo[];
  totalAmount: number;
  timePeriodStats: {
    days: number;
    weeks: number;
    months: number;
  };
}

// Define an explicit type for category object to help with type checking
interface CategoryObject {
  name?: string;
  color?: string;
  [key: string]: any;
}

// Extract the actual color value from category color class string
export function extractColorFromClass(colorClass: string): string {
  if (!colorClass) return '#0ea5e9'; // Default blue if no color class provided
  
  // Map of Tailwind color classes to hex codes
  const colorMap: Record<string, string> = {
    'bg-blue-100': '#0ea5e9', // blue
    'bg-green-100': '#10b981', // green
    'bg-orange-100': '#f59e0b', // amber/orange
    'bg-yellow-100': '#facc15', // yellow
    'bg-purple-100': '#8b5cf6', // purple
    'bg-red-100': '#ef4444', // red
    'bg-emerald-100': '#10b981', // emerald
    'bg-sky-100': '#0ea5e9', // sky
    'bg-indigo-100': '#6366f1', // indigo
    'bg-gray-100': '#94a3b8', // gray/slate
    'bg-pink-100': '#ec4899', // pink
    'bg-rose-100': '#f43f5e', // rose
    'bg-violet-100': '#8b5cf6', // violet
    'bg-fuchsia-100': '#d946ef', // fuchsia
    'bg-teal-100': '#14b8a6', // teal
    'bg-cyan-100': '#06b6d4', // cyan
    'bg-lime-100': '#84cc16', // lime
    'bg-amber-100': '#f59e0b', // amber
  };
  
  // Extract the base color from the class name (e.g., "bg-blue-100 text-blue-600..." -> "bg-blue-100")
  const baseColorClass = colorClass.split(' ')[0];
  
  return colorMap[baseColorClass] || '#0ea5e9'; // Default to blue if not found
}

// Calculate category data breakdown
export function calculateCategoryBreakdown(
  filteredExpenses: Expense[], 
  currency: Currency
): CategoryBreakdownResult {
  if (filteredExpenses.length === 0) {
    return { 
      categoryData: [], 
      totalAmount: 0,
      timePeriodStats: { days: 1, weeks: 0.143, months: 0.033 }
    };
  }
  
  const categoryMap = new Map<string, CategoryInfo>();
  
  // Group by category
  filteredExpenses.forEach(expense => {
    const categoryId = expense.categoryId || 'uncategorized';
    let categoryName = 'Uncategorized';
    let color: string | undefined;
    
    // Extract information from category object if available
    if (expense.category && typeof expense.category === 'object') {
      // Use type assertion to help TypeScript understand the structure
      const categoryObj = expense.category as CategoryObject;
      
      if (categoryObj.name && typeof categoryObj.name === 'string') {
        categoryName = categoryObj.name;
      }
      
      if (categoryObj.color && typeof categoryObj.color === 'string') {
        // Extract the actual color from the Tailwind class
        color = extractColorFromClass(categoryObj.color);
      }
    } else if (typeof expense.category === 'string') {
      categoryName = expense.category;
    }
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: categoryName,
        total: 0,
        count: 0,
        color
      });
    }
    
    const entry = categoryMap.get(categoryId)!;
    entry.total += convertCurrency(expense.amount, expense.currency || "THB", currency);
    entry.count += 1;
  });
  
  // Find date range
  const dates = filteredExpenses.map(e => e.date instanceof Date ? e.date : new Date(e.date));
  const minDate = startOfDay(new Date(Math.min(...dates.map(d => d.getTime()))));
  const maxDate = endOfDay(new Date(Math.max(...dates.map(d => d.getTime()))));
  
  // Calculate period differences for accurate averages
  const daysDiff = Math.max(1, differenceInDays(maxDate, minDate) + 1); // +1 to include both start and end days
  const weeksDiff = Math.max(0.143, differenceInWeeks(maxDate, minDate) + 0.143); // +0.143 (1/7) to avoid division by zero
  const monthsDiff = Math.max(0.033, differenceInMonths(maxDate, minDate) + 0.033); // +0.033 (1/30) to avoid division by zero
  
  // Calculate total for percentages
  const totalSpending = filteredExpenses.reduce((sum, expense) => 
    sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
  
  // Calculate time period stats for correct averages
  const timePeriodStats = {
    days: daysDiff,
    weeks: weeksDiff,
    months: monthsDiff
  };
  
  // Sort by amount
  const categoryData = Array.from(categoryMap.values())
    .map(category => ({
      ...category,
      percentage: (category.total / totalSpending) * 100
    }))
    .sort((a, b) => b.total - a.total);
    
  return { 
    categoryData, 
    totalAmount: totalSpending,
    timePeriodStats
  };
}

// Get category color (ensuring same colors as in charts)
export function getCategoryColor(categoryId: string, index: number, categories: CategoryInfo[]): string {
  // Default color palette
  const colors = [
    "#0ea5e9", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#94a3b8"  // slate
  ];
  
  // First priority: Check if this category already has a color in our data
  const categoryInfo = categories.find(c => c.id === categoryId);
  if (categoryInfo?.color) return categoryInfo.color;
  
  // Second priority: Use index-based color for consistent coloring within a component
  if (index !== undefined) return colors[index % colors.length];
  
  // Fallback: Hash the category ID for consistent coloring across components
  const hash = categoryId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

// Create stacked bar data
export function getStackedBarData(categoryData: CategoryInfo[]) {
  return categoryData.map((category, index) => ({
    id: category.id,
    value: category.percentage || 0,
    color: category.color || getCategoryColor(category.id, index, categoryData)
  }));
}
