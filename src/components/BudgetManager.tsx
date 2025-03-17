
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Category,
  CategoryBudget,
  Currency,
  CURRENCY_SYMBOLS,
  fetchCategories,
  fetchCategoryBudgets,
  setCategoryBudget,
  deleteCategoryBudget,
  formatCurrency
} from '@/lib/data';
import { CategoryBadge } from './CategoryBadge';

export function BudgetManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('THB');
  const [month, setMonth] = useState<string>(format(new Date(), 'MMM yyyy'));
  const [currentBudget, setCurrentBudget] = useState<CategoryBudget | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      const currentMonth = format(new Date(), 'MMM yyyy');
      const budgetsData = await fetchCategoryBudgets(currentMonth);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load budgets data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setSelectedCategory('');
    setAmount(0);
    setCurrency('THB');
    setMonth(format(new Date(), 'MMM yyyy'));
  };
  
  const handleSetBudget = async () => {
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive"
      });
      return;
    }
    
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const budgetData: Omit<CategoryBudget, 'id'> = {
        categoryId: selectedCategory,
        amount,
        currency,
        month
      };
      
      const newBudget = await setCategoryBudget(budgetData);
      
      // Update budgets list
      if (currentBudget) {
        setBudgets(prev => prev.map(b => b.id === currentBudget.id ? newBudget : b));
      } else {
        setBudgets(prev => [...prev, newBudget]);
      }
      
      toast({
        title: "Success",
        description: "Budget set successfully"
      });
      
      resetForm();
      setIsDialogOpen(false);
      setCurrentBudget(null);
    } catch (error) {
      console.error('Error setting budget:', error);
      toast({
        title: "Error",
        description: "Failed to set budget",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteBudget = async () => {
    if (!currentBudget) return;
    
    try {
      await deleteCategoryBudget(currentBudget.id);
      
      setBudgets(prev => prev.filter(b => b.id !== currentBudget.id));
      
      toast({
        title: "Success",
        description: "Budget deleted successfully"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentBudget(null);
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      });
    }
  };
  
  const startEdit = (budget: CategoryBudget) => {
    setCurrentBudget(budget);
    setSelectedCategory(budget.categoryId);
    setAmount(budget.amount);
    setCurrency(budget.currency);
    setMonth(budget.month);
    setIsDialogOpen(true);
  };
  
  const startDelete = (budget: CategoryBudget) => {
    setCurrentBudget(budget);
    setIsDeleteDialogOpen(true);
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  const getCategoryObject = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Monthly Budgets</h3>
        <Button 
          size="sm" 
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Set Budget
        </Button>
      </div>
      
      {isLoading ? (
        <div className="h-36 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No budgets set. Set your first category budget.
                  </TableCell>
                </TableRow>
              ) : (
                budgets.map(budget => (
                  <TableRow key={budget.id}>
                    <TableCell>
                      {getCategoryObject(budget.categoryId) ? (
                        <CategoryBadge category={getCategoryObject(budget.categoryId)!} />
                      ) : (
                        getCategoryName(budget.categoryId)
                      )}
                    </TableCell>
                    <TableCell>{budget.month}</TableCell>
                    <TableCell>{formatCurrency(budget.amount, budget.currency)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startDelete(budget)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Set Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentBudget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
            <DialogDescription>
              {currentBudget 
                ? 'Update the monthly budget for this category' 
                : 'Set a monthly budget for a category'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={!!currentBudget}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <CategoryBadge category={category} className="mr-2" />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number"
                  value={amount} 
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency as (value: string) => void}>
                  <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => {
                    const monthDate = new Date();
                    monthDate.setMonth(monthDate.getMonth() - 3 + i);
                    const monthStr = format(monthDate, 'MMM yyyy');
                    return (
                      <SelectItem key={monthStr} value={monthStr}>
                        {monthStr}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetBudget}>
              {currentBudget ? 'Update Budget' : 'Set Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Budget Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentBudget && (
            <div className="py-4">
              <p>
                Budget for <strong>{getCategoryName(currentBudget.categoryId)}</strong> in <strong>{currentBudget.month}</strong>: 
                <strong> {formatCurrency(currentBudget.amount, currentBudget.currency)}</strong>
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBudget}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
