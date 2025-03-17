
import { addDays, format, subDays, subMonths } from "date-fns";

export type Currency = "THB" | "USD" | "EUR";

export type Category = 
  | "Housing" 
  | "Transportation" 
  | "Food" 
  | "Utilities" 
  | "Insurance" 
  | "Healthcare" 
  | "Saving" 
  | "Personal" 
  | "Entertainment" 
  | "Other";

export type Expense = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category: Category;
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  stopDate?: Date;
  currency: Currency;
};

export type MonthlyTotal = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

export type CategoryTotal = {
  category: Category;
  amount: number;
  percentage: number;
};

// Currency exchange rates (relative to THB as base)
export const EXCHANGE_RATES: Record<Currency, number> = {
  THB: 1,      // Base currency
  USD: 0.028,  // 1 THB = 0.028 USD
  EUR: 0.026   // 1 THB = 0.026 EUR
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  THB: "฿",
  USD: "$",
  EUR: "€"
};

export const CATEGORIES: Category[] = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Saving",
  "Personal",
  "Entertainment",
  "Other"
];

export const CATEGORY_ICONS: Record<Category, string> = {
  Housing: "home",
  Transportation: "car",
  Food: "utensils",
  Utilities: "plug",
  Insurance: "shield",
  Healthcare: "heart-pulse",
  Saving: "piggy-bank",
  Personal: "user",
  Entertainment: "tv",
  Other: "more-horizontal"
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Housing: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  Transportation: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
  Food: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
  Utilities: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300",
  Insurance: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
  Healthcare: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  Saving: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
  Personal: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300",
  Entertainment: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
  Other: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
};

// Default monthly income
export let MONTHLY_INCOME = 5000;

// Calculate monthly totals with custom income and time range
export const calculateMonthlyTotals = (
  expenses: Expense[], 
  monthlyIncome = MONTHLY_INCOME,
  monthsBack = 6, 
  monthsForward = 3
): MonthlyTotal[] => {
  const result: MonthlyTotal[] = [];
  const currentDate = new Date();
  
  // Calculate historical months
  for (let i = monthsBack; i >= 0; i--) {
    const currentMonth = subMonths(currentDate, i);
    const monthStr = format(currentMonth, "MMM yyyy");
    
    // Filter expenses for this month
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth.getMonth() && 
             expDate.getFullYear() === currentMonth.getFullYear();
    });
    
    // Calculate total expenses for the month (convert all to THB for consistency)
    const totalExpenses = monthExpenses.reduce((sum, exp) => {
      const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
      return sum + amountInTHB;
    }, 0);
    
    // Calculate savings (income - expenses)
    const savings = monthlyIncome - totalExpenses;
    
    result.push({
      month: monthStr,
      income: monthlyIncome,
      expenses: totalExpenses,
      savings: savings
    });
  }
  
  // Calculate projected future months
  for (let i = 1; i <= monthsForward; i++) {
    const futureMonth = addDays(currentDate, i * 30); // Approximation
    const monthStr = format(futureMonth, "MMM yyyy");
    
    // Get recurring expenses that don't have a stop date or have a stop date in the future
    const recurringExpenses = expenses.filter(exp => 
      exp.isRecurring && 
      (!exp.stopDate || exp.stopDate >= futureMonth)
    );
    
    // Estimate monthly expenses based on recurring expenses and average of non-recurring
    const monthlyRecurringTotal = recurringExpenses
      .filter(exp => exp.recurrenceInterval === "monthly")
      .reduce((sum, exp) => {
        const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
        return sum + amountInTHB;
      }, 0);
    
    // Calculate average of weekly expenses and multiply by weeks in a month
    const weeklyRecurringExpenses = recurringExpenses
      .filter(exp => exp.recurrenceInterval === "weekly");
    const monthlyFromWeekly = weeklyRecurringExpenses.reduce((sum, exp) => {
      const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
      return sum + amountInTHB;
    }, 0) * 4;
    
    // Calculate average non-recurring expenses from past few months
    const pastMonths = result.slice(-3);
    const totalPastExpenses = pastMonths.reduce((sum, month) => sum + month.expenses, 0);
    const averageNonRecurring = pastMonths.length > 0 
      ? (totalPastExpenses / pastMonths.length) - (monthlyRecurringTotal + monthlyFromWeekly) 
      : 0;
    
    // Calculate total projected expenses
    const projectedExpenses = monthlyRecurringTotal + monthlyFromWeekly + averageNonRecurring;
    
    // Calculate projected savings
    const projectedSavings = monthlyIncome - projectedExpenses;
    
    result.push({
      month: monthStr,
      income: monthlyIncome,
      expenses: projectedExpenses,
      savings: projectedSavings
    });
  }
  
  return result;
};

// Convert amount from one currency to another
export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to THB first (our base currency)
  const amountInTHB = fromCurrency === "THB" ? amount : amount / EXCHANGE_RATES[fromCurrency];
  
  // Then convert from THB to target currency
  return toCurrency === "THB" ? amountInTHB : amountInTHB * EXCHANGE_RATES[toCurrency];
};

// Calculate totals by category
export const calculateCategoryTotals = (expenses: Expense[]): CategoryTotal[] => {
  // Calculate total expenses (convert all to THB for consistency)
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
    return sum + amountInTHB;
  }, 0);
  
  // Group by category and calculate totals
  const categoryTotals = CATEGORIES.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const amount = categoryExpenses.reduce((sum, exp) => {
      const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
      return sum + amountInTHB;
    }, 0);
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    
    return {
      category,
      amount,
      percentage
    };
  });
  
  // Sort by amount (highest first)
  return categoryTotals.sort((a, b) => b.amount - a.amount);
};

// Format currency number to string based on the specified currency
export const formatCurrency = (amount: number, currency: Currency = "THB"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};
