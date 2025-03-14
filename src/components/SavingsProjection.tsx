
import { MonthlyTotal, formatCurrency, Currency } from '@/lib/data';
import { useMemo, useState } from 'react';
import { ArrowRight, CalendarRange, DollarSign, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavingsProjectionProps {
  monthlyData: MonthlyTotal[];
  currency?: Currency;
}

export function SavingsProjection({ monthlyData, currency = "THB" }: SavingsProjectionProps) {
  const [projectionPeriod, setProjectionPeriod] = useState<string>("3");
  
  // Get the current month's data
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
    return monthlyData.find(data => data.month === currentMonth) || monthlyData[0];
  }, [monthlyData]);
  
  // Calculate savings rate
  const savingsRate = useMemo(() => {
    if (!currentMonthData) return 0;
    return (currentMonthData.savings / currentMonthData.income) * 100;
  }, [currentMonthData]);
  
  // Get projected savings for selected period
  const projectedSavings = useMemo(() => {
    const months = parseInt(projectionPeriod);
    const currentIndex = monthlyData.findIndex(data => data === currentMonthData);
    if (currentIndex === -1) return [];
    return monthlyData.slice(currentIndex + 1, currentIndex + 1 + months);
  }, [monthlyData, currentMonthData, projectionPeriod]);
  
  // Calculate total projected savings
  const totalProjectedSavings = useMemo(() => {
    return projectedSavings.reduce((total, month) => total + month.savings, 0);
  }, [projectedSavings]);
  
  // Calculate annual equivalent
  const annualizedSavings = useMemo(() => {
    const months = parseInt(projectionPeriod);
    return months > 0 ? (totalProjectedSavings / months) * 12 : 0;
  }, [totalProjectedSavings, projectionPeriod]);
  
  // Project savings to specific goals 
  const timeToTarget = useMemo(() => {
    const targets = [10000, 50000, 100000];
    const monthlySavings = projectedSavings.length > 0 
      ? totalProjectedSavings / projectedSavings.length 
      : (currentMonthData?.savings || 0);
    
    if (monthlySavings <= 0) return [];
    
    return targets.map(target => ({
      target,
      months: Math.ceil(target / monthlySavings),
      saved: totalProjectedSavings
    }));
  }, [projectedSavings, totalProjectedSavings, currentMonthData]);
  
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Savings Projection</h3>
        <div className="flex items-center gap-2">
          <Select value={projectionPeriod} onValueChange={setProjectionPeriod}>
            <SelectTrigger className="w-[110px] h-8">
              <SelectValue placeholder="Projection months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
              <SelectItem value="36">36 months</SelectItem>
            </SelectContent>
          </Select>
          <TrendingUp className="text-primary h-5 w-5" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-muted-foreground">Current Savings Rate</div>
            <div className="font-medium">{savingsRate.toFixed(1)}%</div>
          </div>
          <Progress value={savingsRate} className="h-2" />
        </div>
        
        {projectedSavings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            {projectedSavings.slice(0, 3).map((month, index) => (
              <div 
                key={month.month} 
                className="bg-secondary/50 rounded-lg p-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-primary/5 w-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
                <div className="relative">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-2">
                      {index + 1}
                    </div>
                    {month.month}
                  </div>
                  <div className="flex items-baseline">
                    <div className="text-lg font-medium mr-1">{formatCurrency(month.savings, currency)}</div>
                    <div className="text-xs text-muted-foreground">projected savings</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <DollarSign />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{projectionPeriod}-Month Projection</div>
                <div className="text-xl font-medium">{formatCurrency(totalProjectedSavings, currency)}</div>
              </div>
            </div>
            <ArrowRight className="text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <CalendarRange />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Annualized Savings</div>
                <div className="text-xl font-medium">{formatCurrency(annualizedSavings, currency)}</div>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Per year</span>
          </div>
        </div>
        
        {timeToTarget.length > 0 && savingsRate > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-medium mb-3">Time to Reach Goals</h4>
            <div className="space-y-2">
              {timeToTarget.map((goal) => (
                <div key={goal.target} className="flex justify-between items-center p-2 rounded-lg bg-secondary/30">
                  <div>
                    <div className="text-sm text-muted-foreground">Save {formatCurrency(goal.target, currency)}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium">
                      {goal.months} {goal.months === 1 ? 'month' : 'months'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date().getFullYear() + Math.floor(goal.months / 12)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
