
import { z } from 'zod';
import { Expense, Currency } from '@/lib/data';

// Define the form values type
export type ExpenseFormValues = Omit<Expense, 'id'>;

// Create a schema for form validation
export const formSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  amount: z.number().min(0.01, { message: 'Amount must be greater than 0' }),
  date: z.date(),
  category: z.string().min(1, { message: 'Category is required' }),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  stopDate: z.date().optional(),
  currency: z.enum(['THB', 'USD', 'EUR'] as [Currency, ...Currency[]]).default('THB'),
});
