
import { Category, Expense } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';

export interface QuickReceiptUploadProps {
  categories: Category[];
  onAddExpense: (expense: Expense) => void;
  className?: string;
}

export interface PendingExpense extends ExpenseFormValues {
  receiptImage?: string;
  receiptThumbnail?: string;
  id?: string;
}

export interface PendingExpenseItemProps {
  expense: PendingExpense;
  categories: Category[];
  onUpdate: (id: string, field: keyof ExpenseFormValues, value: any) => void;
  onRemove: (id: string) => void;
  onApprove: (expense: PendingExpense) => void;
}
