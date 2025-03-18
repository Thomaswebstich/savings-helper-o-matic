
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Expense } from '@/lib/data';
import { ExpenseFormValues, formSchema } from '@/components/expense-form/types';

export function useExpenseForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string;
  }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
      isRecurring: false,
      currency: 'THB',
      receiptImage: undefined,
      receiptThumbnail: undefined
    }
  });
  
  // Reset form when initial values change or when modal opens/closes
  useEffect(() => {
    if (currentExpense) {
      console.log("Setting form values with:", currentExpense);
      
      // Ensure all dates are proper Date objects and adjust for timezone
      const expenseDate = new Date(currentExpense.date);
      // Set to noon to avoid timezone issues
      expenseDate.setHours(12, 0, 0, 0);
      
      let stopDate = undefined;
      if (currentExpense.stopDate) {
        stopDate = new Date(currentExpense.stopDate);
        stopDate.setHours(12, 0, 0, 0);
      }
      
      console.log("Prepared date:", expenseDate);
      console.log("Prepared stop date:", stopDate);
      console.log("Using category value:", currentExpense.categoryId);
      
      // Reset the form with prepared values
      form.reset({
        description: currentExpense.description,
        amount: currentExpense.amount,
        date: expenseDate,
        category: currentExpense.categoryId,
        isRecurring: currentExpense.isRecurring || false,
        recurrenceInterval: currentExpense.recurrenceInterval,
        stopDate: stopDate,
        currency: currentExpense.currency || 'THB',
        receiptImage: currentExpense.receiptImage,
        receiptThumbnail: currentExpense.receiptThumbnail
      });
    }
  }, [currentExpense, form]);
  
  const resetForm = () => {
    setCurrentExpense(null);
    form.reset({
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
      isRecurring: false,
      currency: 'THB',
      receiptImage: undefined,
      receiptThumbnail: undefined
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  return {
    isFormOpen,
    setIsFormOpen,
    currentExpense,
    setCurrentExpense,
    handleCloseForm,
    form,
    resetForm
  };
}
