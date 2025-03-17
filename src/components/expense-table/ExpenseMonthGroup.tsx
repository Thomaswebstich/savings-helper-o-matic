
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Expense, Category, formatCurrency } from '@/lib/data';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseTableRow } from './ExpenseTableRow';
import { ExpenseTableHeader } from './ExpenseTableHeader';
import { MonthGroup } from './types';
import { StackedBar } from '@/components/ui/stacked-bar';
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
  
  // Prepare data for stacked bar chart
  const getStackedBarData = () => {
    if (group.categoryTotals.size === 0) return [];
    
    const totalAmount = group.total;
    
    return Array.from(group.categoryTotals.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by amount (highest first)
      .map(([categoryId, amount]) => {
        // Calculate percentage based on the total amount for this month
        const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
        
        // Get the category color from the categoryMap first (prioritize taxonomy color)
        const category = categoryMap.get(categoryId);
        const color = category?.color || getCategoryColor(categoryId);
        
        return {
          id: categoryId,
          value: percentage,
          color: color
        };
      });
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
          
          {/* Category stacked bar - only show when not expanded */}
          {!isExpanded && group.categoryTotals.size > 0 && (
            <div className="px-4 pb-2 pt-1">
              <StackedBar 
                segments={getStackedBarData()} 
                height={4}
                className="mb-1.5"
              />
              <div className="flex flex-wrap gap-2 text-xs">
                {getStackedBarData()
                  .slice(0, 3) // Only show top 3 categories in the legend
                  .map(segment => {
                    const category = categoryMap.get(segment.id);
                    return (
                      <span 
                        key={segment.id} 
                        className="inline-flex items-center gap-1"
                      >
                        <span 
                          className="inline-block h-2 w-2 rounded-sm" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-muted-foreground">
                          {category?.name || segment.id}
                        </span>
                      </span>
                    );
                  })
                }
              </div>
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
