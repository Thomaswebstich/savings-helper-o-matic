
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

interface ChartControlsProps {
  timeRange: {
    monthsBack: number;
    monthsForward: number;
  };
  visibleMonths: {
    start: number;
    end: number;
  };
  totalDataLength: number;
  onSliderChange: (value: number[]) => void;
  onAdjustProjection: (change: number) => void;
  sliderPosition?: number;
  className?: string;
}

export function ChartControls({
  timeRange,
  visibleMonths,
  totalDataLength,
  onSliderChange,
  onAdjustProjection,
  sliderPosition = 0,
  className
}: ChartControlsProps) {
  const [sliderValue, setSliderValue] = useState<number[]>([sliderPosition]);
  
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    onSliderChange(value);
  };
  
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Historical: {timeRange.monthsBack}m</span>
        <span>Projection: {timeRange.monthsForward}m</span>
      </div>
      
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1">
          <Slider 
            value={sliderValue} 
            max={Math.max(0, totalDataLength - 12)} 
            step={1} 
            onValueChange={handleSliderChange}
            className="h-2"
          />
        </div>
        
        <div className="flex items-center space-x-0.5 ml-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAdjustProjection(-1)}
            disabled={timeRange.monthsForward <= 1}
            title="Decrease projection months"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => onAdjustProjection(1)}
            disabled={timeRange.monthsForward >= 12}
            title="Increase projection months"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
