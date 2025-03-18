
import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/data";

interface ExpenseMonthHeaderProps {
  label: string;
  total: number;
  expenseCount: number;
  isExpanded: boolean;
  income?: number;
}

export function ExpenseMonthHeader({
  label,
  total,
  expenseCount,
  isExpanded,
  income = 0
}: ExpenseMonthHeaderProps) {
  // Calculate savings
  const savings = income - total;
  const savingsPercent = income > 0 ? Math.round((savings / income) * 100) : 0;

  return (
    <div className="flex justify-between items-center p-2 hover:bg-muted/20 cursor-pointer transition-colors">
      <div className="flex items-center gap-2">
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          ({expenseCount} expense{expenseCount !== 1 ? 's' : ''})
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {income > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Savings:</span>
            <span className={`text-sm ${savings >= 0 ? 'text-green-500' : 'text-rose-500'}`}>
              {formatCurrency(savings)}
              <span className="ml-1 text-xs">
                ({savingsPercent}%)
              </span>
            </span>
          </div>
        )}
        <span className="font-medium text-right">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
