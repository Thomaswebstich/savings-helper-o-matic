
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ComposedChart, Bar } from 'recharts';
import { CURRENCY_SYMBOLS, Currency } from '@/lib/data';

interface DataPoint {
  date: string;
  month: string;
  income: number;
  expenses: number;
  savings: number;
  isProjection: boolean;
}

interface IncomeExpensesChartProps {
  visibleData: DataPoint[];
  displayCurrency: Currency;
  showSavings: boolean;
}

export function IncomeExpensesChart({ 
  visibleData, 
  displayCurrency, 
  showSavings 
}: IncomeExpensesChartProps) {
  return (
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
  );
}
