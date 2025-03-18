
import { useState } from 'react';
import { Expense, Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';
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
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Use the extracted hooks
  const { handleAddExpense } = useAddExpense({ expenses, setExpenses, categories });
  const { handleEditExpense, handleUpdateExpense, setCurrentExpense: setEditExpense } = useEditExpense({ expenses, setExpenses, categories });
  const { handleDeleteExpense } = useDeleteExpense({ expenses, setExpenses });
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentExpense(null);
  };
  
  const handleFormSubmit = async (data: ExpenseFormValues) => {
    console.log("Form submitted with data:", data);
    
    if (currentExpense) {
      await handleUpdateExpense(data);
    } else {
      await handleAddExpense(data);
    }
    
    handleCloseForm();
  };

  // The main edit expense handler that opens the form and sets the current expense
  const editExpense = (expense: Expense) => {
    console.log("Edit expense called with:", expense);
    
    // First we need to set the currentExpense in this component
    setCurrentExpense(expense);
    
    // Then we need to set the currentExpense in the useEditExpense hook
    handleEditExpense(expense);
    
    // Finally open the form
    setIsFormOpen(true);
    
    console.log("Current expense after edit button click:", expense);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    currentExpense,
    setCurrentExpense,
    handleAddExpense,
    handleEditExpense: editExpense, // Use our handler that also opens the form
    handleFormSubmit,
    handleDeleteExpense,
    handleCloseForm
  };
}
