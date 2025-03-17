
import { Expense, Currency, convertCurrency } from '@/lib/data';
import { format } from 'date-fns';

interface ExpensiveDay {
  date: Date | null;
  total: number;
}

// Find the biggest expense from a set of expenses
export function findBiggestExpense(
  filteredExpenses: Expense[], 
  currency: Currency
): Expense | null {
  if (filteredExpenses.length === 0) return null;
  
  return filteredExpenses.reduce((biggest, current) => {
    const biggestAmount = convertCurrency(biggest.amount, biggest.currency || "THB", currency);
    const currentAmount = convertCurrency(current.amount, current.currency || "THB", currency);
    
    return currentAmount > biggestAmount ? current : biggest;
  }, filteredExpenses[0]);
}

// Find the most expensive day
export function findMostExpensiveDay(
  filteredExpenses: Expense[], 
  currency: Currency
): ExpensiveDay {
  if (filteredExpenses.length === 0) return { date: null, total: 0 };
  
  const dailyTotals = filteredExpenses.reduce((map, expense) => {
    const dateKey = format(expense.date instanceof Date ? expense.date : new Date(expense.date), 'yyyy-MM-dd');
    const current = map.get(dateKey) || { date: expense.date, total: 0 };
    
    current.total += convertCurrency(expense.amount, expense.currency || "THB", currency);
    map.set(dateKey, current);
    
    return map;
  }, new Map<string, ExpensiveDay>());
  
  const mostExpensive = Array.from(dailyTotals.values())
    .sort((a, b) => b.total - a.total)[0];
    
  return mostExpensive || { date: null, total: 0 };
}
