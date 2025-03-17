
import { TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Currency, formatCurrency } from '@/lib/data';

interface Milestone {
  amount: number;
  monthsToReach: number;
}

interface SavingsInsightsProps {
  avgMonthlySavings: number;
  yearlyTotal: number;
  milestones: Milestone[];
  progressTowardsYearlyGoal: number;
  currency: Currency;
}

export function SavingsInsights({ 
  avgMonthlySavings, 
  yearlyTotal, 
  milestones, 
  progressTowardsYearlyGoal,
  currency 
}: SavingsInsightsProps) {
  return (
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
              {formatCurrency(avgMonthlySavings, currency)}
            </div>
          </div>
          <div className="mt-1 flex justify-between items-center">
            <div className="text-xs text-muted-foreground">Yearly Projection</div>
            <div className="text-sm font-medium">
              {formatCurrency(yearlyTotal, currency)}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <div className="text-xs text-muted-foreground">Yearly Target Progress</div>
              <div className="text-xs font-medium">
                {progressTowardsYearlyGoal.toFixed(0)}%
              </div>
            </div>
            <Progress
              value={progressTowardsYearlyGoal}
              className="h-1.5"
              indicatorColor={progressTowardsYearlyGoal >= 100 ? '#10b981' : '#0ea5e9'}
            />
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Time to reach:</div>
          {milestones.map((milestone, index) => (
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
  );
}
