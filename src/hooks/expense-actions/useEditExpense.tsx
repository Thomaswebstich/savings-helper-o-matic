
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, Category, Currency } from '@/lib/data';
import { ExpenseFormValues } from '@/components/ExpenseForm';
import { toast } from '@/hooks/use-toast';

interface UseEditExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories: Category[];
}

export function useEditExpense({ expenses, setExpenses, categories }: UseEditExpenseProps) {
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  
  const handleEditExpense = (expense: Expense) => {
    console.log("Editing expense:", expense);
    
    const preparedExpense: Expense = {
      ...expense,
      date: expense.date instanceof Date ? expense.date : new Date(expense.date),
      stopDate: expense.stopDate ? 
        (expense.stopDate instanceof Date ? expense.stopDate : new Date(expense.stopDate)) 
        : undefined
    };
    
    preparedExpense.date.setHours(12, 0, 0, 0);
    if (preparedExpense.stopDate) {
      preparedExpense.stopDate.setHours(12, 0, 0, 0);
    }
    
    setCurrentExpense(preparedExpense);
  };
  
  const handleUpdateExpense = async (data: ExpenseFormValues) => {
    if (!currentExpense) return;
    
    let categoryName = '';
    const foundCategory = categories.find(c => c.id === data.category);
    if (foundCategory) {
      categoryName = foundCategory.name;
    }
    
    console.log("Updating expense with categoryId:", data.category, "and name:", categoryName);
    
    const updatedDate = new Date(data.date);
    updatedDate.setHours(12, 0, 0, 0);
    
    let updatedStopDate = undefined;
    if (data.stopDate) {
      updatedStopDate = new Date(data.stopDate);
      updatedStopDate.setHours(12, 0, 0, 0);
    }
    
    const updatedExpense: Expense = { 
      ...currentExpense, 
      description: data.description,
      amount: data.amount,
      date: updatedDate,
      categoryId: data.category,
      category: categoryName,
      isRecurring: data.isRecurring,
      recurrenceInterval: data.recurrenceInterval,
      stopDate: updatedStopDate,
      currency: data.currency
    };
    
    console.log("Final updated expense object:", updatedExpense);
    
    setExpenses(prev => 
      prev.map(exp => 
        exp.id === currentExpense.id 
          ? updatedExpense 
          : exp
      )
    );
    
    try {
      const formattedDate = updatedDate.toISOString().split('T')[0];
      const formattedStopDate = updatedStopDate ? updatedStopDate.toISOString().split('T')[0] : null;
      
      console.log("Formatted date for DB update:", formattedDate);
      console.log("Formatted stop date for DB update:", formattedStopDate);
      
      const { error } = await supabase
        .from('expenses')
        .update({
          description: data.description,
          amount: data.amount,
          date: formattedDate,
          category: categoryName,
          category_id: data.category,
          is_recurring: data.isRecurring,
          recurrence_interval: data.recurrenceInterval,
          stop_date: formattedStopDate,
          currency: data.currency
        })
        .eq('id', currentExpense.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense in database, but it's updated in your current session",
        variant: "destructive"
      });
    }
  };

  return { 
    currentExpense, 
    setCurrentExpense, 
    handleEditExpense, 
    handleUpdateExpense 
  };
}
