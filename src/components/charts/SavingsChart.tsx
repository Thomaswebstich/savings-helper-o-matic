
import { MonthlyTotal, CURRENCY_SYMBOLS, formatCurrency } from '@/lib/data';
import { Currency } from '@/lib/types';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Tooltip, 
  XAxis, 
  YAxis
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { chartConfig } from './financialChartUtils';

interface SavingsChartProps {
  visibleData: MonthlyTotal[];
  displayCurrency: Currency;
  hasFutureData: boolean;
  monthsForward: number;
}

export function SavingsChart({ 
  visibleData, 
  displayCurrency, 
  hasFutureData,
  monthsForward
}: SavingsChartProps) {
  return (
    <>
      <div className="h-[250px]">
        <ChartContainer config={chartConfig}>
          <BarChart data={visibleData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
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
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = Number(payload[0].value);
                  return (
                    <div className="bg-background border border-border rounded-md p-2 shadow-md text-xs">
                      <p className="font-medium mb-1">{payload[0].payload.month}</p>
                      <div className="flex justify-between gap-4">
                        <span style={{ color: value >= 0 ? "#10b981" : "#f43f5e" }}>Savings:</span>
                        <span className="font-medium">{formatCurrency(value, displayCurrency)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
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
                  opacity={hasFutureData && index >= visibleData.length - monthsForward ? 0.7 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      {hasFutureData && (
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <div className="w-4 h-3 bg-green-500 opacity-70 rounded-sm mr-2" />
          <span>Lighter bars indicate projected savings</span>
        </div>
      )}
    </>
  );
}
