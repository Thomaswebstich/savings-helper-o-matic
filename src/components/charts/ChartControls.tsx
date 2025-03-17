
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';

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
  
  useEffect(() => {
    setSliderValue([sliderPosition]);
  }, [sliderPosition]);
  
  const handleSliderChange = (value: number[]) => {
    if (value.length === 0) return;
    setSliderValue(value);
    onSliderChange(value);
  };
  
  const maxSliderValue = Math.max(0, totalDataLength - 12);
  
  return (
    <div className={`flex flex-col space-y-3 w-full ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Historical: {timeRange.monthsBack}m</span>
        <span>Projection: {timeRange.monthsForward}m</span>
      </div>
      
      <div className="flex items-center gap-4 w-full">
        <div className="flex-1">
          <Slider 
            value={sliderValue} 
            max={maxSliderValue > 0 ? maxSliderValue : 1} 
            min={0}
            step={1} 
            onValueChange={handleSliderChange}
            className="h-3"
          />
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAdjustProjection(-1)}
            disabled={timeRange.monthsForward <= 1}
            title="Decrease projection months"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAdjustProjection(1)}
            disabled={timeRange.monthsForward >= 12}
            title="Increase projection months"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
