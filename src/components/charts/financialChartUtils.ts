
import { Currency, MonthlyTotal, CategoryTotal, Expense } from '@/lib/data';
import { CURRENCY_SYMBOLS, formatCurrency, convertCurrency } from '@/lib/data';

export const formatTooltipValue = (value: number, displayCurrency: Currency) => {
  return formatCurrency(value, displayCurrency);
};

export const convertMonthlyData = (monthlyData: MonthlyTotal[], displayCurrency: Currency) => {
  return monthlyData.map(item => ({
    ...item,
    income: convertCurrency(item.income, "THB", displayCurrency),
    expenses: convertCurrency(item.expenses, "THB", displayCurrency),
    savings: convertCurrency(item.savings, "THB", displayCurrency)
  }));
};

export const convertCategoryData = (categoryData: CategoryTotal[], displayCurrency: Currency) => {
  return categoryData.map(item => ({
    ...item,
    amount: convertCurrency(item.amount, "THB", displayCurrency),
    budget: item.budget ? convertCurrency(item.budget, "THB", displayCurrency) : undefined
  }));
};

export const preparePieData = (convertedCategoryData: CategoryTotal[]) => {
  const pieData = [...convertedCategoryData]
    .filter(category => category.amount > 0)
    .slice(0, 5);
  
  const otherAmount = convertedCategoryData
    .slice(5)
    .reduce((sum, category) => sum + category.amount, 0);
  
  if (otherAmount > 0) {
    pieData.push({
      categoryId: "Other",
      categoryName: "Other",
      amount: otherAmount,
      budget: undefined,
      percentage: convertedCategoryData
        .slice(5)
        .reduce((sum, category) => sum + category.percentage, 0),
      color: '#94a3b8'
    });
  }
  
  return pieData;
};

// Determine the position of expenses on the chart based on their date
export const getExpenseScatterData = (expenses: Expense[], monthlyData: MonthlyTotal[], displayCurrency: Currency) => {
  if (!expenses || !monthlyData || monthlyData.length === 0) return [];
  
  // Create a map of month strings to x-positions
  const monthPositions = new Map<string, number>();
  monthlyData.forEach((item, index) => {
    monthPositions.set(item.month, index);
  });
  
  // Current date to determine if an expense is in the future
  const now = new Date();
  
  // Filter and map expenses to scatter plot points
  return expenses
    .filter(expense => {
      // Get the month string in the same format as in monthlyData
      const expenseDate = new Date(expense.date);
      const monthStr = `${expenseDate.toLocaleString('en-US', { month: 'short' })} ${expenseDate.getFullYear()}`;
      
      // Only include expenses that fall within the visible months
      return monthPositions.has(monthStr);
    })
    .map(expense => {
      const expenseDate = new Date(expense.date);
      const monthStr = `${expenseDate.toLocaleString('en-US', { month: 'short' })} ${expenseDate.getFullYear()}`;
      
      // Get the x-position based on month
      const xPos = monthPositions.get(monthStr) || 0;
      
      // Find the corresponding monthly data to scale the expense properly to expenses line
      const monthData = monthlyData[xPos];
      
      // Convert currency
      const convertedAmount = convertCurrency(expense.amount, expense.currency, displayCurrency);
      
      // Calculate y position - a simple scaling based on the month's total expenses
      // Make sure dots always appear on the expenses line
      const yPos = monthData?.expenses || convertedAmount;
      
      // Check if expense is in the future
      const isFuture = expenseDate > now;
      
      return {
        x: xPos,
        y: yPos,
        value: convertedAmount,
        isFuture,
        originalExpense: {
          ...expense,
          amount: convertedAmount
        }
      };
    });
};

export const chartConfig = {
  income: {
    label: "Income",
    theme: {
      light: "#0ea5e9",
      dark: "#0ea5e9"
    }
  },
  expenses: {
    label: "Expenses",
    theme: {
      light: "#f43f5e",
      dark: "#f43f5e"
    }
  },
  savings: {
    label: "Savings",
    theme: {
      light: "#10b981",
      dark: "#10b981"
    }
  }
};
