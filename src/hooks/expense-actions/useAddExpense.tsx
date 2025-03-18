import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, Category, Currency } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { toast } from '@/hooks/use-toast';

interface UseAddExpenseProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories: Category[];
}

export function useAddExpense({ expenses, setExpenses, categories }: UseAddExpenseProps) {
  const handleAddExpense = async (data: ExpenseFormValues & { receiptImage?: string, receiptThumbnail?: string }) => {
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
      categoryId: categoryId,
      receiptImage: data.receiptImage,
      receiptThumbnail: data.receiptThumbnail
    };
    
    console.log("Created new expense object:", newExpense);
    
    setExpenses(prev => [newExpense, ...prev]);
    
    try {
      const formattedDate = expenseDate.toISOString().split('T')[0];
      const formattedStopDate = stopDate ? stopDate.toISOString().split('T')[0] : null;
      
      console.log("Formatted date for DB:", formattedDate);
      console.log("Formatted stop date for DB:", formattedStopDate);
      
      const dbExpense = {
        description: newExpense.description,
        amount: newExpense.amount,
        date: formattedDate,
        category: categoryName,
        category_id: categoryId,
        is_recurring: newExpense.isRecurring,
        recurrence_interval: newExpense.recurrenceInterval,
        stop_date: formattedStopDate,
        currency: newExpense.currency
      };
      
      console.log("Preparing to insert expense into database:", dbExpense);
      
      const { data: dbData, error } = await supabase
        .from('expenses')
        .insert(dbExpense);
        
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

  return { handleAddExpense };
}
