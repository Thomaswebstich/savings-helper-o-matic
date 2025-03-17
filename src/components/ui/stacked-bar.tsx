
import { cn } from "@/lib/utils";

interface StackedBarSegment {
  value: number;
  color: string;
  id: string;
}

interface StackedBarProps {
  segments: StackedBarSegment[];
  className?: string;
  height?: number;
}

export function StackedBar({ 
  segments, 
  className, 
  height = 8 
}: StackedBarProps) {
  // Filter out zero-value segments
  const validSegments = segments.filter(seg => seg.value > 0);
  
  // If no valid segments, show empty bar
  if (validSegments.length === 0) {
    return (
      <div 
        className={cn("w-full rounded-full bg-secondary", className)} 
        style={{ height: `${height}px` }}
      />
    );
  }

  return (
    <div 
      className={cn("w-full rounded-full flex overflow-hidden", className)} 
      style={{ height: `${height}px` }}
    >
      {validSegments.map((segment, index) => (
        <div
          key={segment.id}
          className={cn(
            "h-full",
            index === 0 ? "rounded-l-full" : "",
            index === validSegments.length - 1 ? "rounded-r-full" : ""
          )}
          style={{ 
            width: `${segment.value}%`,
            backgroundColor: segment.color,
            transition: 'width 0.3s ease',
          }}
          title={`${segment.value.toFixed(1)}%`}
        />
      ))}
    </div>
  );
}
