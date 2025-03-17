
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from './CategoryManager';
import { BudgetManager } from './BudgetManager';
import { IncomeManager } from './IncomeManager';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";

interface SettingsManagerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsManager({ open, onClose }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState("categories");
  
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="md:max-w-xl w-full overflow-y-auto sm:max-h-[90vh] mx-auto inset-0 h-auto mt-16 mb-16 rounded-t-lg sm:rounded-lg">
        <SheetHeader className="pb-4">
          <SheetTitle>Financial Settings</SheetTitle>
          <SheetDescription>
            Manage your expense categories, budgets, and income sources
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="budgets">Budgets</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="mt-4">
              <CategoryManager />
            </TabsContent>
            
            <TabsContent value="budgets" className="mt-4">
              <BudgetManager />
            </TabsContent>
            
            <TabsContent value="income" className="mt-4">
              <IncomeManager />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
