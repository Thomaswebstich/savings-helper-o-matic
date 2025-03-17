
import { useState, useMemo } from 'react';
import { Expense, Category, formatCurrency } from '@/lib/data';
import { CategoryBadge } from './CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  format, 
  isAfter, 
  isBefore, 
  isSameMonth, 
  startOfMonth, 
  endOfMonth, 
  parseISO, 
  addMonths, 
  addDays, 
  addWeeks,
  isSameDay 
} from 'date-fns';
import { 
  Calendar, 
  Filter, 
  SortDesc, 
  SortAsc, 
  Plus, 
  CheckSquare, 
  X, 
  Search, 
  Trash2, 
  Pencil, 
  ChevronRight, 
  ChevronDown,
  RefreshCw 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

interface ExpenseTableProps {
  expenses: Expense[];
  categories: Category[];
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

// Group expenses by month
interface MonthGroup {
  month: Date;
  label: string;
  expenses: Expense[];
  total: number;
}

export function ExpenseTable({ expenses, categories, onAddExpense, onEditExpense, onDeleteExpense }: ExpenseTableProps) {
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
    
    const recurringExpenses = expenses.filter(expense => expense.isRecurring);
    const projections: Expense[] = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    
    // Project for 12 months forward
    const maxProjectionDate = addMonths(today, 12);
    
    recurringExpenses.forEach(expense => {
      const startDate = new Date(expense.date);
      startDate.setHours(12, 0, 0, 0);
      
      // Don't project if the start date is in the future
      if (isBefore(today, startDate)) {
        return;
      }
      
      // Define the end date for projections
      const endDate = expense.stopDate 
        ? new Date(expense.stopDate) 
        : maxProjectionDate;
        
      if (isBefore(endDate, today)) {
        return; // Already ended
      }
      
      // Create projections based on recurrence interval
      let currentDate = new Date(startDate);
      
      // Skip all occurrences before today
      while (isBefore(currentDate, today) && !isSameDay(currentDate, today)) {
        switch (expense.recurrenceInterval) {
          case 'daily':
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'yearly':
            currentDate = addMonths(currentDate, 12);
            break;
          default:
            currentDate = addMonths(currentDate, 1); // Default to monthly
        }
      }
      
      // Skip the actual expense's date to avoid duplication
      if (isSameDay(currentDate, startDate)) {
        switch (expense.recurrenceInterval) {
          case 'daily':
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'yearly':
            currentDate = addMonths(currentDate, 12);
            break;
          default:
            currentDate = addMonths(currentDate, 1);
        }
      }
      
      // Generate future projections
      while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
        // Create projected expense
        const projectedExpense: Expense = {
          ...expense,
          id: `${expense.id}-projection-${format(currentDate, 'yyyy-MM-dd')}`,
          date: new Date(currentDate),
          isProjection: true // Add this flag to identify projections
        };
        
        projections.push(projectedExpense);
        
        // Move to next occurrence
        switch (expense.recurrenceInterval) {
          case 'daily':
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'yearly':
            currentDate = addMonths(currentDate, 12);
            break;
          default:
            currentDate = addMonths(currentDate, 1);
        }
        
        // Safety check to prevent infinite loops
        if (isSameDay(currentDate, projectedExpense.date)) {
          break;
        }
      }
    });
    
    return projections;
  }, [expenses, showProjections]);
  
  // Combine actual expenses with projections
  const allExpenses = useMemo(() => {
    return [...expenses, ...projectedRecurringExpenses];
  }, [expenses, projectedRecurringExpenses]);
  
  // Filter expenses based on search and category filters
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      // Filter by search term
      const matchesSearch = 
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        formatCurrency(expense.amount).includes(search);
      
      // Filter by selected categories
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(expense.categoryId);
      
      return matchesSearch && matchesCategory;
    });
  }, [allExpenses, search, selectedCategories]);
  
  // Group expenses by month
  const monthGroups = useMemo(() => {
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
          total: 0
        });
      }
      
      const group = monthMap.get(monthKey)!;
      group.expenses.push(expense);
      group.total += expense.amount;
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
  
  // Determine sort icon
  const getSortIcon = (key: keyof Expense) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
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

  // Toggle projections visibility
  const toggleProjections = () => {
    setShowProjections(prev => !prev);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border animate-fade-in">
      <div className="bg-muted/50 px-4 py-3 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-background w-full"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={toggleProjections}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${showProjections ? 'text-primary' : 'text-muted-foreground'}`} />
            {showProjections ? 'Hide Projections' : 'Show Projections'}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="w-4 h-4 mr-2" />
                {selectedCategories.length ? `${selectedCategories.length} selected` : 'Category'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="p-2">
                <div className="mb-2 text-xs font-medium">Categories</div>
                {categories.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  >
                    <CategoryBadge category={category} withLabel />
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={clearFilters}
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Clear filters
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
          <div className="text-center py-8 text-muted-foreground">
            {search || selectedCategories.length 
              ? "No expenses match your filters" 
              : "No expenses yet"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {monthGroups.map((group) => {
              const monthKey = format(group.month, 'yyyy-MM');
              const expanded = isMonthExpanded(monthKey);
              
              return (
                <Collapsible 
                  key={monthKey}
                  open={expanded}
                  onOpenChange={() => toggleMonthExpansion(monthKey)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center">
                        {expanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{group.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {group.expenses.length} {group.expenses.length === 1 ? 'expense' : 'expenses'}
                        </span>
                        <span className="font-medium">{formatCurrency(group.total)}</span>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="notion-db-header">
                          <TableHead 
                            className="font-medium w-2/5 cursor-pointer"
                            onClick={() => requestSort('description')}
                          >
                            <div className="flex items-center">
                              Description {getSortIcon('description')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="font-medium w-1/5 cursor-pointer"
                            onClick={() => requestSort('amount')}
                          >
                            <div className="flex items-center">
                              Amount {getSortIcon('amount')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="font-medium w-1/5 cursor-pointer"
                            onClick={() => requestSort('date')}
                          >
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Date {getSortIcon('date')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="font-medium w-1/5 cursor-pointer"
                            onClick={() => requestSort('category')}
                          >
                            <div className="flex items-center">
                              Category {getSortIcon('category')}
                            </div>
                          </TableHead>
                          <TableHead className="font-medium w-12">
                            <div className="flex items-center">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                          </TableHead>
                          <TableHead className="font-medium text-right w-20">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.expenses.map(expense => (
                          <ContextMenu key={expense.id}>
                            <ContextMenuTrigger asChild>
                              <TableRow className={`notion-db-row group ${expense.isProjection ? 'bg-muted/30' : ''}`}>
                                <TableCell className={`font-medium ${expense.isProjection ? 'text-muted-foreground italic' : ''}`}>
                                  {expense.description}
                                  {expense.isProjection && <span className="ml-2 text-xs text-muted-foreground">(Projected)</span>}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{formatCurrency(expense.amount)}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {expense.date instanceof Date
                                    ? format(expense.date, 'MMM d, yyyy')
                                    : format(new Date(expense.date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                  <CategoryBadge category={getCategory(expense)} />
                                </TableCell>
                                <TableCell>
                                  {expense.isRecurring && (
                                    <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                      ↻
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {!expense.isProjection && (
                                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {onEditExpense && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onEditExpense(expense);
                                          }}
                                        >
                                          <Pencil className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                      )}
                                      {onDeleteExpense && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-destructive" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteExpense(expense.id);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
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
                        ))}
                      </TableBody>
                    </Table>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
