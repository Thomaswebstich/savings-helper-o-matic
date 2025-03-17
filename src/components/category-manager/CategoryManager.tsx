
import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Category, fetchCategories, deleteCategory, updateCategory } from '@/lib/data';
import { CategoryTable } from './CategoryTable';
import { CategoryForm } from './CategoryForm';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
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
  
  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      await deleteCategory(currentCategory.id);
      
      const remainingCategories = categories.filter(cat => cat.id !== currentCategory.id);
      
      for (let i = 0; i < remainingCategories.length; i++) {
        await updateCategory(remainingCategories[i].id, { displayOrder: i });
      }
      
      setCategories(remainingCategories);
      
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
  
  const moveCategoryUp = async (index: number) => {
    if (index <= 0) return; // Already at the top
    
    const newCategories = [...categories];
    const categoryToMove = newCategories[index];
    const categoryAbove = newCategories[index - 1];
    
    try {
      await updateCategory(categoryToMove.id, { 
        displayOrder: categoryToMove.displayOrder !== undefined ? index - 1 : index - 1 
      });
      await updateCategory(categoryAbove.id, { 
        displayOrder: categoryAbove.displayOrder !== undefined ? index : index 
      });
      
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
      setCategories(newCategories);
      
      toast({
        title: "Success",
        description: "Category order updated"
      });
    } catch (error) {
      console.error('Error updating category order:', error);
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive"
      });
    }
  };
  
  const moveCategoryDown = async (index: number) => {
    if (index >= categories.length - 1) return; // Already at the bottom
    
    const newCategories = [...categories];
    const categoryToMove = newCategories[index];
    const categoryBelow = newCategories[index + 1];
    
    try {
      await updateCategory(categoryToMove.id, { 
        displayOrder: categoryToMove.displayOrder !== undefined ? index + 1 : index + 1 
      });
      await updateCategory(categoryBelow.id, { 
        displayOrder: categoryBelow.displayOrder !== undefined ? index : index 
      });
      
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      setCategories(newCategories);
      
      toast({
        title: "Success",
        description: "Category order updated"
      });
    } catch (error) {
      console.error('Error updating category order:', error);
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive"
      });
    }
  };
  
  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories(prev => 
      prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
    );
    
    setIsEditDialogOpen(false);
    setCurrentCategory(null);
  };
  
  const handleCategoryAdded = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
    setIsAddDialogOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Expense Categories</h3>
        <Button 
          size="sm" 
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>
      
      {isLoading ? (
        <div className="h-36 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <CategoryTable 
          categories={categories}
          onEdit={(category) => {
            setCurrentCategory(category);
            setIsEditDialogOpen(true);
          }}
          onDelete={(category) => {
            setCurrentCategory(category);
            setIsDeleteDialogOpen(true);
          }}
          onMoveUp={moveCategoryUp}
          onMoveDown={moveCategoryDown}
        />
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
          
          <CategoryForm 
            onSubmit={handleCategoryAdded}
            onCancel={() => setIsAddDialogOpen(false)}
            submitButtonText="Add Category"
          />
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
          
          {currentCategory && (
            <CategoryForm 
              initialCategory={currentCategory}
              onSubmit={handleCategoryUpdated}
              onCancel={() => setIsEditDialogOpen(false)}
              submitButtonText="Update Category"
            />
          )}
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

// Import needed for JSX to work correctly
import { CategoryBadge } from '@/components/CategoryBadge';
