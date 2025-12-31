'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Loader2, Upload, Sun, Lightbulb, Sunset, Moon, Circle, User, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn, isHeicFile } from '@/lib/utils';
import { OutfitPicker } from '../outfit-picker/outfit-picker';
import type { Generation, StylePreset } from '@/lib/creative-studio/types';

type Resolution = '1K' | '2K' | '4K';

interface CreationPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentGeneration?: Generation | null;
  onSubmit: (config: {
    stylePreset: StylePreset | 'none';
    addModel: boolean;
    outfit: { top: string; topColor: string; bottom: string; bottomColor: string } | null;
    customInstructions: string;
    resolution: Resolution;
    file?: File;
  }) => Promise<void>;
}

const STYLE_PRESETS: { value: StylePreset | 'none'; label: string; icon: typeof Sun; description: string }[] = [
  { value: 'none', label: 'None', icon: Circle, description: 'Keep current style' },
  { value: 'natural', label: 'Natural', icon: Sun, description: 'Soft, organic lighting' },
  { value: 'studio', label: 'Studio', icon: Lightbulb, description: 'Clean, professional' },
  { value: 'golden_hour', label: 'Golden Hour', icon: Sunset, description: 'Warm, magical glow' },
  { value: 'dramatic', label: 'Dramatic', icon: Moon, description: 'Bold contrast' },
];

const RESOLUTIONS: { value: Resolution; label: string; description: string }[] = [
  { value: '1K', label: '1K', description: '1024px - Fast' },
  { value: '2K', label: '2K', description: '2048px - Balanced' },
  { value: '4K', label: '4K', description: '4096px - Best quality' },
];

export function CreationPopover({
  open,
  onOpenChange,
  parentGeneration,
  onSubmit,
}: CreationPopoverProps) {
  const [stylePreset, setStylePreset] = useState<StylePreset | 'none'>('none');
  const [resolution, setResolution] = useState<Resolution>('2K');
  const [outfit, setOutfit] = useState({
    top: 'sports_bra',
    topColor: '#E5D4C0',
    bottom: 'leggings',
    bottomColor: '#2C2C2C',
  });
  const [addModel, setAddModel] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeic, setIsHeic] = useState(false);

  const isBranching = !!parentGeneration;
  const sourceImageUrl = parentGeneration?.resultImageUrl || parentGeneration?.sourceImageUrl;

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
    disabled: isBranching,
  });

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setIsHeic(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit({
        stylePreset,
        addModel,
        outfit: addModel ? outfit : null,
        customInstructions,
        resolution,
        file: file || undefined,
      });
      // Reset form
      setStylePreset('none');
      setResolution('2K');
      setAddModel(false);
      setOutfit({
        top: 'sports_bra',
        topColor: '#E5D4C0',
        bottom: 'leggings',
        bottomColor: '#2C2C2C',
      });
      setCustomInstructions('');
      setFile(null);
      setPreview(null);
      setIsHeic(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create generation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isBranching ? 'Branch from Version' : 'Create New Generation'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Image */}
          <div className="space-y-2">
            <Label>Source Image</Label>
            {isBranching && sourceImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border bg-stone-50">
                <img
                  src={sourceImageUrl}
                  alt="Source"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm">
                  Branching from v{parentGeneration.versionNumber}
                </div>
              </div>
            ) : isHeic && file ? (
              <div className="relative border-2 border-dashed rounded-xl p-8 text-center border-amber-400 bg-amber-50">
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
                  className="w-full h-48 object-cover rounded-xl border"
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
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                  isDragActive ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-300'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-3 text-stone-400" />
                <p className="text-sm text-stone-600 mb-1">
                  {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-stone-400">PNG, JPG, WEBP, HEIC up to 10MB</p>
              </div>
            )}
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <Label>Style Preset</Label>
            <div className="grid grid-cols-5 gap-2">
              {STYLE_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = stylePreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => setStylePreset(preset.value)}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 mb-1.5', isSelected ? 'text-amber-600' : 'text-stone-500')} />
                    <span className={cn('text-xs font-medium', isSelected ? 'text-amber-700' : 'text-stone-700')}>
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5 text-center leading-tight">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution Picker */}
          <div className="space-y-2">
            <Label>Resolution</Label>
            <div className="grid grid-cols-3 gap-3">
              {RESOLUTIONS.map((res) => {
                const isSelected = resolution === res.value;
                return (
                  <button
                    key={res.value}
                    onClick={() => setResolution(res.value)}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    <span className={cn('text-lg font-bold', isSelected ? 'text-amber-700' : 'text-stone-700')}>
                      {res.label}
                    </span>
                    <span className="text-xs text-stone-400 mt-0.5">{res.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Toggle */}
          <div className="space-y-2">
            <Label>Model</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAddModel(false)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  !addModel
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                )}
              >
                <ImageIcon className={cn('h-5 w-5', !addModel ? 'text-amber-600' : 'text-stone-500')} />
                <span className={cn('text-sm font-medium', !addModel ? 'text-amber-700' : 'text-stone-700')}>
                  No Model
                </span>
              </button>
              <button
                onClick={() => setAddModel(true)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                  addModel
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                )}
              >
                <User className={cn('h-5 w-5', addModel ? 'text-amber-600' : 'text-stone-500')} />
                <span className={cn('text-sm font-medium', addModel ? 'text-amber-700' : 'text-stone-700')}>
                  Add Model
                </span>
              </button>
            </div>
          </div>

          {/* Outfit Picker - only shown when model is added */}
          {addModel && (
            <div className="space-y-2">
              <Label>Outfit</Label>
              <OutfitPicker
                value={outfit}
                onChange={setOutfit}
              />
            </div>
          )}

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Additional Instructions</Label>
            <Textarea
              id="instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Add any specific details or changes you'd like..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!isBranching && !file)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
