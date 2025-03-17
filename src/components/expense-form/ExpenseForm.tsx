
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExpenseFormValues, formSchema } from './types';
import { Expense, Category } from '@/lib/data';
import { useEffect } from 'react';
import { BasicDetailsFields } from './BasicDetailsFields';
import { RecurringExpenseFields } from './RecurringExpenseFields';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues) => void;
  initialValues?: Expense | null;
  categories: Category[];
}

export function ExpenseForm({ open, onClose, onSubmit, initialValues, categories }: ExpenseFormProps) {
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
  }, [initialValues, form, open]);
  
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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="md:max-w-xl w-full overflow-y-auto sm:max-h-[90vh] mx-auto inset-0 h-auto mt-16 mb-16 rounded-t-lg sm:rounded-lg">
        <SheetHeader className="pb-4">
          <SheetTitle>{initialValues ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
          <SheetDescription>
            {initialValues 
              ? 'Update the expense details below.' 
              : 'Enter the details of your expense.'}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicDetailsFields form={form} categories={categories} />
            
            <RecurringExpenseFields form={form} />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialValues ? 'Update' : 'Add'} Expense
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
