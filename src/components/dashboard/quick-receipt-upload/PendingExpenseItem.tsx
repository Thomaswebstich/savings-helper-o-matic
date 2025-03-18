
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PendingExpenseItemProps } from './types';

export function PendingExpenseItem({
  expense,
  categories,
  onUpdate,
  onRemove,
  onApprove
}: PendingExpenseItemProps) {
  return (
    <div className="p-3 border rounded-md bg-background">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Description</label>
          <Input
            value={expense.description}
            onChange={(e) => onUpdate(
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
            onChange={(e) => onUpdate(
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
            onValueChange={(value) => onUpdate(
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
            onValueChange={(value: any) => onUpdate(
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
            onClick={() => onRemove(expense.id!)}
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={() => onApprove(expense)}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
