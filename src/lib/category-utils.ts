
import { supabase } from "@/integrations/supabase/client";
import { Category, CategoryBudget, Expense, CategoryTotal } from './types';
import { convertCurrency } from './currency-utils';

export const CATEGORY_ICONS = [
  "home", "car", "utensils", "plug", "shield", "heart-pulse", 
  "piggy-bank", "user", "tv", "briefcase", "gift", "book",
  "coffee", "shopping-bag", "plane", "wifi", "phone", "umbrella",
  "school", "music", "credit-card", "more-horizontal"
];

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  return data || [];
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
    
  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }
  
  return data;
};

export const updateCategory = async (id: string, changes: Partial<Omit<Category, 'id'>>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(changes)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
  
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

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
    currency: item.currency,
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

export const calculateCategoryTotals = async (
  expenses: Expense[],
  categories: Category[],
  budgets: CategoryBudget[] = []
): Promise<CategoryTotal[]> => {
  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));
  
  const budgetMap = new Map<string, number>();
  budgets.forEach(budget => budgetMap.set(budget.categoryId, budget.amount));
  
  const totalExpenses = expenses.reduce((sum, exp) => {
    const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
    return sum + amountInTHB;
  }, 0);
  
  const categoryTotals = new Map<string, { amount: number, name: string, color: string }>();
  
  expenses.forEach(expense => {
    if (!expense.categoryId) return;
    
    const category = categoryMap.get(expense.categoryId);
    if (!category) return;
    
    const amountInTHB = convertCurrency(expense.amount, expense.currency, "THB");
    
    if (categoryTotals.has(expense.categoryId)) {
      const current = categoryTotals.get(expense.categoryId)!;
      categoryTotals.set(expense.categoryId, { 
        ...current,
        amount: current.amount + amountInTHB
      });
    } else {
      categoryTotals.set(expense.categoryId, { 
        amount: amountInTHB,
        name: category.name,
        color: category.color
      });
    }
  });
  
  const result: CategoryTotal[] = [];
  
  categoryTotals.forEach((value, categoryId) => {
    const percentage = totalExpenses > 0 ? (value.amount / totalExpenses) * 100 : 0;
    const budget = budgetMap.get(categoryId);
    
    result.push({
      categoryId,
      categoryName: value.name,
      amount: value.amount,
      percentage,
      budget,
      color: value.color
    });
  });
  
  return result.sort((a, b) => b.amount - a.amount);
};
