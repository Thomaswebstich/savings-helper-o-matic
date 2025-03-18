
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ReceiptImagePreviewProps {
  receiptImage?: string;
  receiptThumbnail?: string;
  onRemoveImage?: () => void;
}

export function ReceiptImagePreview({ 
  receiptImage, 
  receiptThumbnail,
  onRemoveImage
}: ReceiptImagePreviewProps) {
  const imageUrl = receiptImage || receiptThumbnail;

  if (!imageUrl) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md">
        <p className="text-muted-foreground">No receipt image available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Receipt Image</h3>
        {onRemoveImage && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onRemoveImage}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
      
      <div className="rounded-md border overflow-hidden max-h-[500px]">
        <a href={imageUrl} target="_blank" rel="noopener noreferrer">
          <img 
            src={imageUrl} 
            alt="Receipt" 
            className="w-full object-contain cursor-zoom-in"
          />
        </a>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Click the image to view in full size
      </div>
    </div>
  );
}
