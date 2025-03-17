
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChartControls } from "@/components/charts/ChartControls";

interface ChartHeaderProps {
  title: string;
  projectedMonthsCount: number;
  showSavings: boolean;
  setShowSavings: (value: boolean) => void;
  timeRange: { monthsBack: number, monthsForward: number };
  visibleMonths: { start: number, end: number };
  totalDataLength: number;
  onSliderChange: (value: number[]) => void;
  onAdjustProjection: (change: number) => void;
  sliderPosition: number;
}

export function ChartHeader({
  title,
  projectedMonthsCount,
  showSavings,
  setShowSavings,
  timeRange,
  visibleMonths,
  totalDataLength,
  onSliderChange,
  onAdjustProjection,
  sliderPosition
}: ChartHeaderProps) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-2">
      <div className="text-sm font-medium">
        {title} {projectedMonthsCount > 0 && `(Including ${projectedMonthsCount} Future Months)`}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-savings" 
            checked={showSavings} 
            onCheckedChange={setShowSavings} 
          />
          <Label htmlFor="show-savings" className="text-xs">Show Savings</Label>
        </div>
        
        <ChartControls
          timeRange={timeRange}
          visibleMonths={visibleMonths}
          totalDataLength={totalDataLength}
          onSliderChange={onSliderChange}
          onAdjustProjection={onAdjustProjection}
          sliderPosition={sliderPosition}
        />
      </div>
    </div>
  );
}
