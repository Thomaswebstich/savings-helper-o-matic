
export type Currency = "THB" | "USD" | "EUR";

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
};

export type MonthlyTotal = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

export type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  budget?: number;
  color: string;
};
