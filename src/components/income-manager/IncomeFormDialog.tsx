
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { IncomeForm } from './IncomeForm';
import { IncomeSource, addIncomeSource, updateIncomeSource } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface IncomeFormDialogProps {
  open: boolean;
  income: IncomeSource | null;
  onClose: () => void;
  onIncomeAdd: (income: IncomeSource) => void;
  onIncomeUpdate: (income: IncomeSource) => void;
}

export function IncomeFormDialog({ 
  open, 
  income, 
  onClose, 
  onIncomeAdd, 
  onIncomeUpdate 
}: IncomeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<IncomeSource, 'id'> | null>(null);
  
  useEffect(() => {
    if (income) {
      setFormData({
        description: income.description,
        amount: income.amount,
        currency: income.currency,
        isRecurring: income.isRecurring,
        recurrenceInterval: income.recurrenceInterval || 'monthly',
        startDate: income.startDate,
        endDate: income.endDate
      });
    } else {
      setFormData(null);
    }
  }, [income, open]);

  const handleFormChange = (data: Omit<IncomeSource, 'id'>) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    if (!formData) return;
    
    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (income) {
        // Update existing income
        const updatedIncome = await updateIncomeSource(income.id, formData);
        onIncomeUpdate(updatedIncome);
        toast({ title: "Success", description: "Income source updated successfully" });
      } else {
        // Add new income
        const newIncome = await addIncomeSource(formData);
        onIncomeAdd(newIncome);
        toast({ title: "Success", description: "Income source added successfully" });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving income source:', error);
      toast({
        title: "Error",
        description: `Failed to ${income ? 'update' : 'add'} income source`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{income ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
          <DialogDescription>
            {income 
              ? 'Update this income source' 
              : 'Add a new income source to track your earnings'}
          </DialogDescription>
        </DialogHeader>
        
        {formData && (
          <IncomeForm
            initialData={formData}
            onChange={handleFormChange}
          />
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : income ? 'Update' : 'Add'} Income
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
