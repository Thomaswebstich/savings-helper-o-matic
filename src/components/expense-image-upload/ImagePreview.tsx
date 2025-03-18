
import { ImagePreviewProps } from './types';

export function ImagePreview({ 
  previewImage, 
  disabled = false,
  onClick
}: ImagePreviewProps) {
  return (
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
  );
}
