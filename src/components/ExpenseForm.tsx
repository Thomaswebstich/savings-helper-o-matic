
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Expense, Category, Currency } from '@/lib/data';
import { cn } from '@/lib/utils';

// Define the form values type
export type ExpenseFormValues = Omit<Expense, 'id'>;

// Create a schema for form validation
const formSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  amount: z.number().min(0.01, { message: 'Amount must be greater than 0' }),
  date: z.date(),
  category: z.string().min(1, { message: 'Category is required' }),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  stopDate: z.date().optional(),
  currency: z.enum(['THB', 'USD', 'EUR'] as [Currency, ...Currency[]]).default('THB'),
});

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues) => void;
  initialValues?: Expense | null;
  categories: Category[];
}

export function ExpenseForm({ open, onClose, onSubmit, initialValues, categories }: ExpenseFormProps) {
  // Initialize form with react-hook-form
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
      isRecurring: false,
      currency: 'THB'
    }
  });
  
  // Reset form when initial values change or when modal opens/closes
  useEffect(() => {
    if (initialValues) {
      console.log("Setting form values with:", initialValues);
      
      // Ensure all dates are proper Date objects (not serialized objects)
      const expenseDate = initialValues.date instanceof Date 
        ? initialValues.date 
        : new Date(initialValues.date);
      
      let stopDate = undefined;
      if (initialValues.stopDate) {
        stopDate = initialValues.stopDate instanceof Date 
          ? initialValues.stopDate 
          : new Date(initialValues.stopDate);
      }
      
      // Use categoryId directly for the category field
      const categoryValue = initialValues.categoryId || '';
      
      console.log("Prepared date:", expenseDate);
      console.log("Prepared stop date:", stopDate);
      console.log("Using category value:", categoryValue);
      
      // Reset the form with prepared values
      form.reset({
        description: initialValues.description,
        amount: initialValues.amount,
        date: expenseDate,
        category: categoryValue,
        isRecurring: initialValues.isRecurring || false,
        recurrenceInterval: initialValues.recurrenceInterval,
        stopDate: stopDate,
        currency: initialValues.currency || 'THB'
      });
    } else {
      // Reset to defaults if no initial values
      form.reset({
        description: '',
        amount: 0,
        date: new Date(),
        category: '',
        isRecurring: false,
        currency: 'THB'
      });
    }
  }, [initialValues, form, open]);
  
  // Handle form submission
  const handleSubmit = (values: ExpenseFormValues) => {
    console.log("Form submitting with values:", values);
    
    // Make sure date is a valid Date object
    const submissionValues: ExpenseFormValues = {
      ...values,
      date: values.date instanceof Date ? values.date : new Date(values.date),
      stopDate: values.stopDate ? 
        (values.stopDate instanceof Date ? values.stopDate : new Date(values.stopDate)) 
        : undefined
    };
    
    console.log("Formatted submission values:", submissionValues);
    onSubmit(submissionValues);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="md:max-w-xl w-full overflow-y-auto sm:max-h-[90vh] mx-auto inset-0 h-auto mt-16 mb-16 rounded-t-lg sm:rounded-lg">
        <SheetHeader className="pb-4">
          <SheetTitle>{initialValues ? 'Edit Expense' : 'Add Expense'}</SheetTitle>
          <SheetDescription>
            {initialValues 
              ? 'Update the expense details below.' 
              : 'Enter the details of your expense.'}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Grocery shopping" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="100.00" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="THB">Thai Baht (฿)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            console.log("Calendar date selected:", date);
                            field.onChange(date);
                          }}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={2020}
                          toYear={2030}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log("Category selected:", value);
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Expense</FormLabel>
                    <FormDescription>
                      Is this a repeat payment?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch('isRecurring') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recurrenceInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence Interval</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          console.log("Recurrence selected:", value);
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stopDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2 flex justify-between">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                console.log("Clear stop date clicked");
                                field.onChange(undefined);
                                const popover = document.querySelector('[data-radix-popper-content-wrapper]');
                                if (popover instanceof HTMLElement) {
                                  popover.style.display = 'none';
                                }
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Clear
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={(date) => {
                              console.log("Stop date selected:", date);
                              field.onChange(date);
                            }}
                            disabled={(date) => date < form.getValues('date')}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={2020}
                            toYear={2030}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When this recurring expense stops.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialValues ? 'Update' : 'Add'} Expense
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
