
import { Expense, Category, CategoryBudget, CategoryTotal, Currency } from '../types';
import { convertCurrency } from '../currency-utils';

export const calculateCategoryTotals = async (
  expenses: Expense[],
  categories: Category[],
  budgets: CategoryBudget[] = []
): Promise<CategoryTotal[]> => {
  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));
  
  const budgetMap = new Map<string, number>();
  budgets.forEach(budget => budgetMap.set(budget.categoryId, budget.amount));
  
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
    return sum + amountInTHB;
  }, 0);
  
  const categoryTotals = new Map<string, { amount: number, name: string, color: string }>();
  
  expenses.forEach(expense => {
    if (!expense.categoryId) return;
    
    const category = categoryMap.get(expense.categoryId);
    if (!category) return;
    
    const amountInTHB = convertCurrency(expense.amount, expense.currency, "THB");
    
    if (categoryTotals.has(expense.categoryId)) {
      const current = categoryTotals.get(expense.categoryId)!;
      categoryTotals.set(expense.categoryId, { 
        ...current,
        amount: current.amount + amountInTHB
      });
    } else {
      categoryTotals.set(expense.categoryId, { 
        amount: amountInTHB,
        name: category.name,
        color: category.color
      });
    }
  });
  
  const result: CategoryTotal[] = [];
  
  categoryTotals.forEach((value, categoryId) => {
    const percentage = totalExpenses > 0 ? (value.amount / totalExpenses) * 100 : 0;
    const budget = budgetMap.get(categoryId);
    
    result.push({
      categoryId,
      categoryName: value.name,
      amount: value.amount,
      percentage,
      budget,
      color: value.color
    });
  });
  
  return result.sort((a, b) => b.amount - a.amount);
};
