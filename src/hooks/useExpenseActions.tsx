
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, Category, Currency } from '@/lib/data';
import { ExpenseFormValues } from '@/components/ExpenseForm';
import { toast } from '@/hooks/use-toast';

interface UseExpenseActionsProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories: Category[];
}

export function useExpenseActions({ expenses, setExpenses, categories }: UseExpenseActionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);

  const handleAddExpense = async (data: ExpenseFormValues) => {
    console.log("Adding new expense with form data:", data);
    
    const categoryId = data.category;
    
    let categoryName = '';
    if (categoryId) {
      const foundCategory = categories.find(c => c.id === categoryId);
      if (foundCategory) {
        categoryName = foundCategory.name;
        console.log(`Found category: ${categoryName} for ID: ${categoryId}`);
      } else {
        console.warn(`Could not find category with ID: ${categoryId}`);
      }
    }
    
    const expenseDate = new Date(data.date);
    expenseDate.setHours(12, 0, 0, 0);
    
    let stopDate = undefined;
    if (data.stopDate) {
      stopDate = new Date(data.stopDate);
      stopDate.setHours(12, 0, 0, 0);
    }
    
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...data,
      date: expenseDate,
      stopDate: stopDate,
      categoryId: categoryId
    };
    
    console.log("Created new expense object:", newExpense);
    
    setExpenses(prev => [newExpense, ...prev]);
    
    try {
      const formattedDate = expenseDate.toISOString().split('T')[0];
      const formattedStopDate = stopDate ? stopDate.toISOString().split('T')[0] : null;
      
      console.log("Formatted date for DB:", formattedDate);
      console.log("Formatted stop date for DB:", formattedStopDate);
      
      const { data: dbData, error } = await supabase
        .from('expenses')
        .insert({
          description: newExpense.description,
          amount: newExpense.amount,
          date: formattedDate,
          category: categoryName,
          category_id: categoryId,
          is_recurring: newExpense.isRecurring,
          recurrence_interval: newExpense.recurrenceInterval,
          stop_date: formattedStopDate,
          currency: newExpense.currency
        });
        
      if (error) {
        console.error('Error details from Supabase:', error);
        throw error;
      }
      
      console.log("Successfully added expense to database:", dbData);
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense to database, but it's available in your current session",
        variant: "destructive"
      });
    }
  };
  
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
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (data: ExpenseFormValues) => {
    console.log("Form submitted with data:", data);
    
    if (currentExpense) {
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
      
      setCurrentExpense(null);
    } else {
      handleAddExpense(data);
    }
  };
  
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
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentExpense(null);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    currentExpense,
    setCurrentExpense,
    handleAddExpense,
    handleEditExpense,
    handleFormSubmit,
    handleDeleteExpense,
    handleCloseForm
  };
}
