
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Legend, CartesianGrid, ComposedChart, Bar, Tooltip } from 'recharts';
import { CURRENCY_SYMBOLS, Currency, formatCurrency, convertCurrency } from '@/lib/data';

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
  // Convert data to display currency
  const convertedData = visibleData.map(item => ({
    ...item,
    income: convertCurrency(item.income, 'THB', displayCurrency),
    expenses: convertCurrency(item.expenses, 'THB', displayCurrency),
    savings: convertCurrency(item.savings, 'THB', displayCurrency)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md text-xs">
          <p className="font-medium mb-1">{label}{item?.isProjection ? ' (Projected)' : ''}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex justify-between gap-4">
              <span style={{ color: entry.color }}>
                {entry.dataKey === 'income' ? 'Income' : 
                 entry.dataKey === 'expenses' ? 'Expenses' : 'Savings'}:
              </span>
              <span className="font-medium">
                {formatCurrency(Number(entry.value), displayCurrency)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {showSavings ? (
        <ComposedChart
          data={convertedData}
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
          <Tooltip content={<CustomTooltip />} />
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
          data={convertedData}
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
          <Tooltip content={<CustomTooltip />} />
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
