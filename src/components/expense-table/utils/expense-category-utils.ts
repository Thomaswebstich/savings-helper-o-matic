
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
