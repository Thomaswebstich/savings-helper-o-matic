
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Image, Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ExpenseImageUploadProps {
  onExpenseRecognized: (data: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string 
  }) => void;
  categories: Category[];
  compact?: boolean;
  multiUpload?: boolean;
  disabled?: boolean;
  initialImage?: string;
}

export function ExpenseImageUpload({ 
  onExpenseRecognized, 
  categories,
  compact = false,
  multiUpload = false,
  disabled = false,
  initialImage
}: ExpenseImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Handle files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await processFile(file);
      }
    } catch (error) {
      console.error('Error processing file(s):', error);
    } finally {
      setIsUploading(false);
      
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const processFile = async (file: File): Promise<void> => {
    try {
      const reader = new FileReader();
      
      // Create a promise that resolves when the file is read
      const imageDataPromise = new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const imageDataUrl = e.target?.result as string;
            resolve(imageDataUrl);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          reject(error);
        };
        
        reader.readAsDataURL(file);
      });
      
      // Get image data URL
      const imageDataUrl = await imageDataPromise;
      
      // Only set the preview for the first file or in single file mode
      if (!multiUpload || !previewImage) {
        setPreviewImage(imageDataUrl);
      }
      
      // Try to analyze the receipt with Supabase Edge Function
      try {
        // Create a FormData object to send to our Supabase Edge Function
        const formData = new FormData();
        formData.append('image', file);
        formData.append('categories', JSON.stringify(categories));
        
        // Call the analyze-expense-image function
        const response = await fetch('/api/analyze-expense-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to analyze receipt: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        const recognizedData = result.data;
        console.log('Recognized data:', recognizedData);
        
        // Map the recognized data to our form values
        const mappedData: ExpenseFormValues & { 
          receiptImage?: string; 
          receiptThumbnail?: string 
        } = {
          description: recognizedData.vendor || file.name.split('.')[0] || 'Receipt payment',
          amount: recognizedData.amount || Math.floor(Math.random() * 1000) + 10,
          date: recognizedData.date ? new Date(recognizedData.date) : new Date(),
          category: recognizedData.category || (categories.length > 0 ? categories[0].id : ''),
          isRecurring: false,
          currency: recognizedData.currency || 'THB',
          receiptImage: imageDataUrl,
          receiptThumbnail: imageDataUrl
        };
        
        // Pass the recognized data up to the parent component
        onExpenseRecognized(mappedData);
        
      } catch (error) {
        console.error('Error analyzing receipt:', error);
        
        // If analysis fails, fall back to random data like before
        const fallbackData: ExpenseFormValues & { 
          receiptImage?: string; 
          receiptThumbnail?: string 
        } = {
          description: file.name.split('.')[0] || 'Receipt payment',
          amount: Math.floor(Math.random() * 1000) + 10,
          date: new Date(),
          category: categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : '',
          isRecurring: false,
          currency: 'THB',
          receiptImage: imageDataUrl,
          receiptThumbnail: imageDataUrl
        };
        
        // Pass the fallback data up to the parent component
        onExpenseRecognized(fallbackData);
        
        // Show toast for fallback mode
        toast({
          title: "AI Recognition Unavailable",
          description: "Using placeholder data. Please review before approving.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Process either all files or just the first one based on multiUpload flag
      const filesToProcess = multiUpload ? files : [files[0]];
      
      Array.from(filesToProcess).forEach(async file => {
        await processFile(file);
      });
    } catch (error) {
      console.error('Error processing dropped files:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        multiple={multiUpload}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled}
      />
      
      <div
        className={cn(
          "border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
          compact ? "p-4" : "p-8",
          isUploading && "opacity-70"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        {previewImage && !multiUpload ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-xs mb-4">
              <img 
                src={previewImage} 
                alt="Receipt preview" 
                className="w-full h-auto object-contain rounded border"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {!disabled ? "Click or drag to replace with a different image" : "Image is being processed"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-full bg-secondary/50 p-3">
              {isUploading ? (
                <Upload className="h-6 w-6 text-muted-foreground animate-pulse" />
              ) : (
                <FileImage className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            
            {!compact && (
              <h3 className="text-lg font-medium mb-2">
                {isUploading ? 'Uploading...' : 'Upload Receipt Image'}
              </h3>
            )}
            
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {isUploading 
                ? 'Processing your receipt...' 
                : 'Drag & drop an image here, or click to select'}
            </p>
            
            {!compact && !isUploading && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                disabled={disabled}
              >
                <Image className="h-4 w-4 mr-2" />
                Select Image
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
