
import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Currency, CURRENCY_SYMBOLS } from '@/lib/data';

interface ExchangeRate {
  date: string;
  rate: number;
}

interface ExchangeRateChartProps {
  displayCurrency: Currency;
}

export function ExchangeRateChart({ displayCurrency }: ExchangeRateChartProps) {
  const [data, setData] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Skip API call for THB as it's the base currency
    if (displayCurrency === 'THB') {
      setData(generateMockData(1));
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // For demo purposes, generate mock data based on currency
    // In a real app, this would be an API call to get exchange rates
    const mockRate = displayCurrency === 'USD' ? 0.028 : 0.026; // EUR
    setData(generateMockData(mockRate));
    setIsLoading(false);
  }, [displayCurrency]);
  
  // Generate mock data with some variance
  const generateMockData = (baseRate: number): ExchangeRate[] => {
    const today = new Date();
    const result: ExchangeRate[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Add some random variance to make the chart interesting
      const variance = (Math.random() - 0.5) * 0.002;
      const rate = baseRate + variance;
      
      result.push({
        date: date.toISOString().split('T')[0],
        rate: Number(rate.toFixed(5))
      });
    }
    
    return result;
  };
  
  const formatTooltip = (value: number) => {
    return `1 THB = ${value.toFixed(5)} ${displayCurrency}`;
  };
  
  if (isLoading) {
    return (
      <Card className="h-[100px]">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm">Exchange Rate</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Skeleton className="h-[60px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // Get current rate from last data point
  const currentRate = data.length > 0 ? data[data.length - 1].rate : 0;
  
  // Calculate percent change from 30 days ago
  const oldRate = data.length > 0 ? data[0].rate : 0;
  const percentChange = oldRate !== 0 ? ((currentRate - oldRate) / oldRate) * 100 : 0;
  const isPositive = percentChange >= 0;
  
  return (
    <Card className="h-[100px]">
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs">
            THB/{displayCurrency} Exchange Rate
          </CardTitle>
          <div className="flex items-center gap-1 text-xs">
            <span>{`1 THB = ${currentRate.toFixed(5)} ${displayCurrency}`}</span>
            {percentChange !== 0 && (
              <span className={isPositive ? "text-green-500" : "text-red-500"}>
                {isPositive ? "+" : ""}{Math.round(percentChange)}%
              </span>
            )}
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
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              domain={['dataMin - 0.0005', 'dataMax + 0.0005']} 
              hide={true} 
            />
            <Tooltip 
              formatter={formatTooltip} 
              labelFormatter={() => ''} 
              contentStyle={{ 
                fontSize: '10px', 
                padding: '4px 8px',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#rateGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
