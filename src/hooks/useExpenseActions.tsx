
import { useState } from 'react';
import { Expense } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { useAddExpense } from './expense-actions/useAddExpense';
import { useEditExpense } from './expense-actions/useEditExpense';
import { useDeleteExpense } from './expense-actions/useDeleteExpense';
import { useExpenseForm } from './expense-actions/useExpenseForm';

interface UseExpenseActionsProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories: any[];
  onAfterAction?: () => void;
}

export function useExpenseActions({ 
  expenses, 
  setExpenses, 
  categories,
  onAfterAction
}: UseExpenseActionsProps) {
  const { 
    isFormOpen, 
    setIsFormOpen, 
    currentExpense, 
    setCurrentExpense,
    resetForm
  } = useExpenseForm();
  
  const { handleAddExpense } = useAddExpense({ 
    expenses, 
    setExpenses,
    onAfterAction
  });
  
  const { handleEditExpense: editExpense } = useEditExpense({ 
    expenses, 
    setExpenses,
    onAfterAction
  });
  
  const { handleDeleteExpense } = useDeleteExpense({ 
    expenses, 
    setExpenses 
  });
  
  const openAddExpenseForm = () => {
    console.info("Opening add expense form");
    resetForm();
    setIsFormOpen(true);
  };
  
  const handleEditExpense = (expense: Expense) => {
    console.info("Opening edit expense form", expense);
    setCurrentExpense(expense);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (values: ExpenseFormValues) => {
    // Map form values to Expense type
    const expense: Expense = {
      id: currentExpense?.id || crypto.randomUUID(),
      description: values.description,
      amount: values.amount,
      date: values.date,
      categoryId: values.categoryId,
      category: categories.find(cat => cat.id === values.categoryId)?.name || '',
      isRecurring: values.isRecurring,
      recurrenceInterval: values.recurrenceInterval,
      stopDate: values.stopDate,
      currency: values.currency,
      receiptImage: values.receiptImage,
      receiptThumbnail: values.receiptThumbnail
    };
    
    if (currentExpense) {
      // Edit existing expense
      await editExpense({
        ...currentExpense,
        ...expense
      });
    } else {
      // Add new expense
      await handleAddExpense(expense);
    }
    
    setIsFormOpen(false);
    resetForm();
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };
  
  const addExpenseFromReceipt = (expense: Expense) => {
    return handleAddExpense(expense);
  };
  
  return {
    isFormOpen,
    setIsFormOpen,
    currentExpense,
    handleEditExpense,
    handleFormSubmit,
    handleDeleteExpense,
    handleCloseForm,
    addExpenseFromReceipt,
    openAddExpenseForm
  };
}
