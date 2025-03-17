
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Currency, formatCurrency, convertCurrency } from '@/lib/data';

interface SavingsTargetProps {
  yearlyTarget: number;
  setYearlyTarget: (target: number) => void;
  currency: Currency;
}

export function SavingsTarget({ yearlyTarget, setYearlyTarget, currency }: SavingsTargetProps) {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState<string>(yearlyTarget.toString());
  
  // Display target in current currency
  const displayYearlyTarget = convertCurrency(yearlyTarget, "THB", currency);
  
  const handleTargetChange = () => {
    const newTarget = Number(tempTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      // Store in THB for consistency
      setYearlyTarget(newTarget);
      localStorage.setItem('yearlyTarget', newTarget.toString());
    }
    setIsEditingTarget(false);
  };
  
  return (
    <Popover open={isEditingTarget} onOpenChange={setIsEditingTarget}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <Target className="h-3.5 w-3.5" />
          <span>Target: {formatCurrency(displayYearlyTarget, currency)}/year</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Set Yearly Savings Target</h4>
          <div className="flex gap-2">
            <Input
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(e.target.value)}
              placeholder="Enter yearly savings target"
              className="h-8"
            />
            <Button size="sm" onClick={handleTargetChange} className="h-8">Save</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
