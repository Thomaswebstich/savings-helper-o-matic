
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ExpenseFormValues } from './types';
import { Expense, Category } from '@/lib/data';
import { BasicDetailsFields } from './BasicDetailsFields';
import { RecurringExpenseFields } from './RecurringExpenseFields';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseImageUpload } from '../expense-image-upload/ExpenseImageUpload';
import { useState, useEffect } from 'react';
import { ReceiptImagePreview } from './ReceiptImagePreview';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues & { 
    receiptImage?: string;
    receiptThumbnail?: string;
  }) => void;
  initialValues?: Expense | null;
  categories: Category[];
}

export function ExpenseForm({ open, onClose, onSubmit, initialValues, categories }: ExpenseFormProps) {
  const [activeTab, setActiveTab] = useState<string>("manual");
  
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
        currency: initialValues.currency || 'THB',
        receiptImage: initialValues.receiptImage,
        receiptThumbnail: initialValues.receiptThumbnail
      });
    } else {
      // Reset to defaults if no initial values
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
    }
  }, [initialValues, form]);

  const handleExpenseRecognized = (recognizedData: ExpenseFormValues & { 
    receiptImage?: string;
    receiptThumbnail?: string;
  }) => {
    // Update the form values with the recognized data
    form.reset({
      ...recognizedData,
      // Leave the category as is since it should already be mapped to a valid category ID
      // If it's not valid, it will be empty and the user can select it
    });
    
    // Switch to the manual tab to let the user review and adjust
    setActiveTab("manual");
  };

  const showReceiptTab = initialValues?.receiptImage || initialValues?.receiptThumbnail;

  const handleSubmit = (values: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string;
  }) => {
    console.log("Form submitting with values:", values);
    
    // Ensure dates are properly formatted with fixed time
    const submissionDate = new Date(values.date);
    submissionDate.setHours(12, 0, 0, 0);
    
    let submissionStopDate = undefined;
    if (values.stopDate) {
      submissionStopDate = new Date(values.stopDate);
      submissionStopDate.setHours(12, 0, 0, 0);
    }
    
    const submissionValues = {
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
              : 'Enter the details of your expense or upload a receipt image.'}
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="image">Upload Receipt</TabsTrigger>
            {showReceiptTab && (
              <TabsTrigger value="receipt">View Receipt</TabsTrigger>
            )}
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
                initialImage={initialValues?.receiptImage}
              />
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>Upload a photo of your receipt to automatically extract expense details.</p>
                <p className="mt-1">We'll try to identify the amount, date, description, and category.</p>
              </div>
            </div>
          </TabsContent>
          
          {showReceiptTab && (
            <TabsContent value="receipt">
              <ReceiptImagePreview 
                receiptImage={initialValues?.receiptImage} 
                receiptThumbnail={initialValues?.receiptThumbnail}
                onRemoveImage={() => {
                  form.setValue('receiptImage', undefined);
                  form.setValue('receiptThumbnail', undefined);
                  setActiveTab("manual");
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
