
import { z } from 'zod';
import { Currency } from '@/lib/types/currency';

// Define the form values type
export type ExpenseFormValues = {
  description: string;
  amount: number;
  date: Date;
  category: string; // This is actually the categoryId
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  stopDate?: Date;
  currency: Currency;
  // Add these missing properties
  receiptImage?: string;
  receiptThumbnail?: string;
};

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
  receiptImage: z.string().optional(),
  receiptThumbnail: z.string().optional(),
});
