
import { Category } from '@/lib/data';
import { ExpenseFormValues } from '@/components/expense-form/types';

export interface ExpenseImageUploadProps {
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

export interface ImageUploadState {
  isUploading: boolean;
  previewImage: string | null;
  isDragging: boolean;
}

export interface UseImageUploadOptions {
  onExpenseRecognized: (data: ExpenseFormValues & { 
    receiptImage?: string; 
    receiptThumbnail?: string 
  }) => void;
  categories: Category[];
  multiUpload?: boolean;
  disabled?: boolean;
  initialImage?: string;
}

export interface UseImageUploadReturn extends ImageUploadState {
  fileInputRef: React.RefObject<HTMLInputElement>;
  dropAreaRef: React.RefObject<HTMLDivElement>;
  handleFiles: (files: FileList) => Promise<void>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClick: () => void;
  setIsDragging: (isDragging: boolean) => void;
}

export interface UploadAreaProps {
  compact?: boolean;
  isUploading: boolean;
  isDragging: boolean;
  disabled?: boolean;
  previewImage: string | null;
  multiUpload?: boolean;
  onClick: () => void;
}

export interface ImagePreviewProps {
  previewImage: string;
  disabled?: boolean;
  onClick: () => void;
}
