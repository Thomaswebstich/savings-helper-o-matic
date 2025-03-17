
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { IncomeSource, deleteIncomeSource, formatCurrency } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface IncomeDeleteDialogProps {
  open: boolean;
  income: IncomeSource | null;
  onClose: () => void;
  onDelete: (incomeId: string) => void;
}

export function IncomeDeleteDialog({ open, income, onClose, onDelete }: IncomeDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!income) return;
    
    setIsDeleting(true);
    
    try {
      await deleteIncomeSource(income.id);
      onDelete(income.id);
      
      toast({
        title: "Success",
        description: "Income source deleted successfully"
      });
      
      onClose();
    } catch (error) {
      console.error('Error deleting income source:', error);
      toast({
        title: "Error",
        description: "Failed to delete income source",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Income Source</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this income source? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {income && (
          <div className="py-4">
            <p className="mb-2">
              <strong>{income.description}</strong> - {formatCurrency(income.amount, income.currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              {income.isRecurring 
                ? `Recurring (${income.recurrenceInterval})` 
                : 'One-time'} income starting {format(income.startDate, 'PP')}
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
