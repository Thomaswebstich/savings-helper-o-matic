
import { UploadArea } from './UploadArea';
import { useImageUpload } from './useImageUpload';
import { ExpenseImageUploadProps } from './types';

export function ExpenseImageUpload({ 
  onExpenseRecognized, 
  categories,
  compact = false,
  multiUpload = false,
  disabled = false,
  initialImage
}: ExpenseImageUploadProps) {
  const {
    isUploading,
    previewImage,
    isDragging,
    fileInputRef,
    dropAreaRef,
    handleFileChange,
    handleClick
  } = useImageUpload({
    onExpenseRecognized,
    categories,
    multiUpload,
    disabled,
    initialImage
  });
  
  return (
    <div className="w-full" ref={dropAreaRef}>
      <input
        type="file"
        accept="image/*"
        multiple={multiUpload}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled}
      />
      
      <UploadArea
        compact={compact}
        isUploading={isUploading}
        isDragging={isDragging}
        disabled={disabled}
        previewImage={previewImage}
        multiUpload={multiUpload}
        onClick={handleClick}
      />
    </div>
  );
}
