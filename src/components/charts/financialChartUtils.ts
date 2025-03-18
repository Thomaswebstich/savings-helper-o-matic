
import { Currency, MonthlyTotal, CategoryTotal } from '@/lib/data';
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
      color: '#94a3b8',
      count: convertedCategoryData.slice(5).reduce((sum, category) => sum + category.count, 0), // Add the count property
      displayOrder: 999 // Add a high display order for "Other" category
    });
  }
  
  return pieData;
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
