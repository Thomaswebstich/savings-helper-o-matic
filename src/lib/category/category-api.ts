
import { supabase } from "@/integrations/supabase/client";
import { Category } from '../types';

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name'); // Fallback to ordering by name
    
  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  // Map database fields to our Category type
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    color: item.color,
    displayOrder: item.display_order || undefined
  }));
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      icon: category.icon,
      color: category.color,
      display_order: category.displayOrder
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    displayOrder: data.display_order || undefined
  };
};

export const updateCategory = async (id: string, changes: Partial<Omit<Category, 'id'>>): Promise<Category> => {
  // Map our type fields to database fields
  const dbChanges: any = {};
  if (changes.name !== undefined) dbChanges.name = changes.name;
  if (changes.icon !== undefined) dbChanges.icon = changes.icon;
  if (changes.color !== undefined) dbChanges.color = changes.color;
  if (changes.displayOrder !== undefined) dbChanges.display_order = changes.displayOrder;
  
  const { data, error } = await supabase
    .from('categories')
    .update(dbChanges)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    displayOrder: data.display_order || undefined
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
