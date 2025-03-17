
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { Category } from '@/lib/data';
import { CategoryBadge } from '@/components/CategoryBadge';
import { IconPreview } from './IconPreview';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function CategoryTable({ 
  categories, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown 
}: CategoryTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Order</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                No categories found. Add your first category.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={index === 0}
                        onClick={() => onMoveUp(index)}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={index === categories.length - 1}
                        onClick={() => onMoveDown(index)}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <CategoryBadge category={category} />
                </TableCell>
                <TableCell>
                  <IconPreview iconName={category.icon} />
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(category)}
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
