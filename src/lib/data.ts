import { addDays, format, subDays, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export type Currency = "THB" | "USD" | "EUR";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type CategoryBudget = {
  id: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  month: string; // Format: "MMM yyyy" (e.g., "Jan 2023")
};

export type IncomeSource = {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
};

export type Expense = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  category?: string; // For backward compatibility
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  stopDate?: Date;
  currency: Currency;
  isProjection?: boolean; // Flag to identify projected recurring expenses
};

export type MonthlyTotal = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
};

export type CategoryTotal = {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  budget?: number;
  color: string;
};

export const EXCHANGE_RATES: Record<Currency, number> = {
  THB: 1,      // Base currency
  USD: 0.028,  // 1 THB = 0.028 USD
  EUR: 0.026   // 1 THB = 0.026 EUR
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  THB: "฿",
  USD: "$",
  EUR: "€"
};

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
    currency: item.currency as Currency,
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
    currency: result.currency as Currency,
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

export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const amountInTHB = fromCurrency === "THB" ? amount : amount / EXCHANGE_RATES[fromCurrency];
  
  return toCurrency === "THB" ? amountInTHB : amountInTHB * EXCHANGE_RATES[toCurrency];
};

export const calculateTotalMonthlyIncome = (incomeSources: IncomeSource[]): number => {
  return incomeSources.reduce((total, income) => {
    const amountInTHB = convertCurrency(income.amount, income.currency, "THB");
    
    if (income.isRecurring && income.recurrenceInterval === "monthly") {
      return total + amountInTHB;
    }
    
    return total;
  }, 0);
};

export const calculateMonthlyTotals = (
  expenses: Expense[],
  incomeSources: IncomeSource[],
  monthsBack = 6, 
  monthsForward = 3
): MonthlyTotal[] => {
  const result: MonthlyTotal[] = [];
  const currentDate = new Date();
  
  for (let i = monthsBack; i >= 0; i--) {
    const currentMonth = subMonths(currentDate, i);
    const monthStr = format(currentMonth, "MMM yyyy");
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth.getMonth() && 
             expDate.getFullYear() === currentMonth.getFullYear();
    });
    
    const totalExpenses = monthExpenses.reduce((sum, exp) => {
      const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
      return sum + amountInTHB;
    }, 0);
    
    const monthlyIncome = calculateTotalMonthlyIncome(incomeSources);
    
    const savings = monthlyIncome - totalExpenses;
    
    result.push({
      month: monthStr,
      income: monthlyIncome,
      expenses: totalExpenses,
      savings: savings
    });
  }
  
  for (let i = 1; i <= monthsForward; i++) {
    const futureMonth = addDays(currentDate, i * 30);
    const monthStr = format(futureMonth, "MMM yyyy");
    const monthStart = new Date(futureMonth.getFullYear(), futureMonth.getMonth(), 1);
    const monthEnd = new Date(futureMonth.getFullYear(), futureMonth.getMonth() + 1, 0);
    
    let projectedExpenses = 0;
    
    expenses.forEach(expense => {
      if (!expense.isRecurring) return;
      
      const expenseDate = new Date(expense.date);
      const stopDate = expense.stopDate ? new Date(expense.stopDate) : null;
      
      if (stopDate && stopDate < monthStart) return;
      
      const amountInTHB = convertCurrency(expense.amount, expense.currency, "THB");
      
      switch (expense.recurrenceInterval) {
        case "daily":
          projectedExpenses += amountInTHB * 30;
          break;
          
        case "weekly":
          projectedExpenses += amountInTHB * 4.3;
          break;
          
        case "monthly":
          projectedExpenses += amountInTHB;
          break;
          
        case "yearly":
          if (expenseDate.getMonth() === futureMonth.getMonth()) {
            projectedExpenses += amountInTHB;
          }
          break;
          
        default:
          projectedExpenses += amountInTHB;
      }
    });
    
    const pastMonths = result.slice(-3);
    const avgNonRecurring = pastMonths.length > 0 
      ? pastMonths.reduce((sum, month) => {
          const recurringForMonth = expenses
            .filter(exp => 
              exp.isRecurring && 
              new Date(exp.date) <= new Date(month.month) &&
              (!exp.stopDate || new Date(exp.stopDate) >= new Date(month.month))
            )
            .reduce((total, exp) => {
              const amountInTHB = convertCurrency(exp.amount, exp.currency, "THB");
              return total + amountInTHB;
            }, 0);
            
          return sum + Math.max(0, month.expenses - recurringForMonth);
        }, 0) / pastMonths.length
      : 0;
      
    projectedExpenses += avgNonRecurring;
    
    const monthlyIncome = calculateTotalMonthlyIncome(incomeSources);
    
    const projectedSavings = monthlyIncome - projectedExpenses;
    
    result.push({
      month: monthStr,
      income: monthlyIncome,
      expenses: projectedExpenses,
      savings: projectedSavings
    });
  }
  
  return result;
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

export const formatCurrency = (amount: number, currency: Currency = "THB"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === "THB" ? 0 : 2,
    maximumFractionDigits: currency === "THB" ? 0 : 2
  }).format(amount);
};
