
import { Expense, Category } from '@/lib/data';

/**
 * Get category for an expense
 */
export function getExpenseCategory(expense: Expense, categoryMap: Map<string, Category>): Category | string {
  // First check if we have a categoryId that maps to a category
  if (expense.categoryId) {
    const category = categoryMap.get(expense.categoryId);
    if (category) return category;
  }
  
  // Fall back to the legacy category string if available
  if (expense.category) {
    return expense.category;
  }
  
  // Default fallback
  return "Other";
}

/**
 * Get a color for a category ID
 * This provides a consistent color for each category ID
 */
export function getCategoryColor(categoryId: string): string {
  // Basic hash function to convert categoryId to a predictable number
  const hash = Array.from(categoryId).reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
  );
  
  // List of visually distinct colors
  const colors = [
    "#3b82f6", // blue-500
    "#ef4444", // red-500
    "#10b981", // green-500
    "#f59e0b", // amber-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#06b6d4", // cyan-500
    "#6366f1", // indigo-500
    "#84cc16", // lime-500
    "#a855f7", // purple-500
  ];
  
  // Use the hash to select a color
  return colors[Math.abs(hash) % colors.length];
}
