
import { useState } from 'react';
import { format } from 'date-fns';

export function useExpandedMonths() {
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  
  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths(prev => 
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  const isMonthExpanded = (monthKey: string) => {
    return expandedMonths.includes(monthKey);
  };

  return {
    expandedMonths,
    toggleMonthExpansion,
    isMonthExpanded
  };
}
