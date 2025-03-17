
import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Currency, CURRENCY_SYMBOLS, MonthlyTotal } from '@/lib/data';

interface IncomeExpensesCompactChartProps {
  monthlyData: MonthlyTotal[];
  displayCurrency: Currency;
}

export function IncomeExpensesCompactChart({ 
  monthlyData,
  displayCurrency 
}: IncomeExpensesCompactChartProps) {
  const [data, setData] = useState<Array<{ date: string; income: number; expenses: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    
    if (monthlyData.length > 0) {
      // Extract the last 6 months of data for display
      const recentData = monthlyData.slice(-6).map(month => {
        // Parse the month string to get a proper date
        const [monthName, yearStr] = month.month.split(' ');
        const date = new Date(`${monthName} 1, ${yearStr}`);
        
        return {
          date: date.toISOString().split('T')[0],
          income: month.income,
          expenses: month.expenses
        };
      });
      
      setData(recentData);
      setIsLoading(false);
    } else {
      setData([]);
      setIsLoading(false);
    }
  }, [monthlyData]);
  
  if (isLoading) {
    return (
      <Card className="h-[100px]">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm">Income & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Skeleton className="h-[60px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Calculate current month income & expenses
  const currentData = data.length > 0 ? data[data.length - 1] : { income: 0, expenses: 0 };
  
  // Calculate percent change from previous month
  const prevData = data.length > 1 ? data[data.length - 2] : null;
  const incomeChange = prevData ? ((currentData.income - prevData.income) / prevData.income) * 100 : 0;
  const expenseChange = prevData ? ((currentData.expenses - prevData.expenses) / prevData.expenses) * 100 : 0;
  
  const isIncomePositive = incomeChange >= 0;
  const isExpensePositive = expenseChange <= 0; // Expenses going down is positive
  
  return (
    <Card className="h-[100px]">
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs">
            Income & Expenses
          </CardTitle>
          <div className="flex flex-col items-end text-xs">
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 h-[60px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip 
              formatter={(value, name) => [
                `${CURRENCY_SYMBOLS[displayCurrency]}${Number(value).toLocaleString()}`, 
                name === 'income' ? 'Income' : 'Expenses'
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('default', { year: 'numeric', month: 'short' });
              }}
              contentStyle={{ 
                fontSize: '10px', 
                padding: '4px 8px',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="income" 
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#incomeGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              name="expenses" 
              stroke="#f43f5e" 
              fillOpacity={1} 
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
