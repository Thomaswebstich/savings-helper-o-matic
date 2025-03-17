
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChartHeaderProps {
  title: string;
  projectedMonthsCount: number;
  showSavings: boolean;
  setShowSavings: (value: boolean) => void;
}

export function ChartHeader({
  title,
  projectedMonthsCount,
  showSavings,
  setShowSavings,
}: ChartHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm font-medium">
        {title} {projectedMonthsCount > 0 && `(Including ${projectedMonthsCount} Future Months)`}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="show-savings" 
          checked={showSavings} 
          onCheckedChange={setShowSavings} 
        />
        <Label htmlFor="show-savings" className="text-xs">Show Savings</Label>
      </div>
    </div>
  );
}
