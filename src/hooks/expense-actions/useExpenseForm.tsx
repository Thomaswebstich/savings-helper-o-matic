
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Expense } from '@/lib/data';
import { ExpenseFormValues, formSchema } from '@/components/expense-form/types';

interface UseExpenseFormProps {
  initialValues?: Expense | null;
  onSubmit: (data: ExpenseFormValues) => void;
  onClose: () => void;
}

export function useExpenseForm({ initialValues, onSubmit, onClose }: UseExpenseFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
      isRecurring: false,
      currency: 'THB'
    }
  });
  
  // Reset form when initial values change or when modal opens/closes
  useEffect(() => {
    if (initialValues) {
      console.log("Setting form values with:", initialValues);
      
      // Ensure all dates are proper Date objects and adjust for timezone
      const expenseDate = new Date(initialValues.date);
      // Set to noon to avoid timezone issues
      expenseDate.setHours(12, 0, 0, 0);
      
      let stopDate = undefined;
      if (initialValues.stopDate) {
        stopDate = new Date(initialValues.stopDate);
        stopDate.setHours(12, 0, 0, 0);
      }
      
      console.log("Prepared date:", expenseDate);
      console.log("Prepared stop date:", stopDate);
      console.log("Using category value:", initialValues.categoryId);
      
      // Reset the form with prepared values
      form.reset({
        description: initialValues.description,
        amount: initialValues.amount,
        date: expenseDate,
        category: initialValues.categoryId,
        isRecurring: initialValues.isRecurring || false,
        recurrenceInterval: initialValues.recurrenceInterval,
        stopDate: stopDate,
        currency: initialValues.currency || 'THB'
      });
    } else {
      // Reset to defaults if no initial values
      form.reset({
        description: '',
        amount: 0,
        date: new Date(),
        category: '',
        isRecurring: false,
        currency: 'THB'
      });
    }
  }, [initialValues, form]);
  
  // Handle form submission
  const handleSubmit = (values: ExpenseFormValues) => {
    console.log("Form submitting with values:", values);
    
    // Ensure dates are properly formatted with fixed time
    const submissionDate = new Date(values.date);
    submissionDate.setHours(12, 0, 0, 0);
    
    let submissionStopDate = undefined;
    if (values.stopDate) {
      submissionStopDate = new Date(values.stopDate);
      submissionStopDate.setHours(12, 0, 0, 0);
    }
    
    const submissionValues: ExpenseFormValues = {
      ...values,
      date: submissionDate,
      stopDate: submissionStopDate
    };
    
    console.log("Formatted submission values:", submissionValues);
    onSubmit(submissionValues);
    onClose();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    onClose();
  };

  return {
    isFormOpen,
    setIsFormOpen,
    handleCloseForm,
    form,
    handleSubmit
  };
}
