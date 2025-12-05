'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  onClearExisting?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  aspectRatio?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  existingUrl,
  onChange,
  onClearExisting,
  accept = 'image/*',
  maxSize = 5,
  aspectRatio = '2/1',
  placeholder = 'Drag and drop an image, or click to select',
  helperText,
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create preview URL for the selected file
  const previewUrl = value ? URL.createObjectURL(value) : existingUrl;

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onChange(file);
    },
    [onChange, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(null);
    if (value) {
      onChange(null);
    } else if (existingUrl && onClearExisting) {
      onClearExisting();
    }
  };

  const hasImage = value || existingUrl;

  return (
    <div className={cn('space-y-2', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragOver && !disabled && 'border-primary bg-accent/50',
          !isDragOver && !hasImage && 'border-muted-foreground/25 hover:border-muted-foreground/50',
          hasImage && 'border-transparent',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive'
        )}
        style={{ aspectRatio }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        {hasImage ? (
          <div className="relative w-full h-full">
            <img
              src={previewUrl!}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {!disabled && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-2 end-2 h-8 w-8 rounded-full shadow-md"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="text-white text-sm font-medium">
                  Click to change image
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className="rounded-full bg-muted p-3">
              {isDragOver ? (
                <Upload className="h-6 w-6 text-primary" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {placeholder}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Max size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
