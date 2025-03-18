
import { useState } from 'react';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Category, Expense } from '@/lib/data';
import { toast } from '@/hooks/use-toast';
import { PendingExpense } from './types';

export function useQuickReceiptUpload(
  categories: Category[],
  onAddExpense: (expense: Expense) => void
) {
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  
  const handleExpenseRecognized = (data: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string 
  }) => {
    // Add to pending expenses list with a temporary ID
    setPendingExpenses(prev => [
      ...prev, 
      { ...data, id: crypto.randomUUID() }
    ]);
    
    // Show confirmation of receipt upload
    toast({
      title: "Receipt uploaded",
      description: "Please review and approve the expense details",
    });
  };
  
  const handleApproveExpense = (expense: PendingExpense) => {
    // Find category name from the category ID
    const categoryObject = categories.find(cat => cat.id === expense.category);
    const categoryName = categoryObject?.name || "Uncategorized";
    
    // Create a new expense object from the recognized data
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      categoryId: expense.category, // This is the category ID
      category: categoryName, // Add the category name
      isRecurring: expense.isRecurring,
      recurrenceInterval: expense.recurrenceInterval,
      stopDate: expense.stopDate,
      currency: expense.currency,
      receiptImage: expense.receiptImage,
      receiptThumbnail: expense.receiptThumbnail
    };

    // Remove from pending expenses first, so we don't have UI jitter
    setPendingExpenses(prev => 
      prev.filter(item => item.id !== expense.id)
    );

    // Add the expense directly without opening the form
    onAddExpense(newExpense);
    
    // Show confirmation
    toast({
      title: "Expense added",
      description: `Added ${expense.description} (${expense.currency} ${expense.amount})`,
    });
  };
  
  const handleUpdatePendingExpense = (
    id: string,
    field: keyof ExpenseFormValues,
    value: any
  ) => {
    setPendingExpenses(prev => 
      prev.map(item => 
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };
  
  const handleRemovePendingExpense = (id: string) => {
    setPendingExpenses(prev => 
      prev.filter(item => item.id !== id)
    );
    
    toast({
      title: "Receipt removed",
      description: "The pending receipt has been removed",
    });
  };

  return {
    pendingExpenses,
    handleExpenseRecognized,
    handleApproveExpense,
    handleUpdatePendingExpense,
    handleRemovePendingExpense
  };
}
