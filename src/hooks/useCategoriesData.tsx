
import { useState, useEffect } from 'react';
import { Category, CategoryBudget, fetchCategories, fetchCategoryBudgets } from '@/lib/data';

export function useCategoriesData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        
        const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const budgetsData = await fetchCategoryBudgets(currentMonth);
        setBudgets(budgetsData);
      } catch (error) {
        console.error('Error fetching categories or budgets:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const refreshCategoryData = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      
      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const budgetsData = await fetchCategoryBudgets(currentMonth);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error refreshing category data:', error);
    }
  };

  return {
    categories,
    budgets,
    categoryData,
    setCategoryData,
    refreshCategoryData,
    isLoading
  };
}
