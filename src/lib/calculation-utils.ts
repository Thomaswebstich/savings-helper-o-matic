
import { addDays, format, subMonths } from "date-fns";
import { Expense, IncomeSource, MonthlyTotal } from './types';
import { convertCurrency } from './currency-utils';
import { calculateTotalMonthlyIncome } from './income-utils';

export const calculateMonthlyTotals = (
  expenses: Expense[],
  incomeSources: IncomeSource[],
  monthsBack = 6, 
  monthsForward = 12  // Default to 12 months forward
): MonthlyTotal[] => {
  const result: MonthlyTotal[] = [];
  const currentDate = new Date();
  
  for (let i = monthsBack; i >= 0; i--) {
    const currentMonth = subMonths(currentDate, i);
    const monthStr = format(currentMonth, "MMM yyyy");
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth.getMonth() && 
             expDate.getFullYear() === currentMonth.getFullYear();
    });
    
    const totalExpenses = monthExpenses.reduce((sum, exp) => {
      const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
      return sum + amountInTHB;
    }, 0);
    
    // Calculate income taking start dates into account
    const monthlyIncome = calculateMonthIncomeForDate(incomeSources, monthStart);
    
    const savings = monthlyIncome - totalExpenses;
    
    result.push({
      month: monthStr,
      income: monthlyIncome,
      expenses: totalExpenses,
      savings: savings
    });
  }
  
  for (let i = 1; i <= monthsForward; i++) {
    const futureMonth = addDays(currentDate, i * 30);
    const monthStr = format(futureMonth, "MMM yyyy");
    const monthStart = new Date(futureMonth.getFullYear(), futureMonth.getMonth(), 1);
    const monthEnd = new Date(futureMonth.getFullYear(), futureMonth.getMonth() + 1, 0);
    
    let projectedExpenses = 0;
    
    expenses.forEach(expense => {
      if (!expense.isRecurring) return;
      
      const expenseDate = new Date(expense.date);
      const stopDate = expense.stopDate ? new Date(expense.stopDate) : null;
      
      if (stopDate && stopDate < monthStart) return;
      
      const amountInTHB = convertCurrency(expense.amount, expense.currency, "THB");
      
      switch (expense.recurrenceInterval) {
        case "daily":
          projectedExpenses += amountInTHB * 30;
          break;
          
        case "weekly":
          projectedExpenses += amountInTHB * 4.3;
          break;
          
        case "monthly":
          projectedExpenses += amountInTHB;
          break;
          
        case "yearly":
          if (expenseDate.getMonth() === futureMonth.getMonth()) {
            projectedExpenses += amountInTHB;
          }
          break;
          
        default:
          projectedExpenses += amountInTHB;
      }
    });
    
    const pastMonths = result.slice(-3);
    const avgNonRecurring = pastMonths.length > 0 
      ? pastMonths.reduce((sum, month) => {
          const recurringForMonth = expenses
            .filter(exp => 
              exp.isRecurring && 
              new Date(exp.date) <= new Date(month.month) &&
              (!exp.stopDate || new Date(exp.stopDate) >= new Date(month.month))
            )
            .reduce((total, exp) => {
              const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
              return total + amountInTHB;
            }, 0);
            
          return sum + Math.max(0, month.expenses - recurringForMonth);
        }, 0) / pastMonths.length
      : 0;
      
    projectedExpenses += avgNonRecurring;
    
    // Calculate future income taking start dates and end dates into account
    const monthlyIncome = calculateMonthIncomeForDate(incomeSources, monthStart);
    
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

// Helper function to calculate income for a specific month
function calculateMonthIncomeForDate(incomeSources: IncomeSource[], monthDate: Date): number {
  return incomeSources.reduce((total, income) => {
    // Skip if income hasn't started yet or has already ended
    const startDate = new Date(income.startDate);
    const endDate = income.endDate ? new Date(income.endDate) : null;
    
    if (startDate > monthDate || (endDate && endDate < monthDate)) {
      return total;
    }
    
    const amountInTHB = convertCurrency(income.amount, income.currency, "THB");
    
    if (income.isRecurring) {
      switch (income.recurrenceInterval) {
        case "daily":
          return total + (amountInTHB * 30);
        case "weekly":
          return total + (amountInTHB * 4.3);
        case "monthly":
          return total + amountInTHB;
        case "yearly":
          if (startDate.getMonth() === monthDate.getMonth()) {
            return total + amountInTHB;
          }
          return total;
        default:
          return total + amountInTHB; // Default to monthly
      }
    } else if (
      startDate.getMonth() === monthDate.getMonth() && 
      startDate.getFullYear() === monthDate.getFullYear()
    ) {
      // Non-recurring income only gets counted in its specific month
      return total + amountInTHB;
    }
    
    return total;
  }, 0);
}
