
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Category,
  CATEGORY_ICONS,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from '@/lib/data';
import { CategoryBadge } from './CategoryBadge';
import * as Icons from 'lucide-react';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [color, setColor] = useState('bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300');
  
  const COLORS = [
    { name: 'Blue', value: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
    { name: 'Green', value: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' },
    { name: 'Orange', value: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' },
    { name: 'Yellow', value: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { name: 'Purple', value: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' },
    { name: 'Red', value: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' },
    { name: 'Emerald', value: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { name: 'Sky', value: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300' },
    { name: 'Indigo', value: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { name: 'Gray', value: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-300' },
  ];
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setIcon(CATEGORY_ICONS[0]);
    setColor(COLORS[0].value);
  };
  
  const handleAddCategory = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newCategory = await addCategory({
        name: name.trim(),
        icon,
        color
      });
      
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Success",
        description: "Category added successfully"
      });
      
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };
  
  const handleEditCategory = async () => {
    if (!currentCategory) return;
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedCategory = await updateCategory(currentCategory.id, {
        name: name.trim(),
        icon,
        color
      });
      
      setCategories(prev => 
        prev.map(cat => cat.id === currentCategory.id ? updatedCategory : cat)
      );
      
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
      
      setIsEditDialogOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      await deleteCategory(currentCategory.id);
      
      setCategories(prev => 
        prev.filter(cat => cat.id !== currentCategory.id)
      );
      
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };
  
  const startEdit = (category: Category) => {
    setCurrentCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
    setIsEditDialogOpen(true);
  };
  
  const startDelete = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  const renderIconPreview = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Expense Categories</h3>
        <Button 
          size="sm" 
          onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>
      
      {isLoading ? (
        <div className="h-36 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No categories found. Add your first category.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <CategoryBadge category={category} />
                    </TableCell>
                    <TableCell>
                      {renderIconPreview(category.icon)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => startDelete(category)}
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
      )}
      
      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new expense category
            </DialogDescription>
          </DialogHeader>
          
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
                        {renderIconPreview(iconName)}
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
                  {renderIconPreview(icon)}
                  <span className="ml-1">{name || 'Category Name'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update this expense category
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input 
                id="edit-name" 
                value={name} 
                onChange={e => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-icon">Icon</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ICONS.map(iconName => (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center">
                        {renderIconPreview(iconName)}
                        <span className="ml-2">{iconName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-color">Color</Label>
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
                  {renderIconPreview(icon)}
                  <span className="ml-1">{name || 'Category Name'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentCategory && (
            <div className="py-4 flex justify-center">
              <CategoryBadge category={currentCategory} />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
