
import { Expense, Category } from '@/lib/data';
import { ExpenseTable } from '@/components/expense-table';
import { Separator } from '@/components/ui/separator';
import { QuickReceiptUpload } from '@/components/dashboard/QuickReceiptUpload';

interface ExpenseTableWrapperProps {
  expenses: Expense[];
  categories: Category[];
  onAddExpense?: ((expense: Expense) => void) | (() => void);
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
  return (
    <div className="mt-5 space-y-4">
      <h2 className="font-semibold text-lg">Transaction History</h2>
      <Separator className="mb-1" />
      
      {/* Quick Receipt Upload Area */}
      {onAddExpense && (
        <QuickReceiptUpload 
          categories={categories} 
          onAddExpense={(expense) => {
            // Check if onAddExpense accepts an expense parameter
            if (typeof onAddExpense === 'function' && onAddExpense.length > 0) {
              (onAddExpense as (expense: Expense) => void)(expense);
            } else {
              // If it doesn't expect parameters, call it without arguments
              (onAddExpense as () => void)();
            }
          }}
          className="mb-4"
        />
      )}
      
      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        categories={categories}
        onAddExpense={onAddExpense && (() => {
          if (typeof onAddExpense === 'function') {
            if (onAddExpense.length === 0) {
              (onAddExpense as () => void)();
            }
          }
        })}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
        monthlyIncome={monthlyIncome}
        incomeSources={incomeSources}
      />
    </div>
  );
}
