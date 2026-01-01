'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Loader2, X, Sparkles, ChevronDown, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreateGeneration } from '@/lib/creative-studio/hooks';
import {
  DEFAULT_PROMPT_CONFIG,
  WALL_COLOR_OPTIONS,
  COLOR_MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  DESATURATION_OPTIONS,
  GENDER_OPTIONS,
  POSE_OPTIONS,
  type PromptConfig,
  type GenerationMode,
  type Resolution,
} from '@/lib/creative-studio/types';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Style presets - visual cards for quick selection
const STYLE_PRESETS = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, bright, airy',
    preview: '🪷',
    config: {
      wallColor: 'warm_cream' as const,
      colorMood: 'muted' as const,
      lighting: 'natural' as const,
      desaturation: 'moderate' as const,
    },
  },
  {
    id: 'cozy',
    name: 'Cozy',
    description: 'Warm, inviting, soft',
    preview: '🕯️',
    config: {
      wallColor: 'beige' as const,
      colorMood: 'warm' as const,
      lighting: 'golden_hour' as const,
      desaturation: 'subtle' as const,
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek, contemporary',
    preview: '✨',
    config: {
      wallColor: 'taupe' as const,
      colorMood: 'earthy' as const,
      lighting: 'diffused' as const,
      desaturation: 'moderate' as const,
    },
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Dramatic, high contrast',
    preview: '🌟',
    config: {
      wallColor: 'keep_original' as const,
      colorMood: 'earthy' as const,
      lighting: 'soft_dawn' as const,
      desaturation: 'strong' as const,
    },
  },
];

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [resolution, setResolution] = useState<Resolution>('2K');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [config, setConfig] = useState<PromptConfig>(DEFAULT_PROMPT_CONFIG);
  const [selectedPreset, setSelectedPreset] = useState<string>('minimal');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const createGeneration = useCreateGeneration();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setFilePreview(URL.createObjectURL(file));
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
    maxSize: 20 * 1024 * 1024,
  });

  const clearFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setResolution('2K');
    clearFile();
    setConfig(DEFAULT_PROMPT_CONFIG);
    setSelectedPreset('minimal');
    setAdvancedOpen(false);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        style: preset.config,
      }));
    }
  };

  const updateStyle = (key: keyof PromptConfig['style'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      style: { ...prev.style, [key]: value },
    }));
    // Clear preset when manually changing
    setSelectedPreset('');
  };

  const updateModel = (key: keyof NonNullable<PromptConfig['model']>, value: string) => {
    setConfig((prev) => ({
      ...prev,
      model: { ...prev.model!, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please upload a source image');
      return;
    }

    try {
      await createGeneration.mutateAsync({
        payload: {
          mode: 'style_image' as GenerationMode,
          promptConfig: { ...config, mode: 'style_image' },
          resolution,
          title: title || undefined,
          startImmediately: true,
        },
        file,
      });

      toast.success('Generation started!');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-xl font-semibold">Create New Task</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Transform your image with AI-powered styling
            </p>
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Image Upload - Hero Section */}
            <div className="space-y-3">
              {!filePreview ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                    isDragActive
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                    <Upload className="h-7 w-7 text-stone-400" />
                  </div>
                  <p className="font-medium text-stone-700">
                    Drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Supports JPEG, PNG, WebP, HEIC up to 20MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Hero banner for homepage"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Style Presets - Visual Cards */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Style</Label>
              <div className="grid grid-cols-4 gap-3">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={cn(
                      'relative flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                      selectedPreset === preset.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    )}
                  >
                    {selectedPreset === preset.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span className="text-2xl mb-2">{preset.preview}</span>
                    <span className="font-medium text-sm">{preset.name}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options - Collapsible */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-stone-600 hover:text-stone-900"
                >
                  <span>Advanced Options</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      advancedOpen && 'rotate-180'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-5 pt-2">
                {/* Resolution */}
                <div className="space-y-2">
                  <Label className="text-sm">Resolution</Label>
                  <Select value={resolution} onValueChange={(v) => setResolution(v as Resolution)}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1K">1K (1024px) - Fast</SelectItem>
                      <SelectItem value="2K">2K (2048px) - Balanced</SelectItem>
                      <SelectItem value="4K">4K (4096px) - High Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fine-tuning Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Wall Color</Label>
                    <Select
                      value={config.style.wallColor}
                      onValueChange={(v) => updateStyle('wallColor', v)}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WALL_COLOR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Color Mood</Label>
                    <Select
                      value={config.style.colorMood}
                      onValueChange={(v) => updateStyle('colorMood', v)}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_MOOD_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Lighting</Label>
                    <Select
                      value={config.style.lighting}
                      onValueChange={(v) => updateStyle('lighting', v)}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIGHTING_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Desaturation</Label>
                    <Select
                      value={config.style.desaturation}
                      onValueChange={(v) => updateStyle('desaturation', v)}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DESATURATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Add Model Toggle */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50">
                  <div>
                    <Label className="text-sm font-medium">Add Model</Label>
                    <p className="text-xs text-muted-foreground">
                      Include a person in the image
                    </p>
                  </div>
                  <Switch
                    checked={config.addModel}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, addModel: checked }))
                    }
                  />
                </div>

                {/* Model Options (conditional) */}
                {config.addModel && (
                  <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-stone-200">
                    <div className="space-y-2">
                      <Label className="text-sm">Gender</Label>
                      <Select
                        value={config.model?.gender}
                        onValueChange={(v) => updateModel('gender', v)}
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Pose</Label>
                      <Select
                        value={config.model?.pose}
                        onValueChange={(v) => updateModel('pose', v)}
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POSE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <Label className="text-sm">Custom Instructions</Label>
                  <Textarea
                    placeholder="Add specific details or requirements..."
                    value={config.customInstructions || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, customInstructions: e.target.value }))
                    }
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={createGeneration.isPending || !file}
              className="w-full h-12 rounded-xl text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {createGeneration.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create & Start Generation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
