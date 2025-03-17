
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { Currency, formatCurrency, convertCurrency } from '@/lib/data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExpenseHotspot {
  id: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  categoryId: string;
  position: number;
  monthIndex: number | null;
}

interface ExpenseHotspotsProps {
  hotspots: ExpenseHotspot[];
  displayCurrency: Currency;
  containerWidth: number;
  containerHeight: number;
  getCategoryName: (categoryId: string) => string;
  getCategoryColor: (categoryId: string) => string;
}

export function ExpenseHotspots({
  hotspots,
  displayCurrency,
  containerWidth,
  containerHeight,
  getCategoryName,
  getCategoryColor
}: ExpenseHotspotsProps) {
  // Group hotspots that are close to each other to prevent overlap
  const groupedHotspots = useMemo(() => {
    const positionThreshold = 0.02; // 2% of chart width
    const groups: ExpenseHotspot[][] = [];
    
    hotspots.forEach(hotspot => {
      // Find a group that this hotspot can join
      const existingGroup = groups.find(group => {
        const lastHotspot = group[group.length - 1];
        return Math.abs(lastHotspot.position - hotspot.position) < positionThreshold;
      });
      
      if (existingGroup) {
        existingGroup.push(hotspot);
      } else {
        groups.push([hotspot]);
      }
    });
    
    return groups;
  }, [hotspots]);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {groupedHotspots.map((group, groupIndex) => {
        const mainHotspot = group[0];
        const xPosition = mainHotspot.position * containerWidth;
        const multipleExpenses = group.length > 1;
        
        // Calculate color based on main expense or use a default for multiple
        const color = multipleExpenses ? '#6366f1' : getCategoryColor(mainHotspot.categoryId);
        
        return (
          <TooltipProvider key={groupIndex}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute pointer-events-auto cursor-pointer"
                  style={{
                    left: `${xPosition}px`,
                    bottom: '30%', // Position above the chart line
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col items-center">
                    <MapPin size={multipleExpenses ? 20 : 16} color={color} fill={color} fillOpacity={0.2} />
                    {multipleExpenses && (
                      <span className="text-xs font-semibold bg-background/80 rounded-full px-1 -mt-1">
                        {group.length}
                      </span>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px]">
                <div className="space-y-2">
                  {group.map(hotspot => (
                    <div key={hotspot.id} className="text-xs">
                      <div className="flex justify-between">
                        <span className="font-semibold">{hotspot.description}</span>
                        <span>{formatCurrency(convertCurrency(hotspot.amount, hotspot.currency, displayCurrency), displayCurrency)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{new Date(hotspot.date).toLocaleDateString()}</span>
                        <span>{getCategoryName(hotspot.categoryId)}</span>
                      </div>
                      {group.length > 1 && <hr className="my-1 border-border/50" />}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
