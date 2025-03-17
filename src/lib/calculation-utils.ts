import { Expense, IncomeSource, Currency } from './types';
import { format, getMonth, getYear } from 'date-fns';

// Function to calculate the total expenses for a given month
export function calculateMonthlyExpenses(expenses: Expense[], year: number, month: number): number {
  return expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
      return total + expense.amount;
    }
    return total;
  }, 0);
}

// Function to calculate the total income for a given month from multiple income sources
export function calculateMonthlyIncome(incomeSources: IncomeSource[], year: number, month: number): number {
  return incomeSources.reduce((total, income) => {
    // Skip inactive income sources
    if (income.endDate && getYear(new Date(income.endDate)) < year ||
        (getYear(new Date(income.endDate)) === year && getMonth(new Date(income.endDate)) < month)) {
      return total;
    }
    if (income.startDate && getYear(new Date(income.startDate)) > year ||
        (getYear(new Date(income.startDate)) === year && getMonth(new Date(income.startDate)) > month)) {
      return total;
    }

    // Calculate pro-rated amount for first month if needed
    if (income.startDate) {
      const startDate = new Date(income.startDate);
      if (startDate.getMonth() === month && startDate.getFullYear() === year) {
        // Pro-rate for partial first month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysActive = daysInMonth - startDate.getDate() + 1;
        return total + (income.amount * daysActive / daysInMonth);
      }
    }

    // Regular full month
    return total + income.amount;
  }, 0);
}

// Function to generate a list of months for a given range
export function generateMonthList(monthsBack: number, monthsForward: number): { year: number; month: number; label: string }[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthList: { year: number; month: number; label: string }[] = [];

  for (let i = -monthsBack; i <= monthsForward; i++) {
    let year = currentYear;
    let month = currentMonth + i;

    if (month < 0) {
      year = currentYear - 1;
      month = 12 + month;
    } else if (month > 11) {
      year = currentYear + 1;
      month = month % 12;
    }

    const date = new Date(year, month, 1);
    const label = format(date, 'MMMM yyyy');
    monthList.push({ year, month, label });
  }

  return monthList;
}

// Function to calculate monthly totals for expenses and income
export function calculateMonthlyTotals(expenses: Expense[], incomeSources: IncomeSource[], monthsBack: number, monthsForward: number) {
  const monthList = generateMonthList(monthsBack, monthsForward);
  return monthList.map(({ year, month, label }) => {
    const monthlyExpenses = calculateMonthlyExpenses(expenses, year, month);
    const monthlyIncome = calculateMonthlyIncome(incomeSources, year, month);
    const savings = monthlyIncome - monthlyExpenses;

    return {
      month: label,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      savings: savings,
    };
  });
}

// Function to convert currency using a simple conversion rate (THB to target currency)
export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const conversionRates: { [key in Currency]: number } = {
    THB: 1,
    USD: 0.029,
    EUR: 0.026,
    GBP: 0.023,
    JPY: 4.2
  };

  const thbAmount = amount / conversionRates[fromCurrency];
  return thbAmount * conversionRates[toCurrency];
}

// Calculate month's income for a specific date
export function calculateMonthIncomeForDate(incomeSources: any[], date: Date): number {
  if (!incomeSources || incomeSources.length === 0) return 0;
  
  const dateMonth = date.getMonth();
  const dateYear = date.getFullYear();
  
  return incomeSources.reduce((total, income) => {
    // Skip inactive income sources
    if (income.endDate && new Date(income.endDate) < date) return total;
    if (income.startDate && new Date(income.startDate) > date) return total;
    
    // Calculate pro-rated amount for first month if needed
    if (income.startDate) {
      const startDate = new Date(income.startDate);
      if (startDate.getMonth() === dateMonth && 
          startDate.getFullYear() === dateYear) {
        // Pro-rate for partial first month
        const daysInMonth = new Date(dateYear, dateMonth + 1, 0).getDate();
        const daysActive = daysInMonth - startDate.getDate() + 1;
        return total + (income.amount * daysActive / daysInMonth);
      }
    }
    
    // Regular full month
    return total + income.amount;
  }, 0);
}

// Function to prepare expense hotspot data for charts
export function prepareExpenseHotspots(expenses: any[], monthlyData: any[]) {
  if (!expenses || expenses.length === 0 || !monthlyData || monthlyData.length === 0) {
    return [];
  }

  // Get the date range from monthly data
  const startDate = new Date(monthlyData[0].month.replace(' ', ' 1, '));
  const endDate = new Date(monthlyData[monthlyData.length - 1].month.replace(' ', ' 1, '));
  endDate.setMonth(endDate.getMonth() + 1, 0); // End of the last month
  
  // Filter expenses within the time range and sort by date
  const relevantExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate position and other properties for each expense
  const timeRange = endDate.getTime() - startDate.getTime();
  
  return relevantExpenses.map(expense => {
    const expenseDate = new Date(expense.date);
    const position = (expenseDate.getTime() - startDate.getTime()) / timeRange;
    
    // Find which month this expense belongs to
    const monthIndex = monthlyData.findIndex(month => {
      const [monthName, yearStr] = month.month.split(' ');
      const monthDate = new Date(`${monthName} 1, ${yearStr}`);
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      return expenseDate >= monthDate && expenseDate < nextMonth;
    });
    
    return {
      id: expense.id,
      date: expenseDate,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      categoryId: expense.categoryId,
      position,
      monthIndex: monthIndex >= 0 ? monthIndex : null,
    };
  });
}
