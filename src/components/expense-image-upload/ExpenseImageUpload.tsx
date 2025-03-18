
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Upload, Image, Check, X, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/data';

interface ExpenseImageUploadProps {
  onExpenseRecognized: (data: ExpenseFormValues) => void;
  categories?: Category[];
  disabled?: boolean;
  compact?: boolean;
  multiUpload?: boolean;
}

export function ExpenseImageUpload({ 
  onExpenseRecognized, 
  categories = [], 
  disabled = false,
  compact = false,
  multiUpload = false
}: ExpenseImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingExpenses, setPendingExpenses] = useState<Array<{
    previewUrl: string;
    data: ExpenseFormValues;
    isProcessing: boolean;
    isApproved: boolean;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (multiUpload) {
        // Process multiple files
        Array.from(e.dataTransfer.files).forEach(file => {
          if (file.type.startsWith('image/')) {
            handleImageFile(file);
          }
        });
      } else if (e.dataTransfer.files[0]) {
        // Process single file
        handleImageFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiUpload) {
        // Process multiple files
        Array.from(e.target.files).forEach(file => {
          if (file.type.startsWith('image/')) {
            handleImageFile(file);
          }
        });
      } else if (e.target.files[0]) {
        // Process single file
        handleImageFile(e.target.files[0]);
      }
    }
  };

  const handleImageFile = async (file: File) => {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    
    if (multiUpload) {
      // Add to pending list first
      const pendingIndex = pendingExpenses.length;
      setPendingExpenses(prev => [
        ...prev, 
        { 
          previewUrl, 
          data: {
            description: '',
            amount: 0,
            date: new Date(),
            category: '',
            isRecurring: false,
            currency: 'THB'
          },
          isProcessing: true,
          isApproved: false
        }
      ]);
      
      // Process the image
      await analyzeImage(file, pendingIndex);
    } else {
      // Single upload mode - process immediately
      setIsUploading(true);
      await analyzeImage(file);
    }
  };

  const analyzeImage = async (file: File, pendingIndex?: number) => {
    try {
      // Create form data for the file
      const formData = new FormData();
      formData.append('image', file);
      
      // Add categories to help with classification
      if (categories.length > 0) {
        const categoriesData = categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }));
        formData.append('categories', JSON.stringify(categoriesData));
      }

      console.log("Sending image for analysis...", file.name, file.type, file.size);

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-expense-image', {
        body: formData,
        headers: {
          'Accept': 'multipart/form-data',
        },
      });

      if (error) {
        console.error("Error analyzing image:", error);
        throw error;
      }

      console.log("Analysis response:", data);

      // Process the recognized data
      if (data?.data) {
        const { amount, currency, date, vendor, category, description } = data.data;
        
        // Create an expense form values object with all required fields
        const expenseValues: ExpenseFormValues = {
          description: description || vendor || 'Expense from receipt',
          amount: parseFloat(amount) || 0,
          date: date ? new Date(date) : new Date(),
          // Try to map the category from OpenAI to one in our list
          category: findMatchingCategory(category),
          isRecurring: false,
          currency: (currency as any) || 'THB',
        };

        if (multiUpload && pendingIndex !== undefined) {
          // Update the pending expense
          setPendingExpenses(prev => {
            const updated = [...prev];
            updated[pendingIndex] = {
              ...updated[pendingIndex],
              data: expenseValues,
              isProcessing: false
            };
            return updated;
          });
          
          toast({
            title: "Receipt analyzed",
            description: "We've extracted the details from your receipt",
          });
        } else {
          // Single upload mode - call callback directly
          toast({
            title: "Receipt analyzed",
            description: "We've extracted the expense details from your receipt",
          });
          onExpenseRecognized(expenseValues);
        }
      } else {
        throw new Error('No data returned from image analysis');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      if (multiUpload && pendingIndex !== undefined) {
        // Update the pending expense to show error
        setPendingExpenses(prev => {
          const updated = [...prev];
          if (updated[pendingIndex]) {
            updated[pendingIndex].isProcessing = false;
          }
          return updated;
        });
      }
      
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your receipt. Please try again or enter details manually.",
        variant: "destructive"
      });
    } finally {
      if (!multiUpload) {
        setIsUploading(false);
      }
    }
  };

  // Helper function to find matching category from our list
  const findMatchingCategory = (aiCategory: string): string => {
    if (!aiCategory || categories.length === 0) return '';
    
    // Direct ID match (if OpenAI returned one of our IDs)
    const directMatch = categories.find(c => c.id === aiCategory);
    if (directMatch) return directMatch.id;
    
    // Name match (if OpenAI returned a category name)
    const nameMatch = categories.find(c => 
      c.name.toLowerCase() === aiCategory.toLowerCase()
    );
    if (nameMatch) return nameMatch.id;
    
    // Fuzzy match (if OpenAI returned something similar)
    const fuzzyMatch = categories.find(c => 
      c.name.toLowerCase().includes(aiCategory.toLowerCase()) || 
      aiCategory.toLowerCase().includes(c.name.toLowerCase())
    );
    if (fuzzyMatch) return fuzzyMatch.id;
    
    return '';
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    setPendingExpenses([]);
  };

  const handleExpenseApprove = (index: number) => {
    setPendingExpenses(prev => {
      const expense = prev[index];
      if (!expense.isProcessing) {
        onExpenseRecognized(expense.data);
        
        // Mark as approved
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          isApproved: true
        };
        return updated;
      }
      return prev;
    });
  };

  const handleExpenseDelete = (index: number) => {
    setPendingExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const clearApprovedExpenses = () => {
    setPendingExpenses(prev => prev.filter(exp => !exp.isApproved));
  };

  // Cleanup pending list - remove approved items if all are approved
  if (pendingExpenses.length > 0 && pendingExpenses.every(exp => exp.isApproved)) {
    setTimeout(() => {
      setPendingExpenses([]);
    }, 1000);
  }

  return (
    <Card className={cn(
      "border-dashed",
      compact ? "border-0 shadow-none" : ""
    )}>
      <CardContent className={compact ? "p-0" : "p-4"}>
        <div className="space-y-4">
          <div
            className={cn(
              "flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all",
              compact ? "p-3" : "p-6",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              isUploading ? "opacity-50 cursor-wait" : "",
              pendingExpenses.length > 0 ? "border-primary" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={isUploading || disabled}
              multiple={multiUpload}
            />

            {!multiUpload && pendingExpenses.length > 0 && pendingExpenses[0].previewUrl ? (
              <div className="relative w-full max-h-48 overflow-hidden rounded-md">
                <img src={pendingExpenses[0].previewUrl} alt="Receipt preview" className="w-full object-contain max-h-48" />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                    <Spinner className="w-8 h-8" />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3 bg-muted rounded-full p-3">
                  {isUploading ? <Spinner className="w-6 h-6" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
                </div>
                <p className={cn(
                  "font-medium mb-1",
                  compact ? "text-xs" : "text-sm"
                )}>
                  {multiUpload 
                    ? "Drag & drop receipt images" 
                    : "Drag & drop a receipt image"}
                </p>
                <p className={cn(
                  "text-muted-foreground", 
                  compact ? "text-xs" : "text-sm"
                )}>
                  Or click to browse files
                  {multiUpload && <span> (select multiple)</span>}
                </p>
              </>
            )}
          </div>

          {/* Pending receipts list (for multi-upload mode) */}
          {multiUpload && pendingExpenses.length > 0 && (
            <>
              <div className="text-sm font-medium mt-2 flex justify-between items-center">
                <span>Receipts ({pendingExpenses.length})</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isUploading || disabled}
                >
                  <Trash className="h-4 w-4 mr-1" /> Clear all
                </Button>
              </div>
              <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-1">
                {pendingExpenses.map((expense, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "p-3 rounded-lg border flex items-start gap-3 group transition-colors",
                      expense.isApproved 
                        ? "bg-primary/10 border-primary/20" 
                        : "bg-card border-border"
                    )}
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={expense.previewUrl} 
                        alt="Receipt preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm truncate">
                          {expense.data.description}
                        </p>
                        <div className="flex gap-1">
                          {expense.isProcessing ? (
                            <Spinner className="w-4 h-4" />
                          ) : expense.isApproved ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5" 
                                onClick={() => handleExpenseDelete(index)}
                              >
                                <Trash className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5" 
                                onClick={() => handleExpenseApprove(index)}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-medium">
                            {expense.data.currency} {expense.data.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">
                            {expense.data.date.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Category:</span>
                          <span className="font-medium">
                            {categories.find(c => c.id === expense.data.category)?.name || 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!multiUpload && pendingExpenses.length > 0 && (
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full"
                onClick={handleCancel}
                disabled={isUploading || disabled}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
