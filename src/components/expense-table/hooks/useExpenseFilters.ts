
import { useState } from 'react';

export function useExpenseFilters() {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
  };
  
  return {
    search,
    setSearch,
    selectedCategories,
    toggleCategory,
    clearFilters
  };
}
