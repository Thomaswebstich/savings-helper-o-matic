
import { useState, useEffect, useMemo } from 'react';
import { 
  IncomeSource, 
  fetchIncomeSources, 
  calculateTotalMonthlyIncome, 
  convertCurrency, 
  Currency 
} from '@/lib/data';

export function useIncomeData(displayCurrency: Currency = "THB") {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIncomeData() {
      try {
        const incomeData = await fetchIncomeSources();
        setIncomeSources(incomeData);
      } catch (error) {
        console.error('Error fetching income sources:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchIncomeData();
  }, []);

  const monthlyIncome = useMemo(() => {
    // Calculate total monthly income, including one-time incomes for current month
    const totalInTHB = calculateTotalMonthlyIncome(incomeSources);
    return convertCurrency(totalInTHB, "THB", displayCurrency);
  }, [incomeSources, displayCurrency]);

  const refreshIncomeData = async () => {
    try {
      const incomeData = await fetchIncomeSources();
      setIncomeSources(incomeData);
    } catch (error) {
      console.error('Error refreshing income data:', error);
    }
  };

  return {
    incomeSources,
    monthlyIncome,
    refreshIncomeData,
    isLoading
  };
}
