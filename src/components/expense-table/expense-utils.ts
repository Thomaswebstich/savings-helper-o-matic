
import { Expense } from '@/lib/data';
import { 
  addDays,
  addMonths,
  addWeeks,
  isBefore,
  isSameDay
} from 'date-fns';

/**
 * Generates projected expenses based on recurring expenses
 */
export function generateProjectedExpenses(expenses: Expense[]): Expense[] {
  const recurringExpenses = expenses.filter(expense => expense.isRecurring);
  const projections: Expense[] = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  // Project for 12 months forward
  const maxProjectionDate = addMonths(today, 12);
  
  recurringExpenses.forEach(expense => {
    const startDate = new Date(expense.date);
    startDate.setHours(12, 0, 0, 0);
    
    // Don't project if the start date is in the future
    if (isBefore(today, startDate)) {
      return;
    }
    
    // Define the end date for projections
    const endDate = expense.stopDate 
      ? new Date(expense.stopDate) 
      : maxProjectionDate;
      
    if (isBefore(endDate, today)) {
      return; // Already ended
    }
    
    // Create projections based on recurrence interval
    let currentDate = new Date(startDate);
    
    // Skip all occurrences before today
    while (isBefore(currentDate, today) && !isSameDay(currentDate, today)) {
      switch (expense.recurrenceInterval) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'yearly':
          currentDate = addMonths(currentDate, 12);
          break;
        default:
          currentDate = addMonths(currentDate, 1); // Default to monthly
      }
    }
    
    // Skip the actual expense's date to avoid duplication
    if (isSameDay(currentDate, startDate)) {
      switch (expense.recurrenceInterval) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'yearly':
          currentDate = addMonths(currentDate, 12);
          break;
        default:
          currentDate = addMonths(currentDate, 1);
      }
    }
    
    // Generate future projections
    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
      // Create projected expense
      const projectedExpense: Expense = {
        ...expense,
        id: `${expense.id}-projection-${format(currentDate, 'yyyy-MM-dd')}`,
        date: new Date(currentDate),
        isProjection: true // Add this flag to identify projections
      };
      
      projections.push(projectedExpense);
      
      // Move to next occurrence
      switch (expense.recurrenceInterval) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'yearly':
          currentDate = addMonths(currentDate, 12);
          break;
        default:
          currentDate = addMonths(currentDate, 1);
      }
      
      // Safety check to prevent infinite loops
      if (isSameDay(currentDate, projectedExpense.date)) {
        break;
      }
    }
  });
  
  return projections;
}

// Format date string for consistent keys
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format month for consistent keys
export function formatMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

import { format } from 'date-fns';
