
import { MonthlyTotal, formatCurrency } from '@/lib/data';
import { useMemo } from 'react';
import { ArrowRight, Banknote, DollarSign, ScanLine, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SavingsProjectionProps {
  monthlyData: MonthlyTotal[];
}

export function SavingsProjection({ monthlyData }: SavingsProjectionProps) {
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
  
  // Get projected savings for next 3 months
  const projectedSavings = useMemo(() => {
    const currentIndex = monthlyData.findIndex(data => data === currentMonthData);
    if (currentIndex === -1) return [];
    return monthlyData.slice(currentIndex + 1, currentIndex + 4);
  }, [monthlyData, currentMonthData]);
  
  // Calculate total projected savings
  const totalProjectedSavings = useMemo(() => {
    return projectedSavings.reduce((total, month) => total + month.savings, 0);
  }, [projectedSavings]);
  
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Savings Projection</h3>
        <TrendingUp className="text-primary h-5 w-5" />
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-muted-foreground">Current Savings Rate</div>
            <div className="font-medium">{savingsRate.toFixed(1)}%</div>
          </div>
          <Progress value={savingsRate} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {projectedSavings.map((month, index) => (
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
                  <div className="text-lg font-medium mr-1">{formatCurrency(month.savings)}</div>
                  <div className="text-xs text-muted-foreground">projected savings</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 mt-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
              <DollarSign />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total 3-Month Projection</div>
              <div className="text-xl font-medium">{formatCurrency(totalProjectedSavings)}</div>
            </div>
          </div>
          <ArrowRight className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
