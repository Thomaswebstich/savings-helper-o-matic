
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
  
  const handleFormSubmit = async (data: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string;
  }) => {
    console.log("Form submitted with data:", data);
    
    if (currentExpense) {
      await handleUpdateExpense(data);
    } else {
      await handleAddExpense(data);
    }
    
    handleCloseForm();
  };

  // Handler for adding expense directly from receipt upload
  const addExpenseFromReceipt = async (expense: Expense) => {
    console.log("Adding expense from receipt:", expense);
    
    try {
      // Find category name from ID for the database entry
      const categoryId = expense.categoryId;
      let categoryName = '';
      
      if (categoryId) {
        const foundCategory = categories.find(c => c.id === categoryId);
        if (foundCategory) {
          categoryName = foundCategory.name;
        }
      }
      
      // Add to local state first
      setExpenses(prev => [expense, ...prev]);
      
      // Then add to database using the useAddExpense hook's logic
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
      const stopDate = expense.stopDate instanceof Date ? expense.stopDate : (expense.stopDate ? new Date(expense.stopDate) : undefined);
      
      // Format dates for database
      const formattedDate = expenseDate.toISOString().split('T')[0];
      const formattedStopDate = stopDate ? stopDate.toISOString().split('T')[0] : null;
      
      // Create database entry object
      const dbExpense = {
        description: expense.description,
        amount: expense.amount,
        date: formattedDate,
        category: categoryName,
        category_id: categoryId,
        is_recurring: expense.isRecurring,
        recurrence_interval: expense.recurrenceInterval,
        stop_date: formattedStopDate,
        currency: expense.currency,
        receipt_image: expense.receiptImage,
        receipt_thumbnail: expense.receiptThumbnail
      };
      
      console.log("Adding expense to database:", dbExpense);
      
      // Add to database
      const { data: dbData, error } = await supabase
        .from('expenses')
        .insert(dbExpense);
        
      if (error) {
        console.error('Error adding expense from receipt:', error);
        throw error;
      }
      
      console.log("Successfully added expense from receipt to database");
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
    } catch (error) {
      console.error('Error adding expense from receipt:', error);
      toast({
        title: "Error",
        description: "Failed to save expense to database, but it's available in your current session",
        variant: "destructive"
      });
    }
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

  // Function to open the Add Expense form (ensure this is actually called from UI)
  const openAddExpenseForm = () => {
    console.log("Opening add expense form");
    // Reset current expense to null to ensure we're in "add" mode
    setCurrentExpense(null);
    // Open the form
    setIsFormOpen(true);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    currentExpense,
    setCurrentExpense,
    handleAddExpense,
    addExpenseFromReceipt,
    handleEditExpense: editExpense, // Use our handler that also opens the form
    handleFormSubmit,
    handleDeleteExpense,
    handleCloseForm,
    openAddExpenseForm // Export the function to open the form
  };
}
