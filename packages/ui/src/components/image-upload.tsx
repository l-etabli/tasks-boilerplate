import { cn } from "@tasks/ui/lib/utils";
import { X } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar.js";
import { Button } from "./button.js";

const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 0.5 MB
const ACCEPTED_IMAGE_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"];

type ImageUploadProps = {
  currentImageUrl?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  fallbackText?: string;
  className?: string;
  noImageYet: string;
  upload: string;
  change: string;
  errorFileType: string;
  errorFileSize: string;
  helpText: string;
  removeLabel: string;
};

export function ImageUpload({
  currentImageUrl,
  onImageSelect,
  onImageRemove,
  fallbackText = "?",
  className,
  noImageYet,
  upload,
  change,
  errorFileType,
  errorFileSize,
  helpText,
  removeLabel,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(errorFileType);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(errorFileSize);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onImageRemove?.();
  };

  const displayUrl = preview || currentImageUrl;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {displayUrl ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-16">
              <AvatarImage src={displayUrl} alt="Preview" />
              <AvatarFallback>{fallbackText}</AvatarFallback>
            </Avatar>
            {onImageRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-muted-foreground/80 text-background shadow-md transition-colors hover:bg-muted-foreground"
                aria-label={removeLabel}
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              {change}
              <input
                id="image-upload"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">{noImageYet}</p>
          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              {upload}
              <input
                id="image-upload"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </Button>
        </div>
      )}

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}

      <p className="text-muted-foreground text-xs">{helpText}</p>
    </div>
  );
}
