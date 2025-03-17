
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpenseProjectionToggleProps {
  showProjections: boolean;
  toggleProjections: () => void;
}

export function ExpenseProjectionToggle({
  showProjections,
  toggleProjections
}: ExpenseProjectionToggleProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-9"
      onClick={toggleProjections}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${showProjections ? 'text-primary' : 'text-muted-foreground'}`} />
      {showProjections ? 'Hide Projections' : 'Show Projections'}
    </Button>
  );
}
