
import { Expense, formatCurrency, Currency } from '@/lib/data';

interface SpendingAveragesProps {
  daily: number;
  weekly: number;
  monthly: number;
  currency: Currency;
}

export function SpendingAverages({ 
  daily, 
  weekly, 
  monthly, 
  currency 
}: SpendingAveragesProps) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Daily avg</span>
        <span className="font-medium">{formatCurrency(daily, currency)}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Weekly avg</span>
        <span className="font-medium">{formatCurrency(weekly, currency)}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Monthly avg</span>
        <span className="font-medium">{formatCurrency(monthly, currency)}</span>
      </div>
    </div>
  );
}
