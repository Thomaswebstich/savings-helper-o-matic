
import { Currency } from './currency';

export type IncomeSource = {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
};
