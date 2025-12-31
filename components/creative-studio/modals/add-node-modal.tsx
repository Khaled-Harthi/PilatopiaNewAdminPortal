'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { isHeicFile } from '@/lib/utils';

interface AddNodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (data: { title?: string; file: File }) => Promise<void>;
}

export function AddNodeModal({
  open,
  onOpenChange,
  onAddNode,
}: AddNodeModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeic, setIsHeic] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    if (droppedFile) {
      setFile(droppedFile);

      // Check if it's a HEIC file - server will convert it
      if (isHeicFile(droppedFile)) {
        setIsHeic(true);
        setPreview(null); // Can't preview HEIC in browser
      } else {
        setIsHeic(false);
        // For non-HEIC files, create a preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(droppedFile);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxFiles: 1,
  });

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setIsHeic(false);
  };

  const handleAdd = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      await onAddNode({
        title: title || undefined,
        file,
      });
      // Reset form
      setTitle('');
      setFile(null);
      setPreview(null);
      setIsHeic(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add node:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Image</DialogTitle>
          <DialogDescription>
            Upload an image to add a new node to the canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="node-title">Title (Optional)</Label>
            <Input
              id="node-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Studio Shot 1"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Source Image</Label>
            {isHeic && file ? (
              <div className="relative border-2 border-dashed rounded-lg p-8 text-center border-amber-400 bg-amber-50">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <p className="text-sm text-stone-600 font-medium">{file.name}</p>
                <p className="text-xs text-stone-500 mt-1">HEIC file - will be converted on upload</p>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${isDragActive ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-3 text-stone-400" />
                <p className="text-sm text-stone-600 mb-1">
                  {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-stone-400">
                  PNG, JPG, WEBP, HEIC up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isLoading || !file}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Canvas'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
