
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  IncomeSource,
  fetchIncomeSources,
  calculateTotalMonthlyIncome,
  formatCurrency
} from '@/lib/data';
import { IncomeSummary } from './IncomeSummary';
import { IncomeTable } from './IncomeTable';
import { IncomeFormDialog } from './IncomeFormDialog';
import { IncomeDeleteDialog } from './IncomeDeleteDialog';

export function IncomeManager() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentIncome, setCurrentIncome] = useState<IncomeSource | null>(null);
  
  useEffect(() => {
    loadIncomeSources();
  }, []);
  
  const loadIncomeSources = async () => {
    setIsLoading(true);
    try {
      const data = await fetchIncomeSources();
      setIncomeSources(data);
    } catch (error) {
      console.error('Error loading income sources:', error);
      toast({
        title: "Error",
        description: "Failed to load income sources",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startEdit = (income: IncomeSource) => {
    setCurrentIncome(income);
    setIsDialogOpen(true);
  };
  
  const startDelete = (income: IncomeSource) => {
    setCurrentIncome(income);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAddClick = () => {
    setCurrentIncome(null);
    setIsDialogOpen(true);
  };
  
  const handleIncomeChange = (updatedIncome: IncomeSource) => {
    setIncomeSources(prev => 
      prev.map(inc => inc.id === updatedIncome.id ? updatedIncome : inc)
    );
  };
  
  const handleIncomeAdd = (newIncome: IncomeSource) => {
    setIncomeSources(prev => [newIncome, ...prev]);
  };
  
  const handleIncomeDelete = (incomeId: string) => {
    setIncomeSources(prev => prev.filter(inc => inc.id !== incomeId));
  };
  
  const closeFormDialog = () => {
    setIsDialogOpen(false);
    setCurrentIncome(null);
  };
  
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCurrentIncome(null);
  };
  
  const totalMonthlyIncome = calculateTotalMonthlyIncome(incomeSources);
  
  return (
    <div className="space-y-4">
      <IncomeSummary 
        totalMonthlyIncome={totalMonthlyIncome} 
        onAddClick={handleAddClick} 
      />
      
      {isLoading ? (
        <div className="h-36 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <IncomeTable 
          incomeSources={incomeSources} 
          onEdit={startEdit}
          onDelete={startDelete}
          onIncomeChange={handleIncomeChange}
        />
      )}
      
      <IncomeFormDialog 
        open={isDialogOpen}
        income={currentIncome}
        onClose={closeFormDialog}
        onIncomeAdd={handleIncomeAdd}
        onIncomeUpdate={handleIncomeChange}
      />
      
      <IncomeDeleteDialog 
        open={isDeleteDialogOpen}
        income={currentIncome}
        onClose={closeDeleteDialog}
        onDelete={handleIncomeDelete}
      />
    </div>
  );
}
