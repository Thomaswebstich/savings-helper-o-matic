
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExpenseImageUpload } from '@/components/expense-image-upload';
import { useQuickReceiptUpload } from './useQuickReceiptUpload';
import { PendingExpensesList } from './PendingExpensesList';
import { QuickReceiptUploadProps } from './types';
import { cn } from '@/lib/utils';

export function QuickReceiptUpload({ 
  categories, 
  onAddExpense,
  className 
}: QuickReceiptUploadProps) {
  const {
    pendingExpenses,
    handleExpenseRecognized,
    handleApproveExpense,
    handleUpdatePendingExpense,
    handleRemovePendingExpense
  } = useQuickReceiptUpload(categories, onAddExpense);

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
        
        <PendingExpensesList
          pendingExpenses={pendingExpenses}
          categories={categories}
          onUpdateExpense={handleUpdatePendingExpense}
          onRemoveExpense={handleRemovePendingExpense}
          onApproveExpense={handleApproveExpense}
        />
      </CardContent>
    </Card>
  );
}
