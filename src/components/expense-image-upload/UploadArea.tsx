
import { Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { UploadAreaProps } from './types';
import { ImagePreview } from './ImagePreview';

export function UploadArea({
  compact = false,
  isUploading,
  isDragging,
  disabled = false,
  previewImage,
  multiUpload = false,
  onClick
}: UploadAreaProps) {
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50",
        compact ? "p-4" : "p-8",
        isUploading && "opacity-70",
        isDragging && "border-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      {previewImage && !multiUpload ? (
        <ImagePreview 
          previewImage={previewImage} 
          disabled={disabled} 
          onClick={onClick}
        />
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
                onClick();
              }}
              disabled={disabled}
            >
              <FileImage className="h-4 w-4 mr-2" />
              Select Image
            </Button>
          )}
        </>
      )}
    </div>
  );
}
