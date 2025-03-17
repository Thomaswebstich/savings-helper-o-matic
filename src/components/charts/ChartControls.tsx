
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

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
  onZoomIn: () => void;
  onZoomOut: () => void;
  onShowPrevious: () => void;
  onShowNext: () => void;
  onAdjustProjection: (change: number) => void;
}

export function ChartControls({
  timeRange,
  visibleMonths,
  totalDataLength,
  onZoomIn,
  onZoomOut,
  onShowPrevious,
  onShowNext,
  onAdjustProjection
}: ChartControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="hidden lg:flex items-center mr-2 text-xs text-muted-foreground">
        <span>Hist: {timeRange.monthsBack}m</span>
        <span className="mx-1">|</span>
        <span>Proj: {timeRange.monthsForward}m</span>
      </div>
      
      <div className="flex items-center space-x-0.5">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={onZoomIn}
          title="Show fewer months"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={onZoomOut}
          title="Show more months"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
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
      
      <div className="ml-1 flex items-center space-x-0.5">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={onShowPrevious}
          disabled={visibleMonths.start <= 0}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={onShowNext}
          disabled={visibleMonths.end >= totalDataLength}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
