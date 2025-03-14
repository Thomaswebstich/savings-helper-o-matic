
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Category, CATEGORIES, Currency, Expense, CURRENCY_SYMBOLS } from '@/lib/data';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid } from 'date-fns';
import { CalendarClock, CalendarIcon, Check, Euro, DollarSign, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { CategoryBadge } from './CategoryBadge';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormValues) => void;
  initialValues?: Expense | null;
}

export interface ExpenseFormValues {
  description: string;
  amount: number;
  date: Date;
  category: Category;
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  stopDate?: Date | null;
  currency: Currency;
}

// Define our form schema with Zod
const formSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  date: z.date(),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  isRecurring: z.boolean().default(false),
  recurrenceInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  stopDate: z.date().nullable().optional(),
  currency: z.enum(["THB", "USD", "EUR"] as [Currency, ...Currency[]]),
});

export function ExpenseForm({ open, onClose, onSubmit, initialValues }: ExpenseFormProps) {
  // Define our form with react-hook-form and zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      category: "Other",
      isRecurring: false,
      currency: "THB",
    },
  });
  
  // Update form values when initialValues changes
  useEffect(() => {
    if (initialValues) {
      form.reset({
        description: initialValues.description,
        amount: initialValues.amount,
        date: initialValues.date,
        category: initialValues.category,
        isRecurring: initialValues.isRecurring,
        recurrenceInterval: initialValues.recurrenceInterval,
        stopDate: initialValues.stopDate || null,
        currency: initialValues.currency || "THB",
      });
    } else {
      form.reset({
        description: "",
        amount: 0,
        date: new Date(),
        category: "Other",
        isRecurring: false,
        currency: "THB",
      });
    }
  }, [initialValues, form]);
  
  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as ExpenseFormValues);
    form.reset();
    onClose();
  };

  // Determine currency symbol based on selected currency
  const getCurrencySymbol = (currency: Currency) => {
    return CURRENCY_SYMBOLS[currency] || "฿";
  };

  // Determine dialog title based on whether we're editing or adding
  const dialogTitle = initialValues ? "Edit expense" : "Add new expense";
  const dialogDescription = initialValues 
    ? "Update the details of your expense." 
    : "Add a new expense to your tracker.";
  const submitButtonText = initialValues ? "Update Expense" : "Add Expense";
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Lunch, Groceries, etc." {...field} />
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
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                          {getCurrencySymbol(form.watch("currency"))}
                        </span>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01" 
                          className="pl-8" 
                          {...field}
                        />
                      </div>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="THB">
                          <div className="flex items-center">
                            <span className="mr-2">฿</span>
                            <span>Thai Baht (THB)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="USD">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>US Dollar (USD)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EUR">
                          <div className="flex items-center">
                            <Euro className="h-4 w-4 mr-2" />
                            <span>Euro (EUR)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="flex items-center">
                          <div className="flex items-center">
                            <CategoryBadge category={category} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Recurring Expense</FormLabel>
                    <FormDescription>
                      This expense repeats on a regular basis.
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
            
            {form.watch("isRecurring") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recurrenceInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormLabel>Stop Date (Optional)</FormLabel>
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
                              {field.value && isValid(field.value) ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                              <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-2 flex justify-between border-b">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => field.onChange(null)}
                            >
                              Clear
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            fromDate={new Date()} // Only future dates
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        When this recurring expense should stop.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" /> {submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
