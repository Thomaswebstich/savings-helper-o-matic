
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

interface IncomeSummaryProps {
  totalMonthlyIncome: number;
  onAddClick: () => void;
}

export function IncomeSummary({ totalMonthlyIncome, onAddClick }: IncomeSummaryProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">Income Sources</h3>
        <p className="text-sm text-muted-foreground">
          Total Monthly Income: {formatCurrency(totalMonthlyIncome)}
        </p>
      </div>
      <Button size="sm" onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-1" /> Add Income
      </Button>
    </div>
  );
}
