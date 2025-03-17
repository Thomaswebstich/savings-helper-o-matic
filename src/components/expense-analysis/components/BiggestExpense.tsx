
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';
import { CategoryBadge } from '@/components/CategoryBadge';

interface BiggestExpenseProps {
  expense: Expense | null;
  currency: Currency;
}

export function BiggestExpense({ expense, currency }: BiggestExpenseProps) {
  if (!expense) return null;
  
  return (
    <div>
      <div className="text-xs text-muted-foreground">Biggest expense</div>
      <div className="font-medium">
        {formatCurrency(convertCurrency(expense.amount, expense.currency || "THB", currency), currency)}
      </div>
      <div className="text-sm flex items-center gap-1">
        <span>{expense.description}</span>
        <CategoryBadge 
          category={expense.category || 'Other'} 
          className="text-xs py-0 px-1"
        />
      </div>
    </div>
  );
}
