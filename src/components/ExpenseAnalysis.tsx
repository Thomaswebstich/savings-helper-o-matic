
import { useState, useMemo } from 'react';
import { Expense, CategoryTotal, formatCurrency, CATEGORIES, CATEGORY_COLORS, Currency } from '@/lib/data';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { CategoryBadge } from './CategoryBadge';
import { ChartLegendContent } from '@/components/ui/chart';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpenseAnalysisProps {
  expenses: Expense[];
  categoryData: CategoryTotal[];
  currency?: Currency;
}

export function ExpenseAnalysis({ expenses, categoryData, currency = "THB" }: ExpenseAnalysisProps) {
  const [timeFrame, setTimeFrame] = useState<string>("30");
  const [sortBy, setSortBy] = useState<string>("amount");
  
  // Filter expenses by selected time frame
  const filteredExpenses = useMemo(() => {
    const days = parseInt(timeFrame);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return expenses.filter(expense => new Date(expense.date) >= cutoffDate);
  }, [expenses, timeFrame]);
  
  // Calculate per-day, per-week, and per-month average
  const averages = useMemo(() => {
    const days = parseInt(timeFrame);
    if (days <= 0 || filteredExpenses.length === 0) return { daily: 0, weekly: 0, monthly: 0 };
    
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daily = total / days;
    
    return {
      daily,
      weekly: daily * 7,
      monthly: daily * 30,
    };
  }, [filteredExpenses, timeFrame]);
  
  // Calculate category breakdown for filtered expenses
  const filteredCategoryData = useMemo(() => {
    // Group by category
    const categoryMap = new Map<string, number>();
    
    filteredExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });
    
    // Calculate total
    const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
    
    // Create category data array
    const catData = CATEGORIES.map(category => {
      const amount = categoryMap.get(category) || 0;
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      
      return {
        category,
        amount,
        percentage
      };
    }).filter(cat => cat.amount > 0);
    
    // Sort based on selected sort method
    if (sortBy === "amount") {
      return catData.sort((a, b) => b.amount - a.amount);
    } else {
      return catData.sort((a, b) => a.category.localeCompare(b.category));
    }
  }, [filteredExpenses, sortBy]);
  
  // Calculate recurring vs one-time expense ratio
  const recurringVsOneTime = useMemo(() => {
    const recurring = filteredExpenses
      .filter(expense => expense.isRecurring)
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const oneTime = filteredExpenses
      .filter(expense => !expense.isRecurring)
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    return [
      { name: 'Recurring', value: recurring },
      { name: 'One-time', value: oneTime }
    ];
  }, [filteredExpenses]);
  
  // Format tooltip values
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value, currency);
  };
  
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Expense Analysis</h3>
        <div className="flex items-center gap-2">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">6 months</SelectItem>
              <SelectItem value="365">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">Daily Average</div>
          <div className="text-xl font-medium">{formatCurrency(averages.daily, currency)}</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">Weekly Average</div>
          <div className="text-xl font-medium">{formatCurrency(averages.weekly, currency)}</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-1">Monthly Average</div>
          <div className="text-xl font-medium">{formatCurrency(averages.monthly, currency)}</div>
        </div>
      </div>
      
      <Tabs defaultValue="category">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="recurring">Recurring vs One-time</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">By Amount</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="category" className="pt-4">
          <div className="h-[300px] grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer>
              <BarChart
                data={filteredCategoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value, currency)} />
                <YAxis type="category" dataKey="category" width={100} />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {filteredCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 25}, 70%, 60%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col justify-center">
              <h3 className="text-sm font-medium mb-3">Top Categories</h3>
              <div className="space-y-3">
                {filteredCategoryData.slice(0, 5).map(category => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryBadge category={category.category} className="mr-2" />
                      <span>{formatCurrency(category.amount, currency)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recurring" className="pt-4">
          <div className="h-[300px] grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={recurringVsOneTime}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  <Cell fill="#0ea5e9" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip 
                  formatter={formatTooltipValue} 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col justify-center">
              <h3 className="text-sm font-medium mb-3">Recurring vs One-time Expenses</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Recurring</span>
                  </div>
                  <div>{formatCurrency(recurringVsOneTime[0].value, currency)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span>One-time</span>
                  </div>
                  <div>{formatCurrency(recurringVsOneTime[1].value, currency)}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t mt-2">
                  <div className="font-medium">Total</div>
                  <div className="font-medium">
                    {formatCurrency(
                      recurringVsOneTime[0].value + recurringVsOneTime[1].value,
                      currency
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
