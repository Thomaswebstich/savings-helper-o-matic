
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Category } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExpenseTableFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  categories: Category[];
  selectedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  clearFilters: () => void;
  onAddExpense?: () => void;
}

export function ExpenseTableFilters({
  search,
  setSearch,
  categories,
  selectedCategories,
  toggleCategory,
  clearFilters,
  onAddExpense
}: ExpenseTableFiltersProps) {
  return (
    <div className="relative w-full md:w-72">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search expenses..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="pl-9 bg-background w-full"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 ml-2">
            <Filter className="w-4 h-4 mr-2" />
            {selectedCategories.length ? `${selectedCategories.length} selected` : 'Category'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="p-2">
            <div className="mb-2 text-xs font-medium">Categories</div>
            {categories.map(category => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              >
                <CategoryBadge category={category} withLabel />
              </DropdownMenuCheckboxItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <div className="p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs h-8"
              onClick={clearFilters}
            >
              <X className="w-3.5 h-3.5 mr-2" />
              Clear filters
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
