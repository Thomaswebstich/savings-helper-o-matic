
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ExpenseFormValues } from './types';
import { Expense, Category } from '@/lib/data';
import { BasicDetailsFields } from './BasicDetailsFields';
import { RecurringExpenseFields } from './RecurringExpenseFields';
import { useExpenseForm } from '@/hooks/expense-actions/useExpenseForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseImageUpload } from '../expense-image-upload/ExpenseImageUpload';
import { useState } from 'react';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues) => void;
  initialValues?: Expense | null;
  categories: Category[];
}

export function ExpenseForm({ open, onClose, onSubmit, initialValues, categories }: ExpenseFormProps) {
  const [activeTab, setActiveTab] = useState<string>("manual");
  
  // Use our custom hook for form logic
  const { form, handleSubmit } = useExpenseForm({
    initialValues,
    onSubmit,
    onClose
  });

  const handleExpenseRecognized = (recognizedData: ExpenseFormValues) => {
    // Update the form values with the recognized data
    form.reset({
      ...recognizedData,
      // Leave the category as is since it should already be mapped to a valid category ID
      // If it's not valid, it will be empty and the user can select it
    });
    
    // Switch to the manual tab to let the user review and adjust
    setActiveTab("manual");
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="md:max-w-xl w-full overflow-y-auto sm:max-h-[90vh] mx-auto inset-0 h-auto mt-16 mb-16 rounded-t-lg sm:rounded-lg">
        <SheetHeader className="pb-4">
          <SheetTitle>{initialValues ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
          <SheetDescription>
            {initialValues 
              ? 'Update the expense details below.' 
              : 'Enter the details of your expense or upload a receipt image.'}
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="image">Upload Receipt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
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
          </TabsContent>
          
          <TabsContent value="image">
            <div className="space-y-4">
              <ExpenseImageUpload 
                onExpenseRecognized={handleExpenseRecognized}
                categories={categories}
                disabled={!!initialValues}
              />
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>Upload a photo of your receipt to automatically extract expense details.</p>
                <p className="mt-1">We'll try to identify the amount, date, description, and category.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
