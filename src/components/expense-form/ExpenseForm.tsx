
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ExpenseFormValues } from './types';
import { Expense, Category } from '@/lib/data';
import { BasicDetailsFields } from './BasicDetailsFields';
import { RecurringExpenseFields } from './RecurringExpenseFields';
import { useExpenseForm } from '@/hooks/expense-actions/useExpenseForm';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues) => void;
  initialValues?: Expense | null;
  categories: Category[];
}

export function ExpenseForm({ open, onClose, onSubmit, initialValues, categories }: ExpenseFormProps) {
  // Use our custom hook for form logic
  const { form, handleSubmit } = useExpenseForm({
    initialValues,
    onSubmit,
    onClose
  });

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
