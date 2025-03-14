
import { useState } from 'react';
import { Menu, X, MoonStar, Sun, ChevronUp, Search, PlusCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Currency } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dispatch, SetStateAction } from 'react';

interface NavbarProps {
  onAddExpense?: () => void;
  displayCurrency?: Currency;
  onCurrencyChange?: Dispatch<SetStateAction<Currency>>;
}

export function Navbar({ onAddExpense, displayCurrency = "THB", onCurrencyChange }: NavbarProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCurrencyChange = (value: string) => {
    if (onCurrencyChange && (value === "THB" || value === "USD" || value === "EUR")) {
      onCurrencyChange(value as Currency);
    }
  };
  
  return (
    <header className="py-3 px-4 border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50 transition-all">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleMenu}>
            {isOpen ? <X /> : <Menu />}
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Flow Finance</h1>
          </div>
        </div>
        
        <nav className={cn(
          "fixed inset-0 top-[56px] z-50 flex flex-col bg-background pt-4 transition-all md:static md:flex md:translate-x-0 md:flex-row md:items-center md:gap-4 md:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="hidden md:flex">
            <Button variant="outline" size="sm" className="mr-2">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            
            {onAddExpense && (
              <Button size="sm" onClick={onAddExpense}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            )}
          </div>
        </nav>
        
        <div className="flex items-center gap-2">
          {/* Currency Selector */}
          {onCurrencyChange && (
            <Select value={displayCurrency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="THB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THB">THB</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hidden md:inline-flex">
            {darkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full bg-primary/10"
          >
            <span className="text-sm font-medium text-primary">JP</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

// Export the dollar sign icon component for reuse
export function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );
}
