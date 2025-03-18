
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

interface UseDeleteExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export function useDeleteExpense({ expenses, setExpenses }: UseDeleteExpenseProps) {
  const handleDeleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense from database, but it's removed from your current session",
        variant: "destructive"
      });
    }
  };

  return { handleDeleteExpense };
}
