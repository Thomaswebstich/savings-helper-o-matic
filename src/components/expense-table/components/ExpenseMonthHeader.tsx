
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

interface ExpenseMonthHeaderProps {
  label: string;
  total: number;
  expenseCount: number;
  isExpanded: boolean;
}

export function ExpenseMonthHeader({
  label,
  total,
  expenseCount,
  isExpanded
}: ExpenseMonthHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center">
        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 mr-2" /> : <ChevronRight className="h-3.5 w-3.5 mr-2" />}
        <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
        </span>
        <span className="font-medium text-sm">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
