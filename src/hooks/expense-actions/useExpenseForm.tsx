
import { useState } from 'react';
import { Expense, Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/ExpenseForm';

export function useExpenseForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return {
    isFormOpen,
    setIsFormOpen,
    handleCloseForm
  };
}
