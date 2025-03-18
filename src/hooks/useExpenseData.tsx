
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense, Category } from '@/lib/data';
import { toast } from '@/hooks/use-toast';

export function useExpenseData() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const { data: expensesData, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (expensesData && expensesData.length > 0) {
          const transformedExpenses: Expense[] = expensesData.map(item => ({
            id: item.id,
            description: item.description,
            amount: Number(item.amount),
            date: new Date(item.date),
            categoryId: item.category_id || '',
            category: item.category,
            isRecurring: item.is_recurring || false,
            recurrenceInterval: item.recurrence_interval as any,
            stopDate: item.stop_date ? new Date(item.stop_date) : undefined,
            currency: item.currency as any || 'THB',
            // We don't store these in the database yet, but we could
            // receiptImage: item.receipt_image,
            // receiptThumbnail: item.receipt_thumbnail,
          }));
          
          const sortedExpenses = transformedExpenses.sort((a, b) => 
            b.date.getTime() - a.date.getTime()
          );
          
          setExpenses(sortedExpenses);
        } else {
          console.log("No expenses found in database");
          setExpenses([]);
          toast({
            title: "No expenses found",
            description: "Add your first expense to get started",
          });
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: "Error",
          description: "Failed to load expenses. Please try again later.",
          variant: "destructive"
        });
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchExpenses();
  }, []);

  return {
    expenses,
    setExpenses,
    isLoading
  };
}
