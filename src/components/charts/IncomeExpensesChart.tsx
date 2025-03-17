
import { MonthlyTotal, CURRENCY_SYMBOLS } from '@/lib/data';
import { Currency } from '@/lib/types';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  Tooltip, 
  XAxis, 
  YAxis
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { formatTooltipValue, chartConfig } from './financialChartUtils';

interface IncomeExpensesChartProps {
  visibleData: MonthlyTotal[];
  displayCurrency: Currency;
  hasFutureData: boolean;
}

export function IncomeExpensesChart({ 
  visibleData, 
  displayCurrency, 
  hasFutureData 
}: IncomeExpensesChartProps) {
  return (
    <>
      <div className="h-[250px]">
        <ChartContainer config={chartConfig}>
          <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              tickFormatter={(value) => `${CURRENCY_SYMBOLS[displayCurrency]}${value}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
            />
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-md p-2 shadow-md text-xs">
                      <p className="font-medium mb-1">{payload[0].payload.month}</p>
                      {payload.map((entry, index) => (
                        <div key={`tooltip-${index}`} className="flex justify-between gap-4">
                          <span style={{ color: entry.color }}>{entry.name}:</span>
                          <span className="font-medium">{formatTooltipValue(entry.value as number, displayCurrency)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Income" 
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#incomeGradient)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              name="Expenses" 
              stroke="#f43f5e" 
              fillOpacity={1} 
              fill="url(#expenseGradient)"
              strokeWidth={2}
              strokeDasharray={hasFutureData ? "4 4" : "0"}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      {hasFutureData && (
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <hr className="w-4 border-dashed border-muted-foreground" />
          <span className="mx-2">Dashed line indicates projected expenses</span>
        </div>
      )}
    </>
  );
}
