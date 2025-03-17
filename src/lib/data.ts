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

// Default monthly income - now no longer a constant
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
    const averageNonRecurring = (totalPastExpenses / pastMonths.length) - (monthlyRecurringTotal + monthlyFromWeekly);
    
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

// Generate mock expense data for demonstration
export const generateMockExpenses = (count = 50): Expense[] => {
  const expenses: Expense[] = [];
  const currentDate = new Date();
  
  // Generate transactions from 3 months ago up to today
  const startDate = subMonths(currentDate, 3);
  
  // Generate some recurring expenses
  const recurringExpenses: Array<{
    amount: number, 
    description: string, 
    category: Category, 
    interval: "daily" | "weekly" | "monthly" | "yearly",
    currency: Currency
  }> = [
    { amount: 15000, description: "Rent", category: "Housing", interval: "monthly", currency: "THB" },
    { amount: 2000, description: "Electricity", category: "Utilities", interval: "monthly", currency: "THB" },
    { amount: 500, description: "Internet", category: "Utilities", interval: "monthly", currency: "THB" },
    { amount: 1500, description: "Phone", category: "Utilities", interval: "monthly", currency: "THB" },
    { amount: 2000, description: "Car Payment", category: "Transportation", interval: "monthly", currency: "THB" },
    { amount: 4000, description: "Groceries", category: "Food", interval: "weekly", currency: "THB" },
    { amount: 12.99, description: "Streaming Service", category: "Entertainment", interval: "monthly", currency: "USD" },
    { amount: 5000, description: "Savings", category: "Saving", interval: "monthly", currency: "THB" },
  ];
  
  // Generate recurring expenses
  recurringExpenses.forEach(({ amount, description, category, interval, currency }) => {
    if (interval === "monthly") {
      for (let i = 0; i <= 3; i++) {
        const date = subMonths(currentDate, i);
        // Add a random stop date for some recurring expenses
        const stopDate = i === 0 && Math.random() > 0.7 
          ? addDays(currentDate, Math.floor(Math.random() * 90) + 30) 
          : undefined;
          
        expenses.push({
          id: crypto.randomUUID(),
          amount,
          description,
          date,
          category,
          isRecurring: true,
          recurrenceInterval: interval,
          stopDate,
          currency
        });
      }
    } else if (interval === "weekly") {
      for (let i = 0; i <= 12; i++) {
        const date = subDays(currentDate, i * 7);
        if (date >= startDate) {
          const stopDate = i === 0 && Math.random() > 0.7 
            ? addDays(currentDate, Math.floor(Math.random() * 90) + 30) 
            : undefined;
            
          expenses.push({
            id: crypto.randomUUID(),
            amount,
            description,
            date,
            category,
            isRecurring: true,
            recurrenceInterval: interval,
            stopDate,
            currency
          });
        }
      }
    }
  });
  
  // Generate random one-time expenses
  const oneTimeExpenseCount = count - expenses.length;
  for (let i = 0; i < oneTimeExpenseCount; i++) {
    const randomDays = Math.floor(Math.random() * 90); // Random day in the last 3 months
    const date = subDays(currentDate, randomDays);
    
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    let amount: number;
    
    // Randomly assign a currency with THB being more common
    const currencyRandom = Math.random();
    const currency: Currency = currencyRandom < 0.7 ? "THB" : (currencyRandom < 0.85 ? "USD" : "EUR");
    
    // Adjust amount ranges based on category and currency for more realistic data
    switch (category) {
      case "Entertainment":
        amount = Math.floor(Math.random() * 100) + 10;
        break;
      case "Food":
        amount = Math.floor(Math.random() * 80) + 5;
        break;
      case "Transportation":
        amount = Math.floor(Math.random() * 60) + 10;
        break;
      case "Personal":
        amount = Math.floor(Math.random() * 150) + 20;
        break;
      default:
        amount = Math.floor(Math.random() * 200) + 10;
    }
    
    // Apply currency conversion for more realistic amounts
    if (currency === "THB") {
      amount = Math.round(amount * 35); // THB values are higher
    } else if (currency === "EUR") {
      amount = Math.round(amount * 0.9); // EUR slightly lower than USD
    }
    
    // Round to 2 decimal places
    amount = Math.round(amount * 100) / 100;
    
    const descriptions = [
      "Coffee shop", "Dinner", "Clothes", "Movie", "Books",
      "Gadget", "Gift", "Home decor", "Pharmacy", "Hardware store",
      "Take-out", "Concert tickets", "Haircut", "Gym", "Taxi",
      "App subscription", "Birthday gift", "Parking", "Snacks", "Museum entry"
    ];
    
    expenses.push({
      id: crypto.randomUUID(),
      amount,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      date,
      category,
      isRecurring: false,
      currency
    });
  }
  
  return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
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

// Function to seed database with mock data
export const seedDatabaseWithMockData = async (expenses: Expense[]) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  // Transform expenses to DB format
  const dbExpenses = expenses.map(expense => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    date: expense.date.toISOString().split('T')[0],
    category: expense.category,
    is_recurring: expense.isRecurring,
    recurrence_interval: expense.recurrenceInterval,
    stop_date: expense.stopDate ? expense.stopDate.toISOString().split('T')[0] : null,
    currency: expense.currency
  }));
  
  // Insert in batches to avoid potential payload size issues
  const batchSize = 50;
  for (let i = 0; i < dbExpenses.length; i += batchSize) {
    const batch = dbExpenses.slice(i, i + batchSize);
    const { error } = await supabase.from('expenses').insert(batch);
    if (error) {
      console.error('Error seeding database:', error);
      break;
    }
  }
};
