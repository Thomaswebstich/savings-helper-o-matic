
import { MonthlyTotal, formatCurrency, Currency, CURRENCY_SYMBOLS, convertCurrency } from '@/lib/data';
import { useMemo } from 'react';
import { ArrowRight, CalendarRange, Calculator, DollarSign, LineChart, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";

interface SavingsProjectionProps {
  monthlyData: MonthlyTotal[];
  currency?: Currency;
}

export function SavingsProjection({ monthlyData, currency = "THB" }: SavingsProjectionProps) {  
  // Get the current month's data
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;
    return monthlyData.find(data => data.month === currentMonth) || monthlyData[0];
  }, [monthlyData]);
  
  // Calculate savings rate
  const savingsRate = useMemo(() => {
    if (!currentMonthData || currentMonthData.income === 0) return 0;
    return (currentMonthData.savings / currentMonthData.income) * 100;
  }, [currentMonthData]);
  
  // Project future savings
  const projectedSavings = useMemo(() => {
    // Get future months data (sorted chronologically)
    const futureMonths = [...monthlyData]
      .filter(month => {
        const [monthStr, yearStr] = month.month.split(' ');
        const monthDate = new Date(`${monthStr} 1, ${yearStr}`);
        return monthDate >= new Date();
      })
      .sort((a, b) => {
        const [aMonthStr, aYearStr] = a.month.split(' ');
        const [bMonthStr, bYearStr] = b.month.split(' ');
        const aDate = new Date(`${aMonthStr} 1, ${aYearStr}`);
        const bDate = new Date(`${bMonthStr} 1, ${bYearStr}`);
        return aDate.getTime() - bDate.getTime();
      });
    
    return futureMonths;
  }, [monthlyData]);
  
  // Calculate key insights instead of annual projections
  const savingsInsights = useMemo(() => {
    if (projectedSavings.length === 0) return [];
    
    const currentYear = new Date().getFullYear();
    
    // Calculate average monthly savings
    const avgMonthlySavings = projectedSavings.reduce((sum, month) => {
      return sum + convertCurrency(month.savings, "THB", currency);
    }, 0) / Math.max(1, projectedSavings.length);
    
    // Calculate projected yearly total
    const yearlyTotal = avgMonthlySavings * 12;
    
    // Calculate time to reach milestones (in months)
    const milestones = [5000, 10000, 50000].map(amount => {
      const monthsToReach = avgMonthlySavings > 0 ? Math.ceil(amount / avgMonthlySavings) : 0;
      return {
        amount,
        monthsToReach
      };
    });
    
    return {
      avgMonthlySavings,
      yearlyTotal,
      milestones
    };
  }, [projectedSavings, currency]);
  
  // Calculate rolling sum projections
  const cumulativeSavings = useMemo(() => {
    let sum = 0;
    return projectedSavings.map(month => {
      const convertedSavings = convertCurrency(month.savings, "THB", currency);
      sum += convertedSavings;
      return {
        month: month.month,
        savings: convertedSavings,
        cumulativeTotal: sum
      };
    });
  }, [projectedSavings, currency]);
  
  // Convert current month data to display currency
  const currentMonthDisplayData = useMemo(() => {
    if (!currentMonthData) return { savings: 0 };
    
    return {
      savings: convertCurrency(currentMonthData.savings, "THB", currency)
    };
  }, [currentMonthData, currency]);
  
  return (
    <div className="glass-card p-4 animate-slide-up w-full space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-medium">Savings Projection</h3>
        <LineChart className="text-primary h-5 w-5" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Current Savings Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Current Savings Rate</div>
            <div className="font-medium">{savingsRate.toFixed(1)}%</div>
          </div>
          <Progress value={savingsRate} className="h-2" />
          <div className="mt-2 bg-muted/50 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">This Month</div>
                <div className="text-lg font-medium">
                  {currentMonthData ? formatCurrency(currentMonthDisplayData.savings, currency) : `${CURRENCY_SYMBOLS[currency]}0.00`}
                </div>
              </div>
            </div>
            <span className={currentMonthData && currentMonthData.savings > 0 ? "text-green-600" : "text-red-600"}>
              {currentMonthData && currentMonthData.savings > 0 ? "+" : ""}
              {currentMonthData ? savingsRate.toFixed(1) : "0"}%
            </span>
          </div>
        </div>
      
        {/* Insights (replacing Annual Projections) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Insights</div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2 mt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Avg. Monthly</div>
                <div className="text-sm font-medium">
                  {formatCurrency(savingsInsights.avgMonthlySavings, currency)}
                </div>
              </div>
              <div className="mt-1 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Yearly Projection</div>
                <div className="text-sm font-medium">
                  {formatCurrency(savingsInsights.yearlyTotal, currency)}
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Time to reach:</div>
              {savingsInsights.milestones.map((milestone, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span>{formatCurrency(milestone.amount, currency)}</span>
                  <span className="font-medium">
                    {milestone.monthsToReach > 0 
                      ? milestone.monthsToReach < 12 
                        ? `${milestone.monthsToReach} months` 
                        : `${(milestone.monthsToReach / 12).toFixed(1)} years`
                      : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Long-term Projection</div>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            {[1, 3, 5].map(years => {
              const avgMonthlySaving = projectedSavings.length > 0 
                ? projectedSavings.reduce((sum, month) => sum + convertCurrency(month.savings, "THB", currency), 0) / projectedSavings.length 
                : 0;
                
              const projection = avgMonthlySaving * 12 * years;
              
              return (
                <div key={years} className="flex justify-between items-center py-1">
                  <div className="text-sm">{years} {years === 1 ? 'year' : 'years'}</div>
                  <div className="font-medium">{formatCurrency(projection, currency)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Monthly Breakdown Table - with "Cumulated Savings" instead of "Running Total" */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Monthly Breakdown</h4>
          <div className="text-xs text-muted-foreground">Next {Math.min(6, projectedSavings.length)} months</div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Month</TableHead>
                <TableHead className="text-xs">Savings</TableHead>
                <TableHead className="text-xs">Cumulated Savings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...cumulativeSavings.slice(0, 6)].reverse().map((item, index) => (
                <TableRow key={item.month}>
                  <TableCell className="py-2 text-xs">{item.month}</TableCell>
                  <TableCell className={`py-2 text-xs ${item.savings >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(item.savings, currency)}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-medium">
                    {formatCurrency(item.cumulativeTotal, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
