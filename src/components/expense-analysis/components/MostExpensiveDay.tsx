
import { formatCurrency, Currency } from '@/lib/data';
import { format } from 'date-fns';

interface MostExpensiveDayProps {
  date: Date | null;
  total: number;
  currency: Currency;
}

export function MostExpensiveDay({ date, total, currency }: MostExpensiveDayProps) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">Most expensive day</div>
      <div className="font-medium">
        {formatCurrency(total, currency)}
      </div>
      {date && (
        <div className="text-sm">
          {format(date instanceof Date ? date : new Date(date), 'MMMM d, yyyy')}
        </div>
      )}
    </div>
  );
}
