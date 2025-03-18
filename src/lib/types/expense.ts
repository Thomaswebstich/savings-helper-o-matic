
import { Currency } from './currency';

export type Expense = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  category?: string; // For backward compatibility
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  stopDate?: Date;
  currency: Currency;
  isProjection?: boolean; // Flag to identify projected recurring expenses
  receiptImage?: string; // URL for the full-size receipt image
  receiptThumbnail?: string; // Thumbnail URL for the receipt image
};
