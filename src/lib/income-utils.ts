
import { supabase } from "@/integrations/supabase/client";
import { IncomeSource, Currency } from './types';
import { convertCurrency } from './currency-utils';

export const fetchIncomeSources = async (): Promise<IncomeSource[]> => {
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching income sources:', error);
    throw error;
  }
  
  return data.map(item => ({
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    currency: item.currency as Currency,
    isRecurring: item.is_recurring,
    recurrenceInterval: item.recurrence_interval as any,
    startDate: new Date(item.start_date),
    endDate: item.end_date ? new Date(item.end_date) : undefined
  })) || [];
};

export const addIncomeSource = async (income: Omit<IncomeSource, 'id'>): Promise<IncomeSource> => {
  const { data, error } = await supabase
    .from('income_sources')
    .insert({
      description: income.description,
      amount: income.amount,
      currency: income.currency,
      is_recurring: income.isRecurring,
      recurrence_interval: income.recurrenceInterval,
      start_date: income.startDate.toISOString().split('T')[0],
      end_date: income.endDate ? income.endDate.toISOString().split('T')[0] : null
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding income source:', error);
    throw error;
  }
  
  return {
    id: data.id,
    description: data.description,
    amount: Number(data.amount),
    currency: data.currency as Currency,
    isRecurring: data.is_recurring,
    recurrenceInterval: data.recurrence_interval as any,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined
  };
};

export const updateIncomeSource = async (id: string, changes: Partial<Omit<IncomeSource, 'id'>>): Promise<IncomeSource> => {
  const updatePayload: any = {};
  
  if (changes.description !== undefined) updatePayload.description = changes.description;
  if (changes.amount !== undefined) updatePayload.amount = changes.amount;
  if (changes.currency !== undefined) updatePayload.currency = changes.currency;
  if (changes.isRecurring !== undefined) updatePayload.is_recurring = changes.isRecurring;
  if (changes.recurrenceInterval !== undefined) updatePayload.recurrence_interval = changes.recurrenceInterval;
  
  if (changes.startDate !== undefined) {
    updatePayload.start_date = changes.startDate instanceof Date 
      ? changes.startDate.toISOString().split('T')[0] 
      : changes.startDate;
  }
  
  if (changes.endDate !== undefined) {
    updatePayload.end_date = changes.endDate instanceof Date 
      ? changes.endDate.toISOString().split('T')[0] 
      : changes.endDate;
  }
  
  updatePayload.updated_at = new Date().toISOString();
  
  console.log(`Updating income source ${id} with:`, updatePayload);
  
  const { data, error } = await supabase
    .from('income_sources')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating income source:', error);
    throw error;
  }
  
  return {
    id: data.id,
    description: data.description,
    amount: Number(data.amount),
    currency: data.currency as Currency,
    isRecurring: data.is_recurring,
    recurrenceInterval: data.recurrence_interval as any,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined
  };
};

export const deleteIncomeSource = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting income source:', error);
    throw error;
  }
};

export const calculateTotalMonthlyIncome = (incomeSources: IncomeSource[]): number => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  return incomeSources.reduce((total, income) => {
    // Skip if income hasn't started yet or has already ended
    const startDate = new Date(income.startDate);
    const endDate = income.endDate ? new Date(income.endDate) : null;
    
    if (startDate > currentDate || (endDate && endDate < currentDate)) {
      return total;
    }
    
    const amountInTHB = convertCurrency(income.amount, income.currency, "THB");
    
    if (income.isRecurring) {
      if (income.recurrenceInterval === "monthly") {
        return total + amountInTHB;
      } else if (income.recurrenceInterval === "daily") {
        return total + (amountInTHB * 30);
      } else if (income.recurrenceInterval === "weekly") {
        return total + (amountInTHB * 4.3);
      } else if (income.recurrenceInterval === "yearly" && startDate.getMonth() === currentMonth) {
        return total + amountInTHB;
      }
    } else {
      // One-time income that falls in the current month
      if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
        return total + amountInTHB;
      }
    }
    
    return total;
  }, 0);
};
