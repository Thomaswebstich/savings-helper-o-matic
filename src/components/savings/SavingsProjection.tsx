
import { MonthlyTotal, formatCurrency, Currency, CURRENCY_SYMBOLS, convertCurrency } from '@/lib/data';
import { useMemo, useState } from 'react';
import { LineChart } from 'lucide-react';
import { SavingsRate } from './SavingsRate';
import { SavingsInsights } from './SavingsInsights';
import { LongTermProjection } from './LongTermProjection';
import { MonthlyBreakdown } from './MonthlyBreakdown';
import { SavingsTarget } from './SavingsTarget';

interface SavingsProjectionProps {
  monthlyData: MonthlyTotal[];
  currency?: Currency;
}

export function SavingsProjection({ monthlyData, currency = "THB" }: SavingsProjectionProps) {  
  // Get saved yearly target from local storage (in THB)
  const savedYearlyTarget = useMemo(() => {
    const savedTarget = localStorage.getItem('yearlyTarget');
    return savedTarget ? Number(savedTarget) : 50000;
  }, []);
  
  const [yearlyTarget, setYearlyTarget] = useState<number>(savedYearlyTarget);
  
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
    if (projectedSavings.length === 0) return {
      avgMonthlySavings: 0,
      yearlyTotal: 0,
      milestones: [] as { amount: number; monthsToReach: number }[],
      progressTowardsYearlyGoal: 0
    };
    
    const currentYear = new Date().getFullYear();
    
    // Calculate average monthly savings
    const avgMonthlySavings = projectedSavings.reduce((sum, month) => {
      return sum + convertCurrency(month.savings, "THB", currency);
    }, 0) / Math.max(1, projectedSavings.length);
    
    // Calculate projected yearly total
    const yearlyTotal = avgMonthlySavings * 12;
    
    // Target is in THB but we need to compare it in display currency
    const targetInDisplayCurrency = convertCurrency(yearlyTarget, "THB", currency);
    
    // Calculate progress towards yearly goal
    const progressTowardsYearlyGoal = (yearlyTotal / targetInDisplayCurrency) * 100;
    
    // Calculate time to reach milestones (in months)
    const milestoneBases = currency === "THB" ? [5000, 10000, 50000] : 
                           currency === "USD" ? [100, 500, 1000] : 
                           [100, 500, 1000]; // EUR
    
    const milestones = milestoneBases.map(amount => {
      const monthsToReach = avgMonthlySavings > 0 ? Math.ceil(amount / avgMonthlySavings) : 0;
      return {
        amount,
        monthsToReach
      };
    });
    
    return {
      avgMonthlySavings,
      yearlyTotal,
      milestones,
      progressTowardsYearlyGoal: Math.min(progressTowardsYearlyGoal, 100)
    };
  }, [projectedSavings, currency, yearlyTarget]);
  
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
  
  return (
    <div className="glass-card p-4 animate-slide-up w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-medium">Savings Projection</h3>
        <div className="flex items-center gap-2">
          <SavingsTarget 
            yearlyTarget={yearlyTarget} 
            setYearlyTarget={setYearlyTarget} 
            currency={currency} 
          />
          <LineChart className="text-primary h-5 w-5" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Current Savings Rate */}
        <SavingsRate 
          currentMonthData={currentMonthData} 
          savingsRate={savingsRate} 
          currency={currency} 
        />
      
        {/* Insights with yearly target */}
        <SavingsInsights 
          avgMonthlySavings={savingsInsights.avgMonthlySavings}
          yearlyTotal={savingsInsights.yearlyTotal}
          milestones={savingsInsights.milestones}
          progressTowardsYearlyGoal={savingsInsights.progressTowardsYearlyGoal}
          currency={currency}
        />

        {/* Long-term Projection with target */}
        <LongTermProjection 
          projectedSavings={projectedSavings}
          yearlyTarget={yearlyTarget}
          currency={currency}
        />
      </div>
      
      {/* Monthly Breakdown Table - with "Cumulated Savings" */}
      <MonthlyBreakdown 
        cumulativeSavings={cumulativeSavings}
        currency={currency}
      />
    </div>
  );
}
