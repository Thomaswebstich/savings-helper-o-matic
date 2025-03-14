
import { useState, useMemo } from 'react';
import { Expense, Category, CATEGORIES, formatCurrency } from '@/lib/data';
import { CategoryBadge } from './CategoryBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar, Filter, SortDesc, SortAsc, Plus, CheckSquare, X, Search, Trash2, Pencil } from 'lucide-react';
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

interface ExpenseTableProps {
  expenses: Expense[];
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
}

export function ExpenseTable({ expenses, onAddExpense, onEditExpense, onDeleteExpense }: ExpenseTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'asc' | 'desc' }>({ 
    key: 'date', direction: 'desc' 
  });
  
  // Filter expenses based on search and category filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Filter by search term
      const matchesSearch = 
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        formatCurrency(expense.amount).includes(search);
      
      // Filter by selected categories
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.includes(expense.category);
      
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, selectedCategories]);
  
  // Sort expenses
  const sortedExpenses = useMemo(() => {
    const sorted = [...filteredExpenses];
    
    return sorted.sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
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
        return sortConfig.direction === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      
      return 0;
    });
  }, [filteredExpenses, sortConfig]);
  
  // Toggle sort
  const requestSort = (key: keyof Expense) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Toggle category filter
  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
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
                {CATEGORIES.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
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
        <table className="w-full">
          <thead>
            <tr className="notion-db-header">
              <th 
                className="font-medium text-left w-2/5 cursor-pointer"
                onClick={() => requestSort('description')}
              >
                <div className="flex items-center">
                  Description {getSortIcon('description')}
                </div>
              </th>
              <th 
                className="font-medium text-left w-1/5 cursor-pointer"
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center">
                  Amount {getSortIcon('amount')}
                </div>
              </th>
              <th 
                className="font-medium text-left w-1/5 cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date {getSortIcon('date')}
                </div>
              </th>
              <th 
                className="font-medium text-left w-1/5 cursor-pointer"
                onClick={() => requestSort('category')}
              >
                <div className="flex items-center">
                  Category {getSortIcon('category')}
                </div>
              </th>
              <th className="font-medium text-left w-12">
                <div className="flex items-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </th>
              <th className="font-medium text-right w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  {search || selectedCategories.length 
                    ? "No expenses match your filters" 
                    : "No expenses yet"}
                </td>
              </tr>
            ) : (
              sortedExpenses.map(expense => (
                <ContextMenu key={expense.id}>
                  <ContextMenuTrigger asChild>
                    <tr className="notion-db-row group">
                      <td className="font-medium">{expense.description}</td>
                      <td className="text-muted-foreground">{formatCurrency(expense.amount)}</td>
                      <td className="text-muted-foreground">
                        {format(expense.date, 'MMM d, yyyy')}
                      </td>
                      <td>
                        <CategoryBadge category={expense.category} />
                      </td>
                      <td>
                        {expense.isRecurring && (
                          <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            ↻
                          </span>
                        )}
                      </td>
                      <td className="text-right">
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
                      </td>
                    </tr>
                  </ContextMenuTrigger>
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
                </ContextMenu>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
