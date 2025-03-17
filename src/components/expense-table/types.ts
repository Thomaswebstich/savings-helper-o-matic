
import { Expense, Category } from '@/lib/data';

// Group expenses by month
export interface MonthGroup {
  month: Date;
  label: string;
  expenses: Expense[];
  total: number;
  categoryTotals: Map<string, number>;
}

export interface SortConfig {
  key: keyof Expense;
  direction: 'asc' | 'desc';
}
