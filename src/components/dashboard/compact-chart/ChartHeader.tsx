
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ChartHeaderProps {
  title: string;
  projectedMonthsCount: number;
  showSavings: boolean;
  setShowSavings: (value: boolean) => void;
  showCompounded?: boolean;
  setShowCompounded?: (value: boolean) => void;
}

export function ChartHeader({
  title,
  projectedMonthsCount,
  showSavings,
  setShowSavings,
  showCompounded,
  setShowCompounded,
}: ChartHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-3">
      <div className="text-sm font-medium">
        {title} {projectedMonthsCount > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            (Including {projectedMonthsCount} Future Month{projectedMonthsCount > 1 ? 's' : ''})
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-savings" 
            checked={showSavings} 
            onCheckedChange={setShowSavings} 
            className="data-[state=checked]:bg-green-500"
          />
          <Label htmlFor="show-savings" className="text-xs">Show Savings</Label>
        </div>
        
        {showCompounded !== undefined && setShowCompounded && (
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-compounded" 
              checked={showCompounded} 
              onCheckedChange={setShowCompounded} 
              className="data-[state=checked]:bg-blue-500"
            />
            <Label htmlFor="show-compounded" className="text-xs">Compounded</Label>
          </div>
        )}
      </div>
    </div>
  );
}
