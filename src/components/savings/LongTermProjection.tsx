
import { Calculator } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Currency, formatCurrency, convertCurrency } from '@/lib/data';

interface LongTermProjectionProps {
  projectedSavings: any[];
  yearlyTarget: number;
  currency: Currency;
}

export function LongTermProjection({ projectedSavings, yearlyTarget, currency }: LongTermProjectionProps) {
  return (
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
          const target = convertCurrency(yearlyTarget, "THB", currency) * years;
          const progressPercentage = (projection / target) * 100;
          
          return (
            <div key={years} className="py-1">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm">{years} {years === 1 ? 'year' : 'years'}</div>
                <div className="text-xs">
                  <span className="font-medium">{formatCurrency(projection, currency)}</span>
                  <span className="text-muted-foreground mx-1">of</span>
                  <span>{formatCurrency(target, currency)}</span>
                </div>
              </div>
              <Progress 
                value={Math.min(progressPercentage, 100)} 
                className="h-1.5"
                indicatorColor={progressPercentage >= 100 ? '#10b981' : '#0ea5e9'} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
