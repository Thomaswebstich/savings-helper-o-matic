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
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Check, Edit, Plus, Trash2, X } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from '@/components/ui/switch';
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
import { toast } from '@/hooks/use-toast';
import { 
  IncomeSource,
  Currency,
  fetchIncomeSources,
  addIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  formatCurrency,
  calculateTotalMonthlyIncome
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { IncomeEditor } from './IncomeEditor';

export function IncomeManager() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState<IncomeSource | null>(null);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('THB');
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceInterval, setRecurrenceInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">('monthly');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    loadIncomeSources();
  }, []);
  
  const loadIncomeSources = async () => {
    setIsLoading(true);
    try {
      const data = await fetchIncomeSources();
      setIncomeSources(data);
    } catch (error) {
      console.error('Error loading income sources:', error);
      toast({
        title: "Error",
        description: "Failed to load income sources",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setDescription('');
    setAmount(0);
    setCurrency('THB');
    setIsRecurring(true);
    setRecurrenceInterval('monthly');
    setStartDate(new Date());
    setEndDate(undefined);
  };
  
  const handleAddIncome = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
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
      const incomeData: Omit<IncomeSource, 'id'> = {
        description,
        amount,
        currency,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        startDate,
        endDate: isRecurring ? endDate : undefined
      };
      
      const newIncome = await addIncomeSource(incomeData);
      
      setIncomeSources(prev => [newIncome, ...prev]);
      
      toast({
        title: "Success",
        description: "Income source added successfully"
      });
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding income source:', error);
      toast({
        title: "Error",
        description: "Failed to add income source",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateIncome = async () => {
    if (!currentIncome) return;
    
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Description is required",
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
      const incomeData: Partial<Omit<IncomeSource, 'id'>> = {
        description,
        amount,
        currency,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        startDate,
        endDate: isRecurring ? endDate : undefined
      };
      
      const updatedIncome = await updateIncomeSource(currentIncome.id, incomeData);
      
      setIncomeSources(prev => 
        prev.map(inc => inc.id === currentIncome.id ? updatedIncome : inc)
      );
      
      toast({
        title: "Success",
        description: "Income source updated successfully"
      });
      
      setIsDialogOpen(false);
      setCurrentIncome(null);
    } catch (error) {
      console.error('Error updating income source:', error);
      toast({
        title: "Error",
        description: "Failed to update income source",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteIncome = async () => {
    if (!currentIncome) return;
    
    try {
      await deleteIncomeSource(currentIncome.id);
      
      setIncomeSources(prev => prev.filter(inc => inc.id !== currentIncome.id));
      
      toast({
        title: "Success",
        description: "Income source deleted successfully"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentIncome(null);
    } catch (error) {
      console.error('Error deleting income source:', error);
      toast({
        title: "Error",
        description: "Failed to delete income source",
        variant: "destructive"
      });
    }
  };
  
  const startEdit = (income: IncomeSource) => {
    setCurrentIncome(income);
    setDescription(income.description);
    setAmount(income.amount);
    setCurrency(income.currency);
    setIsRecurring(income.isRecurring);
    setRecurrenceInterval(income.recurrenceInterval || 'monthly');
    setStartDate(income.startDate);
    setEndDate(income.endDate);
    setIsDialogOpen(true);
  };
  
  const startDelete = (income: IncomeSource) => {
    setCurrentIncome(income);
    setIsDeleteDialogOpen(true);
  };
  
  const handleIncomeChange = async (incomeId: string, newAmount: number) => {
    try {
      console.log(`Updating income with ID ${incomeId} to amount ${newAmount}`);
      
      const updatedIncome = await updateIncomeSource(incomeId, { amount: newAmount });
      
      setIncomeSources(prev => 
        prev.map(inc => inc.id === incomeId ? updatedIncome : inc)
      );
      
      toast({
        title: "Success",
        description: "Income amount updated successfully"
      });
    } catch (error) {
      console.error('Error updating income amount:', error);
      toast({
        title: "Error",
        description: "Failed to update income amount",
        variant: "destructive"
      });
    }
  };
  
  const totalMonthlyIncome = calculateTotalMonthlyIncome(incomeSources);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Income Sources</h3>
          <p className="text-sm text-muted-foreground">
            Total Monthly Income: {formatCurrency(totalMonthlyIncome)}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Income
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
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeSources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No income sources found. Add your first income source.
                  </TableCell>
                </TableRow>
              ) : (
                incomeSources.map(income => (
                  <TableRow key={income.id}>
                    <TableCell>{income.description}</TableCell>
                    <TableCell>
                      <IncomeEditor 
                        incomeId={income.id}
                        income={income.amount} 
                        currency={income.currency}
                        onIncomeChange={(newAmount) => handleIncomeChange(income.id, newAmount)}
                      />
                    </TableCell>
                    <TableCell>
                      {income.isRecurring ? (
                        <span className="inline-flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          {income.recurrenceInterval || 'monthly'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center">
                          <X className="h-4 w-4 text-gray-400 mr-1" />
                          One-time
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{format(income.startDate, 'PP')}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEdit(income)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startDelete(income)}
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentIncome ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
            <DialogDescription>
              {currentIncome 
                ? 'Update this income source' 
                : 'Add a new income source to track your earnings'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g., Salary, Freelance Work"
              />
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
            
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Recurring Income</Label>
                <p className="text-sm text-muted-foreground">
                  Is this a recurring source of income?
                </p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
            
            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrenceInterval">Recurrence Interval</Label>
                <Select 
                  value={recurrenceInterval} 
                  onValueChange={setRecurrenceInterval as (value: string) => void}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => setStartDate(date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PP') : <span>No end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEndDate(undefined)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setCurrentIncome(null);
            }}>
              Cancel
            </Button>
            <Button onClick={currentIncome ? handleUpdateIncome : handleAddIncome}>
              {currentIncome ? 'Update' : 'Add'} Income
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Income Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this income source? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentIncome && (
            <div className="py-4">
              <p className="mb-2">
                <strong>{currentIncome.description}</strong> - {formatCurrency(currentIncome.amount, currentIncome.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentIncome.isRecurring 
                  ? `Recurring (${currentIncome.recurrenceInterval})` 
                  : 'One-time'} income starting {format(currentIncome.startDate, 'PP')}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteIncome}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
