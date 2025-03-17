
import { Calendar, SortAsc, SortDesc } from 'lucide-react';
import { TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Expense } from '@/lib/data';
import { CheckSquare } from 'lucide-react';

interface ExpenseTableHeaderProps {
  requestSort: (key: keyof Expense) => void;
  getSortIcon: (key: keyof Expense) => 'asc' | 'desc' | null;
}

export function ExpenseTableHeader({ requestSort, getSortIcon }: ExpenseTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="notion-db-header">
        <TableHead 
          className="font-medium w-2/5 cursor-pointer py-1.5"
          onClick={() => requestSort('description')}
        >
          <div className="flex items-center">
            Description {getSortIcon('description') === 'asc' ? 
              <SortAsc className="w-4 h-4" /> : 
              getSortIcon('description') === 'desc' ? 
              <SortDesc className="w-4 h-4" /> : null}
          </div>
        </TableHead>
        <TableHead 
          className="font-medium w-1/5 cursor-pointer py-1.5"
          onClick={() => requestSort('amount')}
        >
          <div className="flex items-center">
            Amount {getSortIcon('amount') === 'asc' ? 
              <SortAsc className="w-4 h-4" /> : 
              getSortIcon('amount') === 'desc' ? 
              <SortDesc className="w-4 h-4" /> : null}
          </div>
        </TableHead>
        <TableHead 
          className="font-medium w-1/5 cursor-pointer py-1.5"
          onClick={() => requestSort('date')}
        >
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Date {getSortIcon('date') === 'asc' ? 
              <SortAsc className="w-4 h-4" /> : 
              getSortIcon('date') === 'desc' ? 
              <SortDesc className="w-4 h-4" /> : null}
          </div>
        </TableHead>
        <TableHead 
          className="font-medium w-1/5 cursor-pointer py-1.5"
          onClick={() => requestSort('category')}
        >
          <div className="flex items-center">
            Category {getSortIcon('category') === 'asc' ? 
              <SortAsc className="w-4 h-4" /> : 
              getSortIcon('category') === 'desc' ? 
              <SortDesc className="w-4 h-4" /> : null}
          </div>
        </TableHead>
        <TableHead className="font-medium w-8 py-1.5">
          <div className="flex items-center">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
        </TableHead>
        <TableHead className="font-medium text-right w-20 py-1.5">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
