
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExpenseImageUpload } from '@/components/expense-image-upload/ExpenseImageUpload';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Category, Expense } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/currency-utils';

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
  const [pendingExpenses, setPendingExpenses] = useState<(ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string;
    id?: string;
  })[]>([]);
  
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
  
  const handleApproveExpense = (expense: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string;
    id?: string;
  }) => {
    // Create a new expense object from the recognized data
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      categoryId: expense.category,
      isRecurring: expense.isRecurring,
      recurrenceInterval: expense.recurrenceInterval,
      stopDate: expense.stopDate,
      currency: expense.currency,
      receiptImage: expense.receiptImage,
      receiptThumbnail: expense.receiptThumbnail
    };

    // Add the expense
    onAddExpense(newExpense);
    
    // Remove from pending expenses
    setPendingExpenses(prev => 
      prev.filter(item => item.id !== expense.id)
    );
    
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
        
        {pendingExpenses.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="text-sm font-medium">Pending Approval ({pendingExpenses.length})</div>
            <div className="space-y-3">
              {pendingExpenses.map((expense) => (
                <div 
                  key={expense.id} 
                  className="p-3 border rounded-md bg-background"
                >
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Description</label>
                      <Input
                        value={expense.description}
                        onChange={(e) => handleUpdatePendingExpense(
                          expense.id!, 
                          'description', 
                          e.target.value
                        )}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Amount</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={expense.amount}
                        onChange={(e) => handleUpdatePendingExpense(
                          expense.id!, 
                          'amount', 
                          parseFloat(e.target.value) || 0
                        )}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Category</label>
                      <Select
                        value={expense.category}
                        onValueChange={(value) => handleUpdatePendingExpense(
                          expense.id!, 
                          'category', 
                          value
                        )}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Currency</label>
                      <Select
                        value={expense.currency}
                        onValueChange={(value: any) => handleUpdatePendingExpense(
                          expense.id!, 
                          'currency', 
                          value
                        )}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="THB">Thai Baht (฿)</SelectItem>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center space-x-1">
                      <div className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                      {expense.receiptThumbnail && (
                        <div className="h-6 w-6 bg-muted rounded overflow-hidden">
                          <img 
                            src={expense.receiptThumbnail} 
                            alt="Receipt" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemovePendingExpense(expense.id!)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveExpense(expense)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
