
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { IncomeSource, Currency } from '@/lib/data';

interface IncomeFormProps {
  initialData: Omit<IncomeSource, 'id'>;
  onChange: (data: Omit<IncomeSource, 'id'>) => void;
}

export function IncomeForm({ initialData, onChange }: IncomeFormProps) {
  const [formState, setFormState] = useState<Omit<IncomeSource, 'id'>>(initialData);
  
  useEffect(() => {
    setFormState(initialData);
  }, [initialData]);
  
  const updateField = <K extends keyof Omit<IncomeSource, 'id'>>(
    field: K, 
    value: Omit<IncomeSource, 'id'>[K]
  ) => {
    const updatedState = { ...formState, [field]: value };
    
    // Special handling for recurring toggle
    if (field === 'isRecurring' && value === false) {
      updatedState.recurrenceInterval = undefined;
      updatedState.endDate = undefined;
    }
    
    setFormState(updatedState);
    onChange(updatedState);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          value={formState.description} 
          onChange={e => updateField('description', e.target.value)}
          placeholder="e.g., Salary, Freelance Work"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount" 
            type="number"
            value={formState.amount} 
            onChange={e => updateField('amount', parseFloat(e.target.value) || 0)}
            min="0"
            step="100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select 
            value={formState.currency} 
            onValueChange={(value) => updateField('currency', value as Currency)}
          >
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
          checked={formState.isRecurring}
          onCheckedChange={value => updateField('isRecurring', value)}
        />
      </div>
      
      {formState.isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="recurrenceInterval">Recurrence Interval</Label>
          <Select 
            value={formState.recurrenceInterval || 'monthly'}
            onValueChange={(value) => updateField(
              'recurrenceInterval', 
              value as "daily" | "weekly" | "monthly" | "yearly"
            )}
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
                !formState.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formState.startDate ? format(formState.startDate, 'PP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formState.startDate}
              onSelect={(date) => updateField('startDate', date || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {formState.isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formState.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formState.endDate ? format(formState.endDate, 'PP') : <span>No end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => updateField('endDate', undefined)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={formState.endDate}
                onSelect={(date) => updateField('endDate', date)}
                disabled={(date) => date < formState.startDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
