
import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { ExpenseTable } from '@/components/ExpenseTable';
import { Expense, Category } from '@/lib/data';

interface ExpenseTableWrapperProps {
  expenses: Expense[];
  categories: Category[];
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export function ExpenseTableWrapper({
  expenses,
  categories,
  onAddExpense,
  onEditExpense,
  onDeleteExpense
}: ExpenseTableWrapperProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Expenses</h2>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      <ExpenseTable 
        expenses={expenses}
        categories={categories}
        onAddExpense={onAddExpense}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
}
