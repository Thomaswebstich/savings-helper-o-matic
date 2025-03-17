
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Expense, Category, formatCurrency } from '@/lib/data';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Progress } from '@/components/ui/progress';
import { ExpenseTableRow } from './ExpenseTableRow';
import { ExpenseTableHeader } from './ExpenseTableHeader';
import { MonthGroup } from './types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
} from "@/components/ui/table";

interface ExpenseMonthGroupProps {
  group: MonthGroup;
  isExpanded: boolean;
  toggleExpansion: () => void;
  categoryMap: Map<string, Category>;
  getSortIcon: (key: keyof Expense) => 'asc' | 'desc' | null;
  requestSort: (key: keyof Expense) => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  getCategoryColor: (categoryId: string) => string;
}

export function ExpenseMonthGroup({
  group,
  isExpanded,
  toggleExpansion,
  categoryMap,
  getSortIcon,
  requestSort,
  onEditExpense,
  onDeleteExpense,
  getCategoryColor
}: ExpenseMonthGroupProps) {
  
  // Get category for an expense
  const getCategory = (expense: Expense) => {
    // First check if we have a categoryId that maps to a category
    if (expense.categoryId) {
      const category = categoryMap.get(expense.categoryId);
      if (category) return category;
    }
    
    // Fall back to the legacy category string if available
    if (expense.category) {
      return expense.category;
    }
    
    // Default fallback
    return "Other";
  };
  
  return (
    <Collapsible 
      open={isExpanded}
      onOpenChange={toggleExpansion}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <div className="flex flex-col w-full hover:bg-muted/50 cursor-pointer">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 mr-2" /> : <ChevronRight className="h-3.5 w-3.5 mr-2" />}
              <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="font-medium text-sm">{group.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {group.expenses.length} {group.expenses.length === 1 ? 'expense' : 'expenses'}
              </span>
              <span className="font-medium text-sm">{formatCurrency(group.total)}</span>
            </div>
          </div>
          
          {/* Category progress bars - only show when not expanded */}
          {!isExpanded && group.categoryTotals.size > 0 && (
            <div className="px-4 pb-2 pt-0.5 grid grid-cols-1 gap-1">
              {Array.from(group.categoryTotals.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by amount (highest first)
                .slice(0, 3) // Only show top 3 categories
                .map(([categoryId, amount]) => {
                  const percentage = (amount / group.total) * 100;
                  const category = categoryMap.get(categoryId);
                  const categoryColor = getCategoryColor(categoryId);
                  
                  return (
                    <div key={categoryId} className="flex items-center gap-2">
                      <div className="w-24 flex-shrink-0">
                        <CategoryBadge 
                          category={category || categoryId} 
                          className="text-xs py-0 px-1.5 h-4"
                        />
                      </div>
                      <Progress
                        value={percentage}
                        className="h-1.5 flex-grow"
                        indicatorColor={categoryColor}
                      />
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <Table>
          <ExpenseTableHeader 
            getSortIcon={getSortIcon}
            requestSort={requestSort}
          />
          <TableBody>
            {group.expenses.map(expense => (
              <ExpenseTableRow
                key={expense.id}
                expense={expense}
                getCategory={getCategory}
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
              />
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}
