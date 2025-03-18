
import { Currency } from './currency';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  displayOrder?: number;
};

export type CategoryBudget = {
  id: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  month: string; // Format: "MMM yyyy" (e.g., "Jan 2023")
};

export type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  budget?: number;
  color: string;
};
