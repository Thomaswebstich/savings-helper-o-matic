import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Upload, Image, Check, X, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/data';
import { Currency } from '@/lib/types/currency';

interface PendingExpense {
  id: string;
  previewUrl: string;
  data: ExpenseFormValues & { receiptThumbnail?: string };
  isProcessing: boolean;
  isApproved: boolean;
  fileName: string;
}

interface ExpenseImageUploadProps {
  onExpenseRecognized: (data: ExpenseFormValues & { receiptThumbnail?: string }) => void;
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
  const [pendingExpenses, setPendingExpenses] = useState<PendingExpense[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingQueue, setProcessingQueue] = useState<boolean>(false);

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
        const imageFiles = Array.from(e.dataTransfer.files).filter(file => 
          file.type.startsWith('image/')
        );
        
        if (imageFiles.length > 0) {
          addFilesToQueue(imageFiles);
        }
      } else if (e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiUpload) {
        const imageFiles = Array.from(e.target.files).filter(file => 
          file.type.startsWith('image/')
        );
        
        if (imageFiles.length > 0) {
          addFilesToQueue(imageFiles);
        }
      } else if (e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createThumbnail = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const MAX_WIDTH = 100;
        const aspectRatio = img.width / img.height;
        const targetWidth = Math.min(MAX_WIDTH, img.width);
        const targetHeight = targetWidth / aspectRatio;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnailUrl);
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imgUrl;
    });
  };

  const addFilesToQueue = (files: File[]) => {
    const newPendingExpenses: PendingExpense[] = files.map(file => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      data: {
        description: '',
        amount: 0,
        date: new Date(),
        category: '',
        isRecurring: false,
        currency: 'THB' as Currency
      },
      isProcessing: true,
      isApproved: false,
      fileName: file.name
    }));
    
    setPendingExpenses(prev => [...prev, ...newPendingExpenses]);
    
    if (!processingQueue) {
      processFilesSequentially(files);
    }
  };

  const processFilesSequentially = async (files: File[]) => {
    setProcessingQueue(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const pendingIndex = pendingExpenses.length + i;
        await analyzeImage(file, pendingIndex);
        
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
    
    setProcessingQueue(false);
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    
    if (multiUpload) {
      const pendingIndex = pendingExpenses.length;
      const newExpense: PendingExpense = {
        id: crypto.randomUUID(),
        previewUrl, 
        data: {
          description: '',
          amount: 0,
          date: new Date(),
          category: '',
          isRecurring: false,
          currency: 'THB' as Currency
        },
        isProcessing: true,
        isApproved: false,
        fileName: file.name
      };
      
      setPendingExpenses(prev => [...prev, newExpense]);
      
      await analyzeImage(file, pendingExpenses.length);
    } else {
      setIsUploading(true);
      await analyzeImage(file);
    }
  };

  const analyzeImage = async (file: File, pendingIndex?: number) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      if (categories.length > 0) {
        const categoriesData = categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }));
        formData.append('categories', JSON.stringify(categoriesData));
      }

      console.log("Sending image for analysis...", file.name, file.type, file.size);

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

      if (data?.data) {
        const { amount, currency, date, vendor, category, description } = data.data;
        
        const expenseValues: ExpenseFormValues & { receiptThumbnail?: string } = {
          description: description || vendor || 'Expense from receipt',
          amount: parseFloat(amount) || 0,
          date: date ? new Date(date) : new Date(),
          category: findMatchingCategory(category),
          isRecurring: false,
          currency: (currency as Currency) || ('THB' as Currency),
        };

        let thumbnailUrl = '';
        if (pendingIndex !== undefined && pendingIndex < pendingExpenses.length) {
          const expense = pendingExpenses[pendingIndex];
          if (expense) {
            try {
              thumbnailUrl = await createThumbnail(expense.previewUrl);
              expenseValues.receiptThumbnail = thumbnailUrl;
            } catch (err) {
              console.error('Error creating thumbnail:', err);
            }
          }
        } else if (file) {
          try {
            const previewUrl = URL.createObjectURL(file);
            thumbnailUrl = await createThumbnail(previewUrl);
            expenseValues.receiptThumbnail = thumbnailUrl;
            URL.revokeObjectURL(previewUrl);
          } catch (err) {
            console.error('Error creating thumbnail:', err);
          }
        }

        if (multiUpload && pendingIndex !== undefined) {
          setPendingExpenses(prev => {
            const updated = [...prev];
            if (pendingIndex < updated.length) {
              updated[pendingIndex] = {
                ...updated[pendingIndex],
                data: expenseValues,
                isProcessing: false
              };
            }
            return updated;
          });
          
          toast({
            title: "Receipt analyzed",
            description: `Analysis complete for ${file.name}`,
          });
        } else {
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
      
      if (multiUpload && pendingIndex !== undefined && pendingIndex < pendingExpenses.length) {
        setPendingExpenses(prev => {
          const updated = [...prev];
          if (pendingIndex < updated.length) {
            updated[pendingIndex].isProcessing = false;
          }
          return updated;
        });
      }
      
      toast({
        title: "Analysis failed",
        description: `Could not analyze ${file.name}. Please try again or enter details manually.`,
        variant: "destructive"
      });
    } finally {
      if (!multiUpload) {
        setIsUploading(false);
      }
    }
  };

  const findMatchingCategory = (aiCategory: string): string => {
    if (!aiCategory || categories.length === 0) return '';
    
    const directMatch = categories.find(c => c.id === aiCategory);
    if (directMatch) return directMatch.id;
    
    const nameMatch = categories.find(c => 
      c.name.toLowerCase() === aiCategory.toLowerCase()
    );
    if (nameMatch) return nameMatch.id;
    
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
    pendingExpenses.forEach(expense => {
      URL.revokeObjectURL(expense.previewUrl);
    });
    setPendingExpenses([]);
  };

  const handleExpenseApprove = (expenseId: string) => {
    const expenseIndex = pendingExpenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return;
    
    const expense = pendingExpenses[expenseIndex];
    if (!expense.isProcessing) {
      onExpenseRecognized(expense.data);
      
      setPendingExpenses(prev => {
        const updated = [...prev];
        updated[expenseIndex] = {
          ...updated[expenseIndex],
          isApproved: true
        };
        return updated;
      });
      
      toast({
        title: "Expense added",
        description: `${expense.data.description} (${expense.data.currency} ${expense.data.amount}) has been added to your expenses`,
      });
    }
  };

  const handleExpenseDelete = (expenseId: string) => {
    const expenseToDelete = pendingExpenses.find(e => e.id === expenseId);
    if (expenseToDelete) {
      URL.revokeObjectURL(expenseToDelete.previewUrl);
    }
    
    setPendingExpenses(prev => prev.filter(exp => exp.id !== expenseId));
  };

  const clearApprovedExpenses = () => {
    pendingExpenses.filter(exp => exp.isApproved).forEach(expense => {
      URL.revokeObjectURL(expense.previewUrl);
    });
    
    setPendingExpenses(prev => prev.filter(exp => !exp.isApproved));
  };

  useEffect(() => {
    if (pendingExpenses.length > 0 && pendingExpenses.every(exp => exp.isApproved)) {
      setTimeout(() => {
        handleCancel();
      }, 1000);
    }
  }, [pendingExpenses]);

  useEffect(() => {
    return () => {
      pendingExpenses.forEach(expense => {
        URL.revokeObjectURL(expense.previewUrl);
      });
    };
  }, []);

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
                  {isUploading || processingQueue ? <Spinner className="w-6 h-6" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
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
                {pendingExpenses.map((expense) => (
                  <div 
                    key={expense.id} 
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
                          {expense.isProcessing ? expense.fileName : expense.data.description}
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
                                onClick={() => handleExpenseDelete(expense.id)}
                              >
                                <Trash className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5" 
                                onClick={() => handleExpenseApprove(expense.id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {!expense.isProcessing && (
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
                      )}
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
