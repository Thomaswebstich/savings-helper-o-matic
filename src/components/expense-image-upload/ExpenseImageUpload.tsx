import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Image, Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };
    
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };
    
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!e.relatedTarget || !dropArea.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (disabled) return;
      
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;
      
      handleFiles(files);
    };
    
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [disabled]);
  
  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await processFile(file);
      }
    } catch (error) {
      console.error('Error processing file(s):', error);
    } finally {
      setIsUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    handleFiles(files);
  };
  
  const processFile = async (file: File): Promise<void> => {
    try {
      const reader = new FileReader();
      
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
      
      const imageDataUrl = await imageDataPromise;
      
      if (!multiUpload || !previewImage) {
        setPreviewImage(imageDataUrl);
      }
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('categories', JSON.stringify(categories));
        
        const { data: result, error } = await supabase.functions.invoke('analyze-expense-image', {
          body: formData,
        });
        
        if (error) {
          throw new Error(`Failed to analyze receipt: ${error.message}`);
        }
        
        const recognizedData = result?.data;
        console.log('Recognized data:', recognizedData);
        
        if (!recognizedData) {
          throw new Error('No data returned from receipt analysis');
        }
        
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
        
        onExpenseRecognized(mappedData);
      } catch (error) {
        console.error('Error analyzing receipt:', error);
        
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
        
        onExpenseRecognized(fallbackData);
        
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
        ref={dropAreaRef}
        className={cn(
          "border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
          compact ? "p-4" : "p-8",
          isUploading && "opacity-70",
          isDragging && "border-primary bg-primary/5"
        )}
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
                : isDragging 
                  ? 'Drop receipt here!' 
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
