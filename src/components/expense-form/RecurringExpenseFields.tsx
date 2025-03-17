
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { ExpenseFormValues } from './types';

interface RecurringExpenseFieldsProps {
  form: UseFormReturn<ExpenseFormValues>;
}

export function RecurringExpenseFields({ form }: RecurringExpenseFieldsProps) {
  const isRecurring = form.watch('isRecurring');

  return (
    <>
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
      
      {isRecurring && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="recurrenceInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence Interval</FormLabel>
                <Select 
                  onValueChange={field.onChange}
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
                          format(new Date(field.value), "PPP")
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Create a new date with noon time to avoid timezone issues
                          const adjustedDate = new Date(date);
                          adjustedDate.setHours(12, 0, 0, 0);
                          console.log("Stop date selected:", adjustedDate);
                          field.onChange(adjustedDate);
                        }
                      }}
                      disabled={(date) => {
                        const currentDate = form.getValues('date');
                        return date < (currentDate ? new Date(currentDate) : new Date());
                      }}
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
    </>
  );
}
