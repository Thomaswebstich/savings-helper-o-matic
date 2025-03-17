
import { Expense, Category } from '@/lib/data';
import { ExpenseTableRow } from './ExpenseTableRow';
import { ExpenseTableHeader } from './ExpenseTableHeader';
import { MonthGroup } from './types';
import { ExpenseMonthHeader } from './components/ExpenseMonthHeader';
import { ExpenseMonthStackedBar } from './components/ExpenseMonthStackedBar';
import { getExpenseCategory } from './utils/expense-category-utils';
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
  showAgainstIncome?: boolean;
  monthlyIncome?: number;
  categoryLegendData?: Array<{
    categoryId: string;
    categoryName: string;
    color: string;
  }>;
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
  getCategoryColor,
  showAgainstIncome = false,
  monthlyIncome = 0,
  categoryLegendData = []
}: ExpenseMonthGroupProps) {
  
  return (
    <Collapsible 
      open={isExpanded}
      onOpenChange={toggleExpansion}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <div className="flex flex-col w-full hover:bg-muted/50 cursor-pointer">
          <ExpenseMonthHeader
            label={group.label}
            total={group.total}
            expenseCount={group.expenses.length}
            isExpanded={isExpanded}
            income={monthlyIncome}
          />
          
          {/* Category stacked bar - only show when not expanded */}
          {!isExpanded && group.categoryTotals.size > 0 &&
            <ExpenseMonthStackedBar
              categoryTotals={group.categoryTotals}
              total={group.total}
              categoryMap={categoryMap}
              getCategoryColor={getCategoryColor}
              showAgainstIncome={showAgainstIncome}
              monthlyIncome={monthlyIncome}
              categoryLegendData={categoryLegendData}
            />
          }
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
                getCategory={(exp) => getExpenseCategory(exp, categoryMap)}
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
