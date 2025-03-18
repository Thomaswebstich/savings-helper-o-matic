
import { useState, useEffect } from 'react';
import { Expense, Category, CategoryBudget, CategoryTotal } from '@/lib/types';
import { calculateCategoryTotals } from '@/lib/category/calculation';

export function useCategoryTotals(
  expenses: Expense[],
  categories: Category[],
  budgets: CategoryBudget[]
) {
  const [categoryData, setCategoryData] = useState<CategoryTotal[]>([]);

  useEffect(() => {
    const updateCategoryData = async () => {
      if (expenses.length === 0 || categories.length === 0) {
        setCategoryData([]);
        return;
      }
      
      try {
        // Get category totals from the utility
        const data = await calculateCategoryTotals(expenses, categories, budgets);
        
        // Create a map for easy lookup of display order
        const categoryOrderMap = new Map<string, number>();
        categories.forEach(cat => {
          categoryOrderMap.set(cat.id, cat.displayOrder ?? 999);
        });
        
        // Add displayOrder to each category in the data if not already there
        const enhancedData = data.map(cat => ({
          ...cat,
          displayOrder: cat.displayOrder ?? categoryOrderMap.get(cat.categoryId) ?? 999
        }));
        
        // Sort by display order first, then by amount
        enhancedData.sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return b.amount - a.amount;
        });
        
        setCategoryData(enhancedData);
      } catch (error) {
        console.error('Error calculating category totals:', error);
        setCategoryData([]);
      }
    };
    
    updateCategoryData();
  }, [expenses, categories, budgets]);

  return categoryData;
}
