
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExpenseImageUpload } from '@/components/expense-image-upload/ExpenseImageUpload';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Category, Expense } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface QuickReceiptUploadProps {
  categories: Category[];
  onAddExpense: (expense: Expense) => void;
  className?: string;
}

export function QuickReceiptUpload({ 
  categories, 
  onAddExpense,
  className 
}: QuickReceiptUploadProps) {
  const handleExpenseRecognized = (data: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string 
  }) => {
    // Create a new expense object from the recognized data
    const newExpense: Expense = {
      id: crypto.randomUUID(), // Use built-in randomUUID instead of v4
      description: data.description,
      amount: data.amount,
      date: data.date,
      categoryId: data.category,
      isRecurring: data.isRecurring,
      recurrenceInterval: data.recurrenceInterval,
      stopDate: data.stopDate,
      currency: data.currency,
      receiptImage: data.receiptImage,
      receiptThumbnail: data.receiptThumbnail
    };

    // Add the expense
    onAddExpense(newExpense);
    
    // Show confirmation
    toast({
      title: "Expense added",
      description: `Added ${data.description} (${data.currency} ${data.amount})`,
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          Quick Receipt Upload
          <span className="text-xs font-normal text-muted-foreground">
            Drag & drop receipts to analyze and add instantly
          </span>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="py-3 px-4">
        <ExpenseImageUpload 
          onExpenseRecognized={handleExpenseRecognized} 
          categories={categories}
          compact
          multiUpload
        />
      </CardContent>
    </Card>
  );
}
