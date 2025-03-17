
import { useState } from 'react';
import { MonthlyTotal, CategoryTotal, formatCurrency, Currency, convertCurrency, CURRENCY_SYMBOLS } from '@/lib/data';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis
} from 'recharts';
import { CategoryBadge } from './CategoryBadge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface FinancialChartsProps {
  monthlyData: MonthlyTotal[];
  categoryData: CategoryTotal[];
  onTimeRangeChange?: (range: { monthsBack: number, monthsForward: number }) => void;
  displayCurrency?: Currency;
}

export function FinancialCharts({ 
  monthlyData, 
  categoryData,
  onTimeRangeChange,
  displayCurrency = "THB"
}: FinancialChartsProps) {
  const [visibleMonths, setVisibleMonths] = useState({
    start: Math.max(0, monthlyData.length - 6),
    end: monthlyData.length
  });
  
  const [timeRange, setTimeRange] = useState({
    monthsBack: 6,
    monthsForward: 3
  });
  
  // Convert data to the display currency
  const convertedMonthlyData = monthlyData.map(item => ({
    ...item,
    income: convertCurrency(item.income, "THB", displayCurrency),
    expenses: convertCurrency(item.expenses, "THB", displayCurrency),
    savings: convertCurrency(item.savings, "THB", displayCurrency)
  }));
  
  // Convert category data to the display currency
  const convertedCategoryData = categoryData.map(item => ({
    ...item,
    amount: convertCurrency(item.amount, "THB", displayCurrency),
    budget: item.budget ? convertCurrency(item.budget, "THB", displayCurrency) : undefined
  }));
  
  // Slice the data for the visible range
  const visibleData = convertedMonthlyData.slice(visibleMonths.start, visibleMonths.end);
  
  // Top 5 categories for pie chart (rest grouped as "Other")
  const pieData = [...convertedCategoryData]
    .filter(category => category.amount > 0)
    .slice(0, 5);
  
  // Sum of remaining categories
  const otherAmount = convertedCategoryData
    .slice(5)
    .reduce((sum, category) => sum + category.amount, 0);
  
  // If there are more than 5 categories with amounts, add "Other"
  if (otherAmount > 0) {
    pieData.push({
      categoryId: "Other",
      categoryName: "Other",
      amount: otherAmount,
      budget: undefined, // Add the budget property (undefined for "Other")
      percentage: convertedCategoryData
        .slice(5)
        .reduce((sum, category) => sum + category.percentage, 0),
      color: '#94a3b8' // Gray color for "Other"
    });
  }
  
  // Handle previous/next navigation for months
  const showPrevious = () => {
    if (visibleMonths.start > 0) {
      setVisibleMonths({
        start: visibleMonths.start - 1,
        end: visibleMonths.end - 1
      });
    }
  };
  
  const showNext = () => {
    if (visibleMonths.end < convertedMonthlyData.length) {
      setVisibleMonths({
        start: visibleMonths.start + 1,
        end: visibleMonths.end + 1
      });
    }
  };
  
  // Zoom time range
  const zoomIn = () => {
    if (timeRange.monthsBack > 3) {
      const newRange = {
        monthsBack: timeRange.monthsBack - 1,
        monthsForward: timeRange.monthsForward
      };
      setTimeRange(newRange);
      if (onTimeRangeChange) {
        onTimeRangeChange(newRange);
      }
    }
  };
  
  const zoomOut = () => {
    if (timeRange.monthsBack < 12) {
      const newRange = {
        monthsBack: timeRange.monthsBack + 1,
        monthsForward: timeRange.monthsForward
      };
      setTimeRange(newRange);
      if (onTimeRangeChange) {
        onTimeRangeChange(newRange);
      }
    }
  };
  
  // Adjust projection months
  const adjustProjection = (change: number) => {
    if (timeRange.monthsForward + change >= 1 && timeRange.monthsForward + change <= 12) {
      const newRange = {
        monthsBack: timeRange.monthsBack,
        monthsForward: timeRange.monthsForward + change
      };
      setTimeRange(newRange);
      if (onTimeRangeChange) {
        onTimeRangeChange(newRange);
      }
    }
  };
  
  // Format the tooltip values
  const formatTooltipValue = (value: number) => {
    return formatCurrency(value, displayCurrency);
  };
  
  // Determine if we have any projected months
  const hasFutureData = monthlyData.length > 0 && new Date().getMonth() !== new Date(visibleData[visibleData.length - 1].month).getMonth();

  return (
    <div className="glass-card space-y-4 p-6 animate-slide-up">
      <Tabs defaultValue="income-expenses">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="income-expenses">Income & Expenses</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center mr-4 text-xs text-muted-foreground">
              <span>Historical: {timeRange.monthsBack} months</span>
              <span className="mx-1">|</span>
              <span>Projected: {timeRange.monthsForward} months</span>
            </div>
            
            <div className="flex items-center space-x-1 mr-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={zoomIn}
                title="Show fewer months"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={zoomOut}
                title="Show more months"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => adjustProjection(-1)}
                disabled={timeRange.monthsForward <= 1}
                title="Decrease projection months"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => adjustProjection(1)}
                disabled={timeRange.monthsForward >= 12}
                title="Increase projection months"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="ml-2 flex items-center space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={showPrevious}
                disabled={visibleMonths.start <= 0}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={showNext}
                disabled={visibleMonths.end >= convertedMonthlyData.length}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
          
        <TabsContent value="income-expenses" className="pt-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${CURRENCY_SYMBOLS[displayCurrency]}${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Income" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Expenses" 
                  stroke="#f43f5e" 
                  fillOpacity={1} 
                  fill={hasFutureData ? "url(#projectedGradient)" : "url(#expenseGradient)"}
                  strokeDasharray={hasFutureData ? "4 4" : "0"}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {hasFutureData && (
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <hr className="w-4 border-dashed border-muted-foreground" />
              <span className="mx-2">Dashed line indicates projected expenses</span>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="savings" className="pt-4">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${CURRENCY_SYMBOLS[displayCurrency]}${value}`}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Bar 
                  dataKey="savings" 
                  name="Savings" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                >
                  {visibleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.savings < 0 ? "#f43f5e" : "#10b981"} 
                      opacity={hasFutureData && index >= visibleData.length - timeRange.monthsForward ? 0.7 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {hasFutureData && (
            <div className="text-xs text-muted-foreground mt-2 flex items-center">
              <div className="w-4 h-3 bg-green-500 opacity-70 rounded-sm mr-2" />
              <span>Lighter bars indicate projected savings</span>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="categories" className="pt-4">
          <div className="h-[300px] grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="categoryName"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => {
                    // Generate colors based on category
                    const colors = [
                      "#0ea5e9", // blue
                      "#10b981", // green
                      "#f59e0b", // orange
                      "#8b5cf6", // purple
                      "#ec4899", // pink
                      "#94a3b8"  // gray (for Other)
                    ];
                    
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                      />
                    );
                  })}
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
              <h3 className="text-sm font-medium mb-3">Top Categories</h3>
              <div className="space-y-3">
                {convertedCategoryData.slice(0, 5).map(category => (
                  <div key={category.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CategoryBadge category={category.categoryName} className="mr-2" />
                      <span>{formatCurrency(category.amount, displayCurrency)}</span>
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
      </Tabs>
    </div>
  );
}
