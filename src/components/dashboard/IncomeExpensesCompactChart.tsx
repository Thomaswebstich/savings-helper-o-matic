import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
  const [timeRange, setTimeRange] = useState({ monthsBack: 9, monthsForward: 12 });
  const [sliderPosition, setSliderPosition] = useState(0);
  const [visibleMonths, setVisibleMonths] = useState({ start: 0, end: 12 });
  
  useEffect(() => {
    setIsLoading(true);
    
    if (monthlyData.length > 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const transformedData = monthlyData.map((month, index) => {
        const [monthName, yearStr] = month.month.split(' ');
        const date = new Date(`${monthName} 1, ${yearStr}`);
        
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
      
      const currentMonthIndex = transformedData.findIndex(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      
      const initialPosition = currentMonthIndex >= 0 
        ? Math.max(0, Math.min(currentMonthIndex, transformedData.length - 12))
        : Math.max(0, transformedData.length - 12);
      
      setSliderPosition(initialPosition);
      setVisibleMonths({
        start: initialPosition,
        end: Math.min(initialPosition + 12, transformedData.length)
      });
      
      setIsLoading(false);
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [monthlyData]);
  
  const handleSliderChange = (value: number[]) => {
    const newStart = value[0];
    const newEnd = Math.min(newStart + 12, data.length);
    
    setSliderPosition(newStart);
    setVisibleMonths({ start: newStart, end: newEnd });
  };
  
  const handleAdjustProjection = (change: number) => {
    const newMonthsForward = Math.max(1, Math.min(12, timeRange.monthsForward + change));
    
    if (newMonthsForward === timeRange.monthsForward) return;
    
    setTimeRange(prev => ({ 
      ...prev, 
      monthsForward: newMonthsForward,
      monthsBack: 21 - newMonthsForward 
    }));
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
  
  const visibleData = data.slice(visibleMonths.start, visibleMonths.end);
  
  const currentData = visibleData.length > 0 ? visibleData[visibleData.length - 1] : { income: 0, expenses: 0, savings: 0 };
  
  const prevData = visibleData.length > 1 ? visibleData[visibleData.length - 2] : null;
  const incomeChange = prevData && prevData.income ? ((currentData.income - prevData.income) / prevData.income) * 100 : 0;
  const expenseChange = prevData && prevData.expenses ? ((currentData.expenses - prevData.expenses) / prevData.expenses) * 100 : 0;
  const savingsChange = prevData && prevData.savings ? ((currentData.savings - prevData.savings) / prevData.savings) * 100 : 0;
  
  const isIncomePositive = incomeChange >= 0;
  const isExpensePositive = expenseChange <= 0;
  const isSavingsPositive = savingsChange >= 0;
  
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
            
            <ChartControls
              timeRange={timeRange}
              visibleMonths={visibleMonths}
              totalDataLength={data.length}
              onSliderChange={handleSliderChange}
              onAdjustProjection={handleAdjustProjection}
              sliderPosition={sliderPosition}
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
                fillOpacity={0.25}
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
