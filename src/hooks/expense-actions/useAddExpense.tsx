
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface UseAddExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  onAfterAction?: () => void;
}

export function useAddExpense({ expenses, setExpenses, onAfterAction }: UseAddExpenseProps) {
  const handleAddExpense = async (newExpense: Expense) => {
    try {
      // Find the category name if not already included
      const categoryName = newExpense.category || '';
      
      // Update the UI first (optimistic update)
      setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
      
      const { error } = await supabase.from('expenses').insert({
        description: newExpense.description,
        amount: newExpense.amount,
        date: newExpense.date instanceof Date ? newExpense.date.toISOString() : newExpense.date,
        category: categoryName, // Ensure category field is populated
        category_id: newExpense.categoryId,
        is_recurring: newExpense.isRecurring,
        recurrence_interval: newExpense.recurrenceInterval,
        stop_date: newExpense.stopDate instanceof Date ? newExpense.stopDate.toISOString() : newExpense.stopDate,
        currency: newExpense.currency,
        receipt_image: newExpense.receiptImage,
        receipt_thumbnail: newExpense.receiptThumbnail
      });

      if (error) {
        console.error('Error adding expense:', error);
        // Revert optimistic update on error
        setExpenses(prevExpenses => prevExpenses.filter(e => e.id !== newExpense.id));
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      
      // Call refresh callback if provided
      if (onAfterAction) {
        onAfterAction();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleAddExpense };
}
