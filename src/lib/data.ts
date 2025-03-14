
import { addDays, format, subDays, subMonths } from "date-fns";

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

// Simulated income level - in a real app, this would be user-defined
export const MONTHLY_INCOME = 5000;

// Generate mock expense data for demonstration
export const generateMockExpenses = (count = 50): Expense[] => {
  const expenses: Expense[] = [];
  const currentDate = new Date();
  
  // Generate transactions from 3 months ago up to today
  const startDate = subMonths(currentDate, 3);
  
  // Generate some recurring expenses
  const recurringExpenses: Array<{amount: number, description: string, category: Category, interval: "daily" | "weekly" | "monthly" | "yearly"}> = [
    { amount: 1500, description: "Rent", category: "Housing", interval: "monthly" },
    { amount: 200, description: "Electricity", category: "Utilities", interval: "monthly" },
    { amount: 50, description: "Internet", category: "Utilities", interval: "monthly" },
    { amount: 150, description: "Phone", category: "Utilities", interval: "monthly" },
    { amount: 200, description: "Car Payment", category: "Transportation", interval: "monthly" },
    { amount: 400, description: "Groceries", category: "Food", interval: "weekly" },
    { amount: 12.99, description: "Streaming Service", category: "Entertainment", interval: "monthly" },
    { amount: 500, description: "Savings", category: "Saving", interval: "monthly" },
  ];
  
  // Generate recurring expenses
  recurringExpenses.forEach(({ amount, description, category, interval }) => {
    if (interval === "monthly") {
      for (let i = 0; i <= 3; i++) {
        const date = subMonths(currentDate, i);
        expenses.push({
          id: crypto.randomUUID(),
          amount,
          description,
          date,
          category,
          isRecurring: true,
          recurrenceInterval: interval
        });
      }
    } else if (interval === "weekly") {
      for (let i = 0; i <= 12; i++) {
        const date = subDays(currentDate, i * 7);
        if (date >= startDate) {
          expenses.push({
            id: crypto.randomUUID(),
            amount,
            description,
            date,
            category,
            isRecurring: true,
            recurrenceInterval: interval
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
    
    // Adjust amount ranges based on category for more realistic data
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
      isRecurring: false
    });
  }
  
  return expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Calculate monthly totals for the past 6 months and projected future 3 months
export const calculateMonthlyTotals = (expenses: Expense[], monthsBack = 6, monthsForward = 3): MonthlyTotal[] => {
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
    
    // Calculate total expenses for the month
    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate savings (income - expenses)
    const savings = MONTHLY_INCOME - totalExpenses;
    
    result.push({
      month: monthStr,
      income: MONTHLY_INCOME,
      expenses: totalExpenses,
      savings: savings
    });
  }
  
  // Calculate projected future months
  for (let i = 1; i <= monthsForward; i++) {
    const futureMonth = addDays(currentDate, i * 30); // Approximation
    const monthStr = format(futureMonth, "MMM yyyy");
    
    // Get recurring expenses
    const recurringExpenses = expenses.filter(exp => exp.isRecurring);
    
    // Estimate monthly expenses based on recurring expenses and average of non-recurring
    const monthlyRecurringTotal = recurringExpenses
      .filter(exp => exp.recurrenceInterval === "monthly")
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate average of weekly expenses and multiply by weeks in a month
    const weeklyRecurringExpenses = recurringExpenses
      .filter(exp => exp.recurrenceInterval === "weekly");
    const monthlyFromWeekly = weeklyRecurringExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 4;
    
    // Calculate average non-recurring expenses from past few months
    const pastMonths = result.slice(-3);
    const totalPastExpenses = pastMonths.reduce((sum, month) => sum + month.expenses, 0);
    const averageNonRecurring = (totalPastExpenses / pastMonths.length) - (monthlyRecurringTotal + monthlyFromWeekly);
    
    // Calculate total projected expenses
    const projectedExpenses = monthlyRecurringTotal + monthlyFromWeekly + averageNonRecurring;
    
    // Calculate projected savings
    const projectedSavings = MONTHLY_INCOME - projectedExpenses;
    
    result.push({
      month: monthStr,
      income: MONTHLY_INCOME,
      expenses: projectedExpenses,
      savings: projectedSavings
    });
  }
  
  return result;
};

// Calculate totals by category
export const calculateCategoryTotals = (expenses: Expense[]): CategoryTotal[] => {
  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Group by category and calculate totals
  const categoryTotals = CATEGORIES.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
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

// Format currency number to string
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};
