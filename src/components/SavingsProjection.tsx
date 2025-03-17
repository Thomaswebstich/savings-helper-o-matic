
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
  
  // Calculate annual projections
  const annualProjections = useMemo(() => {
    if (projectedSavings.length === 0) return [];
    
    const currentYear = new Date().getFullYear();
    const nextYears = [currentYear, currentYear + 1, currentYear + 2];
    
    return nextYears.map(year => {
      const monthsInYear = projectedSavings.filter(month => {
        return month.month.includes(year.toString());
      });
      
      const totalSavings = monthsInYear.reduce((sum, month) => {
        return sum + convertCurrency(month.savings, "THB", currency);
      }, 0);
      
      const avgMonthlySavings = monthsInYear.length > 0 ? totalSavings / monthsInYear.length : 0;
      
      return {
        year,
        totalSavings,
        avgMonthlySavings,
        monthsDataAvailable: monthsInYear.length
      };
    });
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
    <div className="glass-card p-6 animate-slide-up w-full space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Savings Projection</h3>
        <LineChart className="text-primary h-5 w-5" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Savings Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Current Savings Rate</div>
            <div className="font-medium">{savingsRate.toFixed(1)}%</div>
          </div>
          <Progress value={savingsRate} className="h-2" />
          <div className="mt-4 bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <DollarSign />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="text-xl font-medium">
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
      
        {/* Annual Projections */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Annual Projections</div>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2 mt-2">
            {annualProjections.map(year => (
              <div key={year.year} className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{year.year}</div>
                  <div className="text-xs text-muted-foreground">
                    {year.monthsDataAvailable} months data
                  </div>
                </div>
                <div className="mt-1 text-lg font-medium">
                  {formatCurrency(year.totalSavings, currency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg. {formatCurrency(year.avgMonthlySavings, currency)}/month
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Year Projection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Long-term Projection</div>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
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
      
      {/* Monthly Breakdown Table - Now in reversed order (newest months at top) */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Monthly Breakdown</h4>
          <div className="text-xs text-muted-foreground">Next {Math.min(12, projectedSavings.length)} months</div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Running Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...cumulativeSavings.slice(0, 12)].reverse().map((item, index) => (
                <TableRow key={item.month}>
                  <TableCell>{item.month}</TableCell>
                  <TableCell className={item.savings >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(item.savings, currency)}
                  </TableCell>
                  <TableCell className="font-medium">
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
