
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Currency, CURRENCY_SYMBOLS, MonthlyTotal } from '@/lib/data';
import { ChartControls } from "@/components/charts/ChartControls";
import { Label } from '@/components/ui/label';

interface IncomeExpensesCompactChartProps {
  monthlyData: MonthlyTotal[];
  displayCurrency: Currency;
}

export function IncomeExpensesCompactChart({ 
  monthlyData,
  displayCurrency 
}: IncomeExpensesCompactChartProps) {
  const [data, setData] = useState<Array<{ date: string; month: string; income: number; expenses: number; savings: number; isProjection: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSavings, setShowSavings] = useState(false);
  const [visibleMonths, setVisibleMonths] = useState({ start: 0, end: 0 });
  const [timeRange, setTimeRange] = useState({ monthsBack: 6, monthsForward: 3 });
  
  // Transform data when monthlyData changes
  useEffect(() => {
    setIsLoading(true);
    
    if (monthlyData.length > 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const transformedData = monthlyData.map((month, index) => {
        // Parse the month string to get a proper date
        const [monthName, yearStr] = month.month.split(' ');
        const date = new Date(`${monthName} 1, ${yearStr}`);
        
        // Determine if this is a projection (future month)
        const isProjection = (date.getFullYear() > currentYear) || 
                             (date.getFullYear() === currentYear && date.getMonth() > currentMonth);
        
        return {
          date: date.toISOString().split('T')[0],
          month: month.month,
          income: month.income,
          expenses: month.expenses,
          savings: month.savings,
          isProjection
        };
      });
      
      setData(transformedData);
      
      // Initialize visible months range - include more future months by default
      const historyCount = Math.min(transformedData.length - timeRange.monthsForward, timeRange.monthsBack);
      const start = Math.max(0, transformedData.length - timeRange.monthsForward - historyCount);
      const end = Math.min(transformedData.length, start + historyCount + timeRange.monthsForward);
      
      setVisibleMonths({ start, end });
      
      setIsLoading(false);
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [monthlyData, timeRange.monthsBack, timeRange.monthsForward]);
  
  // Handle chart navigation
  const handleShowPrevious = () => {
    if (visibleMonths.start > 0) {
      setVisibleMonths(prev => ({
        start: Math.max(0, prev.start - 1),
        end: Math.max(timeRange.monthsBack, prev.end - 1)
      }));
    }
  };
  
  const handleShowNext = () => {
    if (visibleMonths.end < data.length) {
      setVisibleMonths(prev => ({
        start: prev.start + 1,
        end: Math.min(data.length, prev.end + 1)
      }));
    }
  };
  
  const handleZoomIn = () => {
    if (timeRange.monthsBack > 3) {
      const newMonthsBack = Math.max(3, timeRange.monthsBack - 3);
      setTimeRange(prev => ({ ...prev, monthsBack: newMonthsBack }));
      
      // Adjust visible months
      const end = Math.min(data.length, visibleMonths.end);
      const start = Math.max(0, end - newMonthsBack - timeRange.monthsForward);
      setVisibleMonths({ start, end });
    }
  };
  
  const handleZoomOut = () => {
    if (timeRange.monthsBack < 12) {
      const newMonthsBack = Math.min(12, timeRange.monthsBack + 3);
      setTimeRange(prev => ({ ...prev, monthsBack: newMonthsBack }));
      
      // Adjust visible months
      const end = Math.min(data.length, visibleMonths.end);
      const start = Math.max(0, end - newMonthsBack - timeRange.monthsForward);
      setVisibleMonths({ start, end });
    }
  };

  // Handle time period change
  const handlePeriodChange = (value: string) => {
    if (!value) return;
    
    const period = parseInt(value);
    if (isNaN(period)) return;
    
    setTimeRange(prev => ({ ...prev, monthsBack: period }));
    
    // Adjust visible months
    const end = Math.min(data.length, data.length);
    const start = Math.max(0, end - period - timeRange.monthsForward);
    setVisibleMonths({ start, end });
  };
  
  // Handle projection adjustment
  const handleAdjustProjection = (change: number) => {
    const newMonthsForward = Math.max(1, Math.min(12, timeRange.monthsForward + change));
    
    if (newMonthsForward === timeRange.monthsForward) return;
    
    setTimeRange(prev => ({ ...prev, monthsForward: newMonthsForward }));
    
    // Adjust visible months when changing projection
    const totalVisibleMonths = visibleMonths.end - visibleMonths.start;
    const newEnd = Math.min(data.length, visibleMonths.start + totalVisibleMonths + (change > 0 ? change : 0));
    const newStart = Math.max(0, newEnd - totalVisibleMonths - (change > 0 ? change : 0));
    
    setVisibleMonths({ start: newStart, end: newEnd });
  };
  
  if (isLoading) {
    return (
      <Card className="h-[300px] w-full">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-sm">Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-[260px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Get visible data based on current range
  const visibleData = data.slice(visibleMonths.start, visibleMonths.end);
  
  // Calculate current month income & expenses if available
  const currentData = visibleData.length > 0 ? visibleData[visibleData.length - 1] : { income: 0, expenses: 0, savings: 0 };
  
  // Calculate percent change from previous month
  const prevData = visibleData.length > 1 ? visibleData[visibleData.length - 2] : null;
  const incomeChange = prevData && prevData.income ? ((currentData.income - prevData.income) / prevData.income) * 100 : 0;
  const expenseChange = prevData && prevData.expenses ? ((currentData.expenses - prevData.expenses) / prevData.expenses) * 100 : 0;
  const savingsChange = prevData && prevData.savings ? ((currentData.savings - prevData.savings) / prevData.savings) * 100 : 0;
  
  const isIncomePositive = incomeChange >= 0;
  const isExpensePositive = expenseChange <= 0; // Expenses going down is positive
  const isSavingsPositive = savingsChange >= 0;
  
  // Count projected months
  const projectedMonthsCount = visibleData.filter(d => d.isProjection).length;
  
  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-sm">
            Income & Expenses {projectedMonthsCount > 0 && `(Including ${projectedMonthsCount} Future Months)`}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-savings" 
                checked={showSavings} 
                onCheckedChange={setShowSavings} 
              />
              <Label htmlFor="show-savings" className="text-xs">Show Savings</Label>
            </div>
            
            <ToggleGroup type="single" value={timeRange.monthsBack.toString()} onValueChange={handlePeriodChange}>
              <ToggleGroupItem value="3" size="sm" className="text-xs px-2 h-7">3M</ToggleGroupItem>
              <ToggleGroupItem value="6" size="sm" className="text-xs px-2 h-7">6M</ToggleGroupItem>
              <ToggleGroupItem value="12" size="sm" className="text-xs px-2 h-7">12M</ToggleGroupItem>
            </ToggleGroup>
            
            <ChartControls
              timeRange={timeRange}
              visibleMonths={visibleMonths}
              totalDataLength={data.length}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onShowPrevious={handleShowPrevious}
              onShowNext={handleShowNext}
              onAdjustProjection={handleAdjustProjection}
            />
          </div>
          
          <div className="flex flex-col items-end text-xs w-full md:w-auto">
            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="flex items-center gap-1">
                <span className="text-blue-500">Income:</span>
                <span>{`${CURRENCY_SYMBOLS[displayCurrency]}${Math.round(currentData.income).toLocaleString()}`}</span>
                {incomeChange !== 0 && (
                  <span className={isIncomePositive ? "text-green-500" : "text-red-500"}>
                    {isIncomePositive ? "+" : ""}{Math.round(incomeChange)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-rose-500">Expenses:</span>
                <span>{`${CURRENCY_SYMBOLS[displayCurrency]}${Math.round(currentData.expenses).toLocaleString()}`}</span>
                {expenseChange !== 0 && (
                  <span className={isExpensePositive ? "text-green-500" : "text-red-500"}>
                    {isExpensePositive ? "" : "+"}{Math.round(expenseChange)}%
                  </span>
                )}
              </div>
              {showSavings && (
                <div className="flex items-center gap-1">
                  <span className="text-green-500">Savings:</span>
                  <span>{`${CURRENCY_SYMBOLS[displayCurrency]}${Math.round(currentData.savings).toLocaleString()}`}</span>
                  {savingsChange !== 0 && (
                    <span className={isSavingsPositive ? "text-green-500" : "text-red-500"}>
                      {isSavingsPositive ? "+" : ""}{Math.round(savingsChange)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {showSavings ? (
            <ComposedChart
              data={visibleData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `${CURRENCY_SYMBOLS[displayCurrency]}${value}`}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${CURRENCY_SYMBOLS[displayCurrency]}${Number(value).toLocaleString()}`, 
                  name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings'
                ]}
                contentStyle={{ 
                  fontSize: '10px', 
                  padding: '4px 8px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload;
                  return `${label}${item?.isProjection ? ' (Projected)' : ''}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
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
                fill="url(#expenseGradient)"
              />
              <Bar 
                dataKey="savings" 
                name="Savings" 
                fill="#10b981" 
                fillOpacity={0.35}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          ) : (
            <AreaChart
              data={visibleData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(value) => `${CURRENCY_SYMBOLS[displayCurrency]}${value}`}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `${CURRENCY_SYMBOLS[displayCurrency]}${Number(value).toLocaleString()}`, 
                  name === 'income' ? 'Income' : 'Expenses'
                ]}
                contentStyle={{ 
                  fontSize: '10px', 
                  padding: '4px 8px',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload;
                  return `${label}${item?.isProjection ? ' (Projected)' : ''}`;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
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
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
