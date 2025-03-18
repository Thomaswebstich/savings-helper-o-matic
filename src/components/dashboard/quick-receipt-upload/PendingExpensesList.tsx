
import { PendingExpense } from './types';
import { PendingExpenseItem } from './PendingExpenseItem';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Category } from '@/lib/data';

interface PendingExpensesListProps {
  pendingExpenses: PendingExpense[];
  categories: Category[];
  onUpdateExpense: (id: string, field: keyof ExpenseFormValues, value: any) => void;
  onRemoveExpense: (id: string) => void;
  onApproveExpense: (expense: PendingExpense) => void;
}

export function PendingExpensesList({
  pendingExpenses,
  categories,
  onUpdateExpense,
  onRemoveExpense,
  onApproveExpense
}: PendingExpensesListProps) {
  if (pendingExpenses.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 space-y-4">
      <div className="text-sm font-medium">Pending Approval ({pendingExpenses.length})</div>
      <div className="space-y-3">
        {pendingExpenses.map((expense) => (
          <PendingExpenseItem
            key={expense.id}
            expense={expense}
            categories={categories}
            onUpdate={onUpdateExpense}
            onRemove={onRemoveExpense}
            onApprove={onApproveExpense}
          />
        ))}
      </div>
    </div>
  );
}
