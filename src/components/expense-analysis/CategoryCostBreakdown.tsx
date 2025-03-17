
import { useMemo } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Expense, Currency } from '@/lib/data';
import { calculateCategoryBreakdown } from './utils/category-breakdown-utils';
import { CategoryPeriodBreakdown } from './components/CategoryPeriodBreakdown';

interface CategoryCostBreakdownProps {
  filteredExpenses: Expense[];
  currency: Currency;
}

export function CategoryCostBreakdown({ 
  filteredExpenses, 
  currency 
}: CategoryCostBreakdownProps) {
  
  // Calculate category data
  const { categoryData, totalAmount, timePeriodStats } = useMemo(() => 
    calculateCategoryBreakdown(filteredExpenses, currency), 
    [filteredExpenses, currency]
  );
  
  return (
    <>
      <TabsContent value="daily" className="mt-3">
        <div className="text-sm font-medium mb-2">Daily Cost by Category</div>
        <CategoryPeriodBreakdown 
          categoryData={categoryData}
          divisor={timePeriodStats.days}
          period="daily"
          currency={currency}
        />
      </TabsContent>
      
      <TabsContent value="weekly" className="mt-3">
        <div className="text-sm font-medium mb-2">Weekly Cost by Category</div>
        <CategoryPeriodBreakdown 
          categoryData={categoryData}
          divisor={timePeriodStats.weeks}
          period="weekly"
          currency={currency}
        />
      </TabsContent>
      
      <TabsContent value="monthly" className="mt-3">
        <div className="text-sm font-medium mb-2">Monthly Cost by Category</div>
        <CategoryPeriodBreakdown 
          categoryData={categoryData}
          divisor={timePeriodStats.months}
          period="monthly"
          currency={currency}
        />
      </TabsContent>
    </>
  );
}
