
import { useState, useEffect } from 'react';
import { Expense, Category, CategoryBudget, calculateCategoryTotals } from '@/lib/data';

export function useCategoryTotals(
  expenses: Expense[],
  categories: Category[],
  budgets: CategoryBudget[]
) {
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const updateCategoryData = async () => {
      if (expenses.length === 0 || categories.length === 0) {
        setCategoryData([]);
        return;
      }
      
      try {
        const data = await calculateCategoryTotals(expenses, categories, budgets);
        setCategoryData(data);
      } catch (error) {
        console.error('Error calculating category totals:', error);
        setCategoryData([]);
      }
    };
    
    updateCategoryData();
  }, [expenses, categories, budgets]);

  return categoryData;
}
