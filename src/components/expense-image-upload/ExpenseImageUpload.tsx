
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Upload, Image as ImageIcon, Check, X, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/data';
import { Currency } from '@/lib/types/currency';

interface ExpenseImageUploadProps {
  onExpenseRecognized?: (expenseData: ExpenseFormValues & { receiptImage?: string; receiptThumbnail?: string }) => void;
  categories?: Category[];
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  multiUpload?: boolean;
}

export function ExpenseImageUpload({ 
  onExpenseRecognized, 
  categories = [],
  className,
  compact = false,
  disabled = false,
  multiUpload = false
}: ExpenseImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [fullImages, setFullImages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      console.log(`Added ${newFiles.length} files, now have ${files.length + newFiles.length} files`);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Process each file as it's added
  useEffect(() => {
    files.forEach(file => {
      if (!processing[file.name] && !results[file.name]) {
        analyzeExpenseImage(file);
      }
    });
  }, [files]);

  const analyzeExpenseImage = async (file: File) => {
    // Generate file thumbnail first
    try {
      // Create a thumbnail for display
      const fileUrl = URL.createObjectURL(file);
      const thumbnail = await createThumbnail(fileUrl);
      
      setThumbnails(prev => ({
        ...prev,
        [file.name]: thumbnail
      }));
      
      setFullImages(prev => ({
        ...prev,
        [file.name]: fileUrl
      }));
      
      // Mark as processing to prevent duplicate processing
      setProcessing(prev => ({
        ...prev,
        [file.name]: true
      }));
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('image', file);
      
      // If we have categories, pass them to the analyzer for better category matching
      if (categories && categories.length > 0) {
        formData.append('categories', JSON.stringify(categories));
      }
      
      console.log(`Analyzing receipt image: ${file.name}`);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-expense-image', {
        body: formData,
      });
      
      if (error) {
        throw new Error(`Analysis failed: ${error.message}`);
      }
      
      if (data && data.data) {
        console.log(`Analysis results for ${file.name}:`, data.data);
        setResults(prev => ({
          ...prev,
          [file.name]: data.data
        }));
      } else {
        throw new Error('Invalid response format from analysis function');
      }
    } catch (error) {
      console.error(`Error analyzing receipt:`, error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze receipt image",
        variant: "destructive"
      });
    } finally {
      setProcessing(prev => ({
        ...prev,
        [file.name]: false
      }));
    }
  };

  const createThumbnail = (imgUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Create a small thumbnail
        const MAX_SIZE = 100;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * MAX_SIZE / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Clean up
        URL.revokeObjectURL(img.src);
        
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imgUrl;
    });
  };

  const handleAcceptResult = (fileName: string) => {
    const result = results[fileName];
    const thumbnail = thumbnails[fileName];
    const imageUrl = fullImages[fileName];
    
    if (!result) return;
    
    try {
      // Find category ID if we have a category from the results
      let categoryId = '';
      if (result.category && categories.length > 0) {
        // First try direct category ID match
        if (result.category && typeof result.category === 'string') {
          // Check if it's a valid category ID
          const categoryById = categories.find(c => c.id === result.category);
          if (categoryById) {
            categoryId = result.category;
          } else {
            // Try to match by name
            const categoryByName = categories.find(c => 
              c.name.toLowerCase() === result.category.toLowerCase()
            );
            if (categoryByName) {
              categoryId = categoryByName.id;
            }
          }
        }
      }
      
      // Parse date
      let date = new Date();
      if (result.date && typeof result.date === 'string') {
        try {
          date = new Date(result.date);
        } catch (e) {
          console.error('Invalid date format from analysis:', result.date);
        }
      }
      
      // Create the expense form values object
      const expenseData: ExpenseFormValues & { 
        receiptThumbnail?: string;
        receiptImage?: string;
      } = {
        description: result.vendor || result.description || 'Expense from receipt',
        amount: parseFloat(result.amount) || 0,
        date: date,
        category: categoryId,
        isRecurring: false,
        currency: (result.currency || 'THB') as Currency,
        receiptThumbnail: thumbnail,
        receiptImage: imageUrl
      };
      
      console.log('Created expense data from receipt:', expenseData);
      
      // Call the callback with the recognized expense data
      if (onExpenseRecognized) {
        onExpenseRecognized(expenseData);
        
        // Remove the file from state after processing
        if (!multiUpload) {
          setFiles(prev => prev.filter(f => f.name !== fileName));
        }
        
        toast({
          title: "Expense Data Recognized",
          description: "Receipt has been processed successfully"
        });
      }
    } catch (error) {
      console.error('Error creating expense from receipt result:', error);
      toast({
        title: "Error",
        description: "Failed to create expense from receipt analysis",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    
    // Also clean up the associated state
    setProcessing(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
    
    setResults(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
    
    setThumbnails(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
    
    setFullImages(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
  };

  // Compact view suitable for dashboards
  if (compact) {
    return (
      <div className={cn("w-full", className)}>
        <Card className="overflow-hidden border-dashed">
          <CardContent className="p-0">
            <div 
              className="flex flex-col items-center justify-center h-24 cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Upload receipt to add expense</p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            </div>
          </CardContent>
        </Card>
        
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="bg-background border rounded-md overflow-hidden">
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {thumbnails[file.name] ? (
                      <img 
                        src={thumbnails[file.name]} 
                        alt="Receipt" 
                        className="w-10 h-10 object-cover rounded-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-sm">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium truncate w-40">{file.name}</p>
                      {results[file.name] && (
                        <p className="text-xs text-muted-foreground truncate">
                          {results[file.name].amount && `${results[file.name].amount} ${results[file.name].currency || 'THB'}`}
                          {results[file.name].vendor && ` - ${results[file.name].vendor}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {processing[file.name] ? (
                      <Spinner className="w-4 h-4" />
                    ) : results[file.name] ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500"
                          onClick={() => handleAcceptResult(file.name)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteFile(file.name)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteFile(file.name)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className={cn("w-full", className)}>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-primary mb-2" />
              <p className="text-sm text-center text-muted-foreground">Click to upload receipt images</p>
              <p className="text-xs text-center text-muted-foreground mt-1">
                We'll automatically extract the expense information
              </p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
            </div>
            
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Receipts ({files.length})</h3>
                <div className="grid grid-cols-1 gap-3">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="border rounded-md overflow-hidden">
                      <div className="p-3 flex items-start gap-3">
                        {thumbnails[file.name] ? (
                          <img 
                            src={thumbnails[file.name]} 
                            alt="Receipt" 
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {processing[file.name] && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                              <Spinner className="h-3 w-3" />
                              <span>Analyzing receipt...</span>
                            </div>
                          )}
                          {results[file.name] && (
                            <div className="mt-2 space-y-1 text-xs">
                              <p>
                                <span className="text-muted-foreground">Amount:</span>{' '}
                                <span className="font-medium">{results[file.name].amount} {results[file.name].currency || 'THB'}</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Vendor:</span>{' '}
                                <span className="font-medium">{results[file.name].vendor || 'Unknown'}</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Date:</span>{' '}
                                <span className="font-medium">{results[file.name].date || 'Unknown'}</span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">Category:</span>{' '}
                                <span className="font-medium">{results[file.name].category || 'Unknown'}</span>
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {processing[file.name] ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              disabled
                            >
                              <Spinner className="w-4 h-4" />
                            </Button>
                          ) : results[file.name] ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-500"
                                onClick={() => handleAcceptResult(file.name)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteFile(file.name)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteFile(file.name)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
