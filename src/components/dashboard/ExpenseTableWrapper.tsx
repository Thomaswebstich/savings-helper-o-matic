
import { Expense, Category } from '@/lib/data';
import { ExpenseTable } from '@/components/expense-table';
import { Separator } from '@/components/ui/separator';
import { QuickReceiptUpload } from '@/components/dashboard/quick-receipt-upload';

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
  // Function to handle adding an expense from receipt
  const handleReceiptAddExpense = (expense: Expense) => {
    if (typeof onAddExpense === 'function') {
      // Check if onAddExpense accepts an expense parameter
      if (onAddExpense.length > 0) {
        (onAddExpense as (expense: Expense) => void)(expense);
      } else {
        // If it doesn't accept parameters, we still want to refresh data
        // So we call it anyway, since it's probably a refresh function
        (onAddExpense as () => void)();
      }
    }
  };

  // Function to handle the add expense button click
  const handleAddExpenseClick = () => {
    if (typeof onAddExpense === 'function') {
      (onAddExpense as () => void)();
    }
  };

  return (
    <div className="mt-5 space-y-4">
      <h2 className="font-semibold text-lg">Transaction History</h2>
      <Separator className="mb-1" />
      
      {/* Quick Receipt Upload Area */}
      {onAddExpense && (
        <QuickReceiptUpload 
          categories={categories} 
          onAddExpense={handleReceiptAddExpense}
          className="mb-4"
        />
      )}
      
      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        categories={categories}
        onAddExpense={onAddExpense ? handleAddExpenseClick : undefined}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
        monthlyIncome={monthlyIncome}
        incomeSources={incomeSources}
      />
    </div>
  );
}
