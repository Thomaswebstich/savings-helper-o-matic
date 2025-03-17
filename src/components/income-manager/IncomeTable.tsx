
import { format } from 'date-fns';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IncomeEditor } from './IncomeEditor';
import { IncomeSource, Currency } from '@/lib/data';

interface IncomeTableProps {
  incomeSources: IncomeSource[];
  onEdit: (income: IncomeSource) => void;
  onDelete: (income: IncomeSource) => void;
  onIncomeChange: (updatedIncome: IncomeSource) => void;
}

export function IncomeTable({ incomeSources, onEdit, onDelete, onIncomeChange }: IncomeTableProps) {
  const handleAmountChange = (income: IncomeSource, newAmount: number) => {
    onIncomeChange({ ...income, amount: newAmount });
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Recurring</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incomeSources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No income sources found. Add your first income source.
              </TableCell>
            </TableRow>
          ) : (
            incomeSources.map(income => (
              <TableRow key={income.id}>
                <TableCell>{income.description}</TableCell>
                <TableCell>
                  <IncomeEditor 
                    incomeId={income.id}
                    income={income.amount} 
                    currency={income.currency}
                    onIncomeChange={(newAmount) => handleAmountChange(income, newAmount)}
                  />
                </TableCell>
                <TableCell>
                  {income.isRecurring ? (
                    <span className="inline-flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-1" />
                      {income.recurrenceInterval || 'monthly'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <X className="h-4 w-4 text-gray-400 mr-1" />
                      One-time
                    </span>
                  )}
                </TableCell>
                <TableCell>{format(income.startDate, 'PP')}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(income)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(income)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
