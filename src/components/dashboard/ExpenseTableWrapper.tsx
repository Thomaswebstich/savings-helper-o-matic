
import { Expense, Category } from '@/lib/data';
import { ExpenseTable } from '@/components/expense-table';
import { Separator } from '@/components/ui/separator';

interface ExpenseTableWrapperProps {
  expenses: Expense[];
  categories: Category[];
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  monthlyIncome?: number;
  incomeSources?: any[];
}

export function ExpenseTableWrapper({
  expenses,
  categories,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  monthlyIncome,
  incomeSources = []
}: ExpenseTableWrapperProps) {
  console.log('ExpenseTableWrapper received income sources:', incomeSources);
  
  return (
    <div className="mt-5">
      <h2 className="font-semibold text-lg mb-3">Transaction History</h2>
      <Separator className="mb-3" />
      <ExpenseTable
        expenses={expenses}
        categories={categories}
        onAddExpense={onAddExpense}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
        monthlyIncome={monthlyIncome}
        incomeSources={incomeSources}
      />
    </div>
  );
}
