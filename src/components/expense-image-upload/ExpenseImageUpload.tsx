
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';
import { Image, Upload, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      // Handle first file for initial preview
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setPreviewImage(imageDataUrl);
        
        // For now, we'll just pass the image data URLs directly
        // In a real app, you might upload this to a server and get back URLs
        const recognizedData: ExpenseFormValues & { 
          receiptImage?: string; 
          receiptThumbnail?: string 
        } = {
          description: '',
          amount: 0,
          date: new Date(),
          category: '',
          isRecurring: false,
          currency: 'THB',
          receiptImage: imageDataUrl,
          receiptThumbnail: imageDataUrl
        };
        
        onExpenseRecognized(recognizedData);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) return;
    
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Create a new FileList-like object from the dropped files
    const dataTransfer = new DataTransfer();
    for (let i = 0; i < (multiUpload ? files.length : 1); i++) {
      dataTransfer.items.add(files[i]);
    }
    
    // Update the file input's files property
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      
      // Trigger the onChange event manually
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
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
        {previewImage ? (
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
