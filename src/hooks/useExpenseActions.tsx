
import { useState } from 'react';
import { Expense, Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/ExpenseForm';
import { 
  useAddExpense, 
  useEditExpense, 
  useDeleteExpense,
  useExpenseForm
} from './expense-actions';

interface UseExpenseActionsProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories: Category[];
}

export function useExpenseActions({ expenses, setExpenses, categories }: UseExpenseActionsProps) {
  // Use the extracted hooks
  const { isFormOpen, setIsFormOpen, handleCloseForm } = useExpenseForm();
  const { handleAddExpense } = useAddExpense({ expenses, setExpenses, categories });
  const { currentExpense, setCurrentExpense, handleEditExpense, handleUpdateExpense } = 
    useEditExpense({ expenses, setExpenses, categories });
  const { handleDeleteExpense } = useDeleteExpense({ expenses, setExpenses });
  
  const handleFormSubmit = async (data: ExpenseFormValues) => {
    console.log("Form submitted with data:", data);
    
    if (currentExpense) {
      await handleUpdateExpense(data);
      setCurrentExpense(null);
    } else {
      await handleAddExpense(data);
    }
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
