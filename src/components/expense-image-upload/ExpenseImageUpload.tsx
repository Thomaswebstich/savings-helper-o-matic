
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Upload, Image, Check, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseImageUploadProps {
  onExpenseRecognized: (data: ExpenseFormValues) => void;
  disabled?: boolean;
}

export function ExpenseImageUpload({ onExpenseRecognized, disabled = false }: ExpenseImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
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
    setPreviewUrl(URL.createObjectURL(file));
    
    // Process the image
    analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsUploading(true);

    try {
      // Create form data for the file
      const formData = new FormData();
      formData.append('image', file);

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-expense-image', {
        body: formData,
        headers: {
          'Accept': 'multipart/form-data',
        },
      });

      if (error) {
        throw error;
      }

      // Process the recognized data
      if (data?.data) {
        const { amount, currency, date, vendor, category, description } = data.data;
        
        // Find the category ID based on the recognized category name
        // This would need to be implemented with your actual categories
        const categoryId = ''; // Will be filled by the user

        // Create an expense form values object
        const expenseValues: ExpenseFormValues = {
          description: description || vendor || 'Expense from receipt',
          amount: parseFloat(amount) || 0,
          date: date ? new Date(date) : new Date(),
          category: categoryId, // The user will need to select this
          isRecurring: false,
          currency: (currency as any) || 'THB',
        };

        toast({
          title: "Receipt analyzed",
          description: "We've extracted the expense details from your receipt",
        });

        // Call the callback
        onExpenseRecognized(expenseValues);
      } else {
        throw new Error('No data returned from image analysis');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your receipt. Please try again or enter details manually.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div
            className={cn(
              "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              isUploading ? "opacity-50 cursor-wait" : "",
              previewUrl ? "border-primary" : ""
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
            />

            {previewUrl ? (
              <div className="relative w-full max-h-48 overflow-hidden rounded-md">
                <img src={previewUrl} alt="Receipt preview" className="w-full object-contain max-h-48" />
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
                <p className="text-sm font-medium mb-1">Drag & drop a receipt image</p>
                <p className="text-xs text-muted-foreground">Or click to browse files</p>
              </>
            )}
          </div>

          {previewUrl && (
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
