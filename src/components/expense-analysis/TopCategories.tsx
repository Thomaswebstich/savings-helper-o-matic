
import { useMemo } from 'react';
import { CategoryBadge } from '../CategoryBadge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, formatCurrency, Currency, convertCurrency } from '@/lib/data';

interface TopCategoriesProps {
  categoryData: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    budget?: number;
    percentage: number;
    color?: string;
  }>;
  filteredExpenses: Expense[];
  currency: Currency;
}

export function TopCategories({ 
  categoryData, 
  filteredExpenses, 
  currency 
}: TopCategoriesProps) {
  
  // Calculate category totals for the filtered expenses
  const categoryTotals = useMemo(() => {
    if (filteredExpenses.length === 0) return [];
    
    const categoryMap = new Map<string, {
      id: string;
      name: string;
      total: number;
      color?: string;
    }>();
    
    // Group by category and sum
    filteredExpenses.forEach(expense => {
      const categoryId = expense.categoryId || 'uncategorized';
      let categoryName = 'Uncategorized';
      let color: string | undefined;
      
      // Extract information from category object if available
      if (expense.category && typeof expense.category === 'object' && expense.category !== null) {
        // Safely access name property with type guard
        if ('name' in expense.category && typeof expense.category.name === 'string') {
          categoryName = expense.category.name;
        }
        
        // Explicitly check for color property in the category object
        if ('color' in expense.category && typeof expense.category.color === 'string') {
          color = expense.category.color;
        }
      } else if (typeof expense.category === 'string') {
        categoryName = expense.category;
      }
      
      // Try to get color from categoryData if not available from expense
      if (!color) {
        const categoryInfo = categoryData.find(c => c.categoryId === categoryId);
        color = categoryInfo?.color;
      }
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          total: 0,
          color: color
        });
      }
      
      const entry = categoryMap.get(categoryId)!;
      entry.total += convertCurrency(expense.amount, expense.currency || "THB", currency);
    });
    
    // Calculate total spending for percentages
    const totalSpending = filteredExpenses.reduce((sum, expense) => 
      sum + convertCurrency(expense.amount, expense.currency || "THB", currency), 0);
    
    // Convert to array, add percentage, and sort
    return Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        percentage: (category.total / totalSpending) * 100
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses, categoryData, currency]);
  
  // Get category color with fallbacks
  const getCategoryColor = (categoryId: string, index: number): string => {
    const colors = [
      "#0ea5e9", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#94a3b8"  // slate
    ];
    
    // First try to find color in categoryData (from the categoryTotals we calculated)
    const categoryInfo = categoryTotals.find(c => c.id === categoryId);
    if (categoryInfo?.color) return categoryInfo.color;
    
    // Then try in the provided categoryData
    const providedCategoryInfo = categoryData.find(c => c.categoryId === categoryId);
    if (providedCategoryInfo?.color) return providedCategoryInfo.color;
    
    // Use index or hash the category ID for consistent color
    return colors[index % colors.length];
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Top Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categoryTotals.slice(0, 5).map((category, index) => (
          <div key={category.id}>
            <div className="flex justify-between items-center mb-1">
              <CategoryBadge 
                category={category.name} 
                className="mr-2 text-xs py-0.5 px-1.5"
              />
              <span className="text-sm font-medium">{formatCurrency(category.total, currency)}</span>
            </div>
            <Progress 
              value={category.percentage} 
              className="h-1.5"
              indicatorColor={category.color || getCategoryColor(category.id, index)}
            />
          </div>
        ))}
        
        {categoryTotals.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-2">
            No expense data for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
