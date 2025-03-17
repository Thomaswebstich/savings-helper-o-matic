
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddExpenseClick: () => void;
}

export function EmptyState({ onAddExpenseClick }: EmptyStateProps) {
  return (
    <div className="glass-card p-6 mb-5 text-center">
      <h2 className="text-lg font-medium mb-2">No Expenses Found</h2>
      <p className="text-muted-foreground mb-4">
        Get started by adding your first expense using the "+ Add Expense" button.
      </p>
      <Button onClick={onAddExpenseClick}>
        Add Your First Expense
      </Button>
    </div>
  );
}
