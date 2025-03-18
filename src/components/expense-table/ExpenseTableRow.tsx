
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Expense, Category, formatCurrency } from '@/lib/data';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface ExpenseTableRowProps {
  expense: Expense;
  getCategory: (expense: Expense) => Category | string;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

export function ExpenseTableRow({ 
  expense, 
  getCategory, 
  onEditExpense, 
  onDeleteExpense 
}: ExpenseTableRowProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditExpense) {
      console.log("Edit button clicked for expense:", expense);
      onEditExpense(expense);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDeleteExpense) {
      onDeleteExpense(expense.id);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className={`notion-db-row group ${expense.isProjection ? 'bg-muted/30' : ''} h-8`}>
          <TableCell className={`font-medium ${expense.isProjection ? 'text-muted-foreground italic' : ''} px-4 py-1 w-2/5`}>
            {expense.description}
            {expense.isProjection && <span className="ml-2 text-xs text-muted-foreground">(Projected)</span>}
          </TableCell>
          <TableCell className="text-muted-foreground px-4 py-1 w-1/5">
            {formatCurrency(expense.amount, expense.currency)}
          </TableCell>
          <TableCell className="text-muted-foreground px-4 py-1 w-1/5">
            {expense.date instanceof Date
              ? format(expense.date, 'MMM d, yyyy')
              : format(new Date(expense.date), 'MMM d, yyyy')}
          </TableCell>
          <TableCell className="px-4 py-1 w-1/5">
            <CategoryBadge 
              category={getCategory(expense)} 
              className="text-xs py-0.5 px-1.5"
            />
          </TableCell>
          <TableCell className="px-4 py-1 w-8">
            {expense.isRecurring && (
              <span className="inline-flex items-center rounded bg-slate-100 px-1 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                ↻
              </span>
            )}
          </TableCell>
          <TableCell className="text-right px-4 py-1 w-20">
            {!expense.isProjection && (
              <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEditExpense && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={handleEditClick}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
                {onDeleteExpense && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive" 
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            )}
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      {!expense.isProjection && (
        <ContextMenuContent>
          {onEditExpense && (
            <ContextMenuItem onClick={() => onEditExpense(expense)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit expense
            </ContextMenuItem>
          )}
          {onDeleteExpense && (
            <ContextMenuItem 
              onClick={() => onDeleteExpense(expense.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete expense
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}
