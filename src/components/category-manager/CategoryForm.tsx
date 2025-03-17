
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Category, CATEGORY_ICONS, addCategory, updateCategory } from '@/lib/data';
import { IconPreview } from './IconPreview';
import { COLORS } from './constants';

interface CategoryFormProps {
  initialCategory?: Category;
  onSubmit: (category: Category) => void;
  onCancel: () => void;
  submitButtonText: string;
}

export function CategoryForm({ 
  initialCategory, 
  onSubmit,
  onCancel,
  submitButtonText 
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [color, setColor] = useState(COLORS[0].value);
  
  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setIcon(initialCategory.icon);
      setColor(initialCategory.color);
    }
  }, [initialCategory]);
  
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (initialCategory) {
        // Edit mode
        const updatedCategory = await updateCategory(initialCategory.id, {
          name: name.trim(),
          icon,
          color,
          displayOrder: initialCategory.displayOrder
        });
        onSubmit(updatedCategory);
      } else {
        // Add mode
        const newCategory = await addCategory({
          name: name.trim(),
          icon,
          color,
          displayOrder: 999 // Will be sorted later
        });
        onSubmit(newCategory);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: `Failed to ${initialCategory ? 'update' : 'add'} category`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Entertainment"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ICONS.map(iconName => (
                <SelectItem key={iconName} value={iconName}>
                  <div className="flex items-center">
                    <IconPreview iconName={iconName} />
                    <span className="ml-2">{iconName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              {COLORS.map(colorOption => (
                <SelectItem key={colorOption.name} value={colorOption.value}>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${colorOption.value.split(' ')[0]}`}></div>
                    <span className="ml-2">{colorOption.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4">
          <Label>Preview</Label>
          <div className="mt-2 p-4 border rounded-md flex justify-center">
            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
              <IconPreview iconName={icon} />
              <span className="ml-1">{name || 'Category Name'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {submitButtonText}
        </Button>
      </DialogFooter>
    </>
  );
}
