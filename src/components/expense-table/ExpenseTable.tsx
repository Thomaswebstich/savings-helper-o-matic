
import { useState, useMemo } from 'react';
import { Expense, Category } from '@/lib/data';
import { ExpenseTableFilters } from './ExpenseTableFilters';
import { ExpenseMonthGroup } from './ExpenseMonthGroup';
import { ExpenseProjectionToggle } from './ExpenseProjectionToggle';
import { generateProjectedExpenses } from './expense-utils';

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
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'asc' | 'desc' }>({ 
    key: 'date', direction: 'desc' 
  });
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
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
      // Use the filterExpense helper function
      return filterExpense(expense, search, selectedCategories);
    });
  }, [allExpenses, search, selectedCategories]);
  
  // Group expenses by month and calculate category totals within each month
  const monthGroups = useMemo(() => {
    return groupExpensesByMonth(filteredExpenses, sortConfig, categoryMap);
  }, [filteredExpenses, sortConfig, categoryMap]);
  
  // Toggle sort
  const requestSort = (key: keyof Expense) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Toggle category filter
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
  };
  
  // Get sort icon for table headers
  const getSortIcon = (key: keyof Expense) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 'asc' : 'desc';
  };

  // Toggle month expansion
  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  // Check if month is expanded
  const isMonthExpanded = (monthKey: string) => {
    return expandedMonths.includes(monthKey);
  };

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

// Helper functions
function filterExpense(expense: Expense, search: string, selectedCategories: string[]): boolean {
  const { formatCurrency } = require('@/lib/data');
  
  // Filter by search term
  const matchesSearch = 
    expense.description.toLowerCase().includes(search.toLowerCase()) ||
    formatCurrency(expense.amount).includes(search);
  
  // Filter by selected categories
  const matchesCategory = selectedCategories.length === 0 || 
    selectedCategories.includes(expense.categoryId);
  
  return matchesSearch && matchesCategory;
}

function groupExpensesByMonth(filteredExpenses: Expense[], sortConfig: { key: keyof Expense; direction: 'asc' | 'desc' }, categoryMap: Map<string, Category>) {
  const { format, startOfMonth } = require('date-fns');
  const { MonthGroup } = require('./types');
  
  const groups: MonthGroup[] = [];
  const monthMap = new Map<string, MonthGroup>();
  
  // Sort expenses by date first
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return sortConfig.key === 'date' && sortConfig.direction === 'asc' 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
  
  // Group expenses by month
  sortedExpenses.forEach(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    const monthStart = startOfMonth(expenseDate);
    const monthKey = format(monthStart, 'yyyy-MM');
    const monthLabel = format(monthStart, 'MMMM yyyy');
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthStart,
        label: monthLabel,
        expenses: [],
        total: 0,
        categoryTotals: new Map<string, number>()
      });
    }
    
    const group = monthMap.get(monthKey)!;
    group.expenses.push(expense);
    group.total += expense.amount;
    
    // Update category totals
    const categoryId = expense.categoryId || 'uncategorized';
    const currentTotal = group.categoryTotals.get(categoryId) || 0;
    group.categoryTotals.set(categoryId, currentTotal + expense.amount);
  });
  
  // Convert map to array and sort by month (most recent first)
  Array.from(monthMap.values()).forEach(group => {
    // Sort expenses within the month group based on sortConfig
    group.expenses.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return sortConfig.direction === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      
      if (sortConfig.key === 'description') {
        return sortConfig.direction === 'asc'
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      }
      
      if (sortConfig.key === 'category') {
        const catA = categoryMap.get(a.categoryId)?.name || '';
        const catB = categoryMap.get(b.categoryId)?.name || '';
        return sortConfig.direction === 'asc'
          ? catA.localeCompare(catB)
          : catB.localeCompare(catA);
      }
      
      return 0;
    });
    
    groups.push(group);
  });
  
  // Sort month groups by date (most recent first)
  return groups.sort((a, b) => b.month.getTime() - a.month.getTime());
}

// Utility for determining category colors
function getCategoryColor(categoryId: string): string {
  const colors = [
    "#0ea5e9", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#94a3b8"  // slate
  ];
  
  // Hash the category ID to get consistent color
  const hash = categoryId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

// Import from the ui components
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
