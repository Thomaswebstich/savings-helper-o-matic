
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, Currency, updateIncomeSource } from '@/lib/data';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Edit2, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IncomeEditorProps {
  incomeId: string; // Added incomeId for update operation
  income: number;
  currency: Currency;
  onIncomeChange: (newIncome: number) => void;
}

export function IncomeEditor({ incomeId, income, currency, onIncomeChange }: IncomeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(income.toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(inputValue);
    
    if (!isNaN(numValue) && numValue > 0) {
      try {
        // Update the income source in the database
        await updateIncomeSource(incomeId, { amount: numValue });
        
        // Update local state
        onIncomeChange(numValue);
        
        toast({
          title: "Success",
          description: "Income updated successfully",
        });
        
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating income:", error);
        toast({
          title: "Error",
          description: "Failed to update income",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
    }
  };

  return (
    <Popover open={isEditing} onOpenChange={setIsEditing}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-0 hover:bg-transparent"
          onClick={() => setIsEditing(true)}
        >
          <div className="flex items-center gap-1">
            <span className="font-medium">{formatCurrency(income, currency)}</span>
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="text-sm font-medium mb-1">Edit Monthly Income</div>
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min="0"
              step="100"
              className="flex-1"
              autoFocus
            />
            <Button type="submit" size="sm" className="px-2">
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
