
// Instead of re-exporting everything with * exports which causes conflicts,
// let's export specific items from each file
export * from './types';

// From currency-utils.ts
export { 
  EXCHANGE_RATES, 
  CURRENCY_SYMBOLS, 
  convertCurrency 
} from './currency-utils';

// Explicitly export formatCurrency from calculation-utils to avoid conflict
export { formatCurrency } from './calculation-utils';

// From category-utils
export {
  CATEGORY_ICONS,
  DEFAULT_CATEGORIES
} from './category/constants';

export {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from './category/category-api';

export {
  fetchBudgets,
  addBudget,
  updateBudget,
  deleteBudget
} from './category/budget-api';

// From calculation-utils
export {
  calculateTotalMonthlyIncome,
  groupExpensesByMonth,
  calculateCategoryTotals,
  calculateMonthIncomeForDate
} from './calculation-utils';

// From income-utils
export {
  fetchIncomeSources,
  addIncomeSource,
  updateIncomeSource,
  deleteIncomeSource
} from './income-utils';

// Add missing function for monthly totals
export const calculateMonthlyTotals = (
  expenses: any[], 
  incomeSources: any[], 
  monthsBack: number = 3, 
  monthsForward: number = 3
): any[] => {
  const today = new Date();
  const result = [];
  
  // Start from months back
  for (let i = -monthsBack; i <= monthsForward; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthIncome = calculateMonthIncomeForDate(incomeSources, monthDate);
    
    // Filter expenses for this month
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === monthDate.getMonth() && 
             expenseDate.getFullYear() === monthDate.getFullYear();
    });
    
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    result.push({
      month: monthDate,
      income: monthIncome,
      expenses: totalExpenses,
      savings: monthIncome - totalExpenses,
      isProjected: i > 0 // Future months are projections
    });
  }
  
  return result;
};
