
import { useState } from 'react';
import { Expense } from '@/lib/data';
import { SortConfig } from '../types';

export function useSortExpenses() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'date', direction: 'desc' 
  });
  
  const requestSort = (key: keyof Expense) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: keyof Expense) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 'asc' : 'desc';
  };

  return {
    sortConfig,
    requestSort,
    getSortIcon
  };
}
