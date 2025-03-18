
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface UseDeleteExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export function useDeleteExpense({ expenses, setExpenses }: UseDeleteExpenseProps) {
  const handleDeleteExpense = async (id: string) => {
    // Optimistically remove from UI
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) {
        // If there's an error, rollback the UI change
        console.error('Error deleting expense:', error);
        setExpenses(expenses); // Restore original state
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleDeleteExpense };
}
