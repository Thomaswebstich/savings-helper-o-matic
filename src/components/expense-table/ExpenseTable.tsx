
import { useMemo, useState } from 'react';
import { Expense, Category } from '@/lib/data';
import { ExpenseTableFilters } from './ExpenseTableFilters';
import { ExpenseMonthGroup } from './ExpenseMonthGroup';
import { ExpenseProjectionToggle } from './ExpenseProjectionToggle';
import { generateProjectedExpenses } from './expense-utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSortExpenses } from './hooks/useSortExpenses';
import { useExpandedMonths } from './hooks/useExpandedMonths';
import { useExpenseFilters } from './hooks/useExpenseFilters';
import { filterExpense, groupExpensesByMonth, getCategoryColor } from './utils/expense-filter-utils';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: Category[];
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

export function ExpenseTable({ 
  expenses, 
  categories, 
  onAddExpense, 
  onEditExpense, 
  onDeleteExpense 
}: ExpenseTableProps) {
  // Use our custom hooks
  const { sortConfig, requestSort, getSortIcon } = useSortExpenses();
  const { expandedMonths, toggleMonthExpansion, isMonthExpanded } = useExpandedMonths();
  const { search, setSearch, selectedCategories, toggleCategory, clearFilters } = useExpenseFilters();
  
  // State for projections
  const [showProjections, setShowProjections] = useState(true);
  
  // Create a category map for easier lookups
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(category => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);
  
  // Generate projected recurring expenses for the next 12 months
  const projectedRecurringExpenses = useMemo(() => {
    if (!showProjections) return [];
    return generateProjectedExpenses(expenses);
  }, [expenses, showProjections]);
  
  // Combine actual expenses with projections
  const allExpenses = useMemo(() => {
    return [...expenses, ...projectedRecurringExpenses];
  }, [expenses, projectedRecurringExpenses]);
  
  // Filter expenses based on search and category filters
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      return filterExpense(expense, search, selectedCategories);
    });
  }, [allExpenses, search, selectedCategories]);
  
  // Group expenses by month and calculate category totals within each month
  const monthGroups = useMemo(() => {
    return groupExpensesByMonth(filteredExpenses, sortConfig, categoryMap);
  }, [filteredExpenses, sortConfig, categoryMap]);
  
  // Toggle projections visibility
  const toggleProjections = () => {
    setShowProjections(prev => !prev);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border animate-fade-in">
      <div className="bg-muted/50 px-4 py-2 flex flex-col md:flex-row gap-2 justify-between items-start md:items-center">
        <ExpenseTableFilters 
          search={search}
          setSearch={setSearch}
          categories={categories}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          clearFilters={clearFilters}
          onAddExpense={onAddExpense}
        />
        
        <div className="flex flex-wrap items-center gap-2">
          <ExpenseProjectionToggle
            showProjections={showProjections}
            toggleProjections={toggleProjections}
          />
          
          {onAddExpense && (
            <Button size="sm" className="h-9" onClick={onAddExpense}>
              <Plus className="w-4 h-4 mr-2" />
              Add expense
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {monthGroups.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {search || selectedCategories.length 
              ? "No expenses match your filters" 
              : "No expenses yet"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {monthGroups.map((group) => (
              <ExpenseMonthGroup
                key={group.month.toString()}
                group={group}
                isExpanded={isMonthExpanded(format(group.month, 'yyyy-MM'))}
                toggleExpansion={() => toggleMonthExpansion(format(group.month, 'yyyy-MM'))}
                categoryMap={categoryMap}
                getSortIcon={getSortIcon}
                requestSort={requestSort}
                onEditExpense={onEditExpense}
                onDeleteExpense={onDeleteExpense}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
