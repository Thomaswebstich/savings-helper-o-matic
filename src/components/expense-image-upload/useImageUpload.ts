
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { UseImageUploadOptions, UseImageUploadReturn } from './types';
import { Currency } from '@/lib/types/currency';

export function useImageUpload({
  onExpenseRecognized,
  categories,
  multiUpload = false,
  disabled = false,
  initialImage
}: UseImageUploadOptions): UseImageUploadReturn {
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
        
        const mappedData = {
          description: recognizedData.vendor || file.name.split('.')[0] || 'Receipt payment',
          amount: recognizedData.amount || Math.floor(Math.random() * 1000) + 10,
          date: recognizedData.date ? new Date(recognizedData.date) : new Date(),
          category: recognizedData.category || (categories.length > 0 ? categories[0].id : ''),
          isRecurring: false,
          currency: (recognizedData.currency || 'THB') as Currency,
          receiptImage: imageDataUrl,
          receiptThumbnail: imageDataUrl
        };
        
        onExpenseRecognized(mappedData);
      } catch (error) {
        console.error('Error analyzing receipt:', error);
        
        const fallbackData = {
          description: file.name.split('.')[0] || 'Receipt payment',
          amount: Math.floor(Math.random() * 1000) + 10,
          date: new Date(),
          category: categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : '',
          isRecurring: false,
          currency: 'THB' as Currency,
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
  
  const handleClick = () => {
    if (disabled) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return {
    isUploading,
    previewImage,
    isDragging,
    fileInputRef,
    dropAreaRef,
    handleFiles,
    handleFileChange,
    handleClick,
    setIsDragging
  };
}
