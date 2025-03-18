
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
            if (typeof onAddExpense === 'function') {
              // Check if onAddExpense accepts an expense parameter
              if (onAddExpense.length > 0) {
                (onAddExpense as (expense: Expense) => void)(expense);
              } else {
                // If it doesn't accept parameters, we can't use it for direct expense adding
                console.error("onAddExpense function doesn't accept parameters");
              }
            }
          }}
          className="mb-4"
        />
      )}
      
      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        categories={categories}
        onAddExpense={typeof onAddExpense === 'function' && (() => {
          if (onAddExpense.length === 0) {
            (onAddExpense as () => void)();
          } else {
            // For add expense button we need to call it without parameters
            (onAddExpense as any)();
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
