
import { Expense, Category, CategoryBudget, CategoryTotal, Currency } from '../types';
import { convertCurrency } from '../currency-utils';

export const calculateCategoryTotals = async (
  expenses: Expense[],
  categories: Category[],
  budgets: CategoryBudget[] = []
): Promise<CategoryTotal[]> => {
  if (!expenses.length) {
    return [];
  }
  
  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));
  
  const budgetMap = new Map<string, number>();
  budgets.forEach(budget => budgetMap.set(budget.categoryId, budget.amount));
  
  // Calculate total expenses (all converted to THB for consistency)
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amountInTHB = convertCurrency(exp.amount, exp.currency || "THB", "THB");
    return sum + amountInTHB;
  }, 0);
  
  // Initialize category totals mapping with proper structure
  const categoryTotalsMap = new Map<string, { 
    amount: number, 
    name: string, 
    color: string,
    count: number,
    displayOrder?: number
  }>();
  
  // Process each expense
  expenses.forEach(expense => {
    if (!expense.categoryId) return;
    
    const category = categoryMap.get(expense.categoryId);
    if (!category) return;
    
    const amountInTHB = convertCurrency(expense.amount, expense.currency || "THB", "THB");
    
    if (categoryTotalsMap.has(expense.categoryId)) {
      const current = categoryTotalsMap.get(expense.categoryId)!;
      categoryTotalsMap.set(expense.categoryId, { 
        ...current,
        amount: current.amount + amountInTHB,
        count: current.count + 1
      });
    } else {
      categoryTotalsMap.set(expense.categoryId, { 
        amount: amountInTHB,
        name: category.name,
        color: category.color,
        count: 1,
        displayOrder: category.displayOrder
      });
    }
  });
  
  // Convert to array and calculate percentages
  const result: CategoryTotal[] = [];
  
  categoryTotalsMap.forEach((value, categoryId) => {
    const percentage = totalExpenses > 0 ? (value.amount / totalExpenses) * 100 : 0;
    const budget = budgetMap.get(categoryId);
    
    result.push({
      categoryId,
      categoryName: value.name,
      amount: value.amount,
      percentage: Number(percentage.toFixed(2)), // Ensure precise percentage value
      budget,
      color: value.color,
      count: value.count,
      displayOrder: value.displayOrder
    });
  });
  
  // Sort by amount (highest first)
  return result.sort((a, b) => b.amount - a.amount);
};
