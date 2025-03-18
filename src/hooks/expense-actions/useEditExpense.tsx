
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface UseEditExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  onAfterAction?: () => void;
}

export function useEditExpense({ expenses, setExpenses, onAfterAction }: UseEditExpenseProps) {
  const handleEditExpense = async (updatedExpense: Expense) => {
    try {
      const { error } = await supabase.from('expenses').update({
        description: updatedExpense.description,
        amount: updatedExpense.amount,
        date: updatedExpense.date instanceof Date ? updatedExpense.date.toISOString() : updatedExpense.date,
        category: updatedExpense.category,
        category_id: updatedExpense.categoryId,
        is_recurring: updatedExpense.isRecurring,
        recurrence_interval: updatedExpense.recurrenceInterval,
        stop_date: updatedExpense.stopDate instanceof Date ? updatedExpense.stopDate.toISOString() : updatedExpense.stopDate,
        currency: updatedExpense.currency,
        receipt_image: updatedExpense.receiptImage,
        receipt_thumbnail: updatedExpense.receiptThumbnail
      }).eq('id', updatedExpense.id);

      if (error) {
        throw error;
      }
      
      // Update expenses array with optimistic UI update
      const updatedExpenses = expenses.map(exp => 
        exp.id === updatedExpense.id ? updatedExpense : exp
      );
      
      setExpenses(updatedExpenses);
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
      
      // Call refresh callback if provided
      if (onAfterAction) {
        onAfterAction();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleEditExpense };
}
