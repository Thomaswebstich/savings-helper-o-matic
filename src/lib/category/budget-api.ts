
import { supabase } from "@/integrations/supabase/client";
import { CategoryBudget, Currency } from '../types';

export const fetchCategoryBudgets = async (month?: string): Promise<CategoryBudget[]> => {
  let query = supabase
    .from('category_budgets')
    .select('*');
    
  if (month) {
    query = query.eq('month', month);
  }
  
  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching category budgets:', error);
    throw error;
  }
  
  return data.map(item => ({
    id: item.id,
    categoryId: item.category_id,
    amount: Number(item.amount),
    currency: item.currency as Currency, // Type cast to Currency type
    month: item.month
  })) || [];
};

export const setCategoryBudget = async (budget: Omit<CategoryBudget, 'id'>): Promise<CategoryBudget> => {
  const { data: existingBudget } = await supabase
    .from('category_budgets')
    .select('id')
    .eq('category_id', budget.categoryId)
    .eq('month', budget.month)
    .maybeSingle();
    
  let result;
  
  if (existingBudget) {
    const { data, error } = await supabase
      .from('category_budgets')
      .update({
        amount: budget.amount,
        currency: budget.currency,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingBudget.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating category budget:', error);
      throw error;
    }
    
    result = data;
  } else {
    const { data, error } = await supabase
      .from('category_budgets')
      .insert({
        category_id: budget.categoryId,
        amount: budget.amount,
        currency: budget.currency,
        month: budget.month
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding category budget:', error);
      throw error;
    }
    
    result = data;
  }
  
  return {
    id: result.id,
    categoryId: result.category_id,
    amount: Number(result.amount),
    currency: result.currency,
    month: result.month
  };
};

export const deleteCategoryBudget = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('category_budgets')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting category budget:', error);
    throw error;
  }
};
