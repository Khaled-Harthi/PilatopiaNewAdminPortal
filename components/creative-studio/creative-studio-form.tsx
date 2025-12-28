'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Upload, Sparkles, ImagePlus, Loader2, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useCreateGeneration } from '@/lib/creative-studio/hooks';
import {
  DEFAULT_PROMPT_CONFIG,
  WALL_COLOR_OPTIONS,
  COLOR_MOOD_OPTIONS,
  LIGHTING_OPTIONS,
  DESATURATION_OPTIONS,
  GENDER_OPTIONS,
  POSE_OPTIONS,
  TOP_STYLE_OPTIONS,
  CLOTHING_COLOR_OPTIONS,
  EQUIPMENT_OPTIONS,
  WINDOW_STYLE_OPTIONS,
  type PromptConfig,
  type GenerationMode,
} from '@/lib/creative-studio/types';

interface CreativeStudioFormProps {
  onGenerationStarted?: () => void;
}

export function CreativeStudioForm({ onGenerationStarted }: CreativeStudioFormProps) {
  const [mode, setMode] = useState<GenerationMode>('style_image');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [config, setConfig] = useState<PromptConfig>(DEFAULT_PROMPT_CONFIG);

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
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const clearFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const updateConfig = (updates: Partial<PromptConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateStyle = (key: keyof PromptConfig['style'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      style: { ...prev.style, [key]: value },
    }));
  };

  const updateModel = (key: keyof NonNullable<PromptConfig['model']>, value: string) => {
    setConfig((prev) => ({
      ...prev,
      model: { ...prev.model!, [key]: value },
    }));
  };

  const updateClothing = (key: keyof NonNullable<PromptConfig['clothing']>, value: string) => {
    setConfig((prev) => ({
      ...prev,
      clothing: { ...prev.clothing!, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (mode === 'style_image' && !file) {
      toast.error('Please upload an image');
      return;
    }

    try {
      const payload = {
        mode,
        promptConfig: { ...config, mode },
        resolution: '4K' as const,
      };

      await createGeneration.mutateAsync({ payload, file: file || undefined });
      toast.success('Generation started! You will be notified when complete.');
      onGenerationStarted?.();

      // Reset form
      clearFile();
      setConfig(DEFAULT_PROMPT_CONFIG);
    } catch (error) {
      toast.error('Failed to start generation');
      console.error(error);
    }
  };

  const showModelOptions = config.imageHasModel || config.addModel || mode === 'generate_new';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column - Form */}
      <div className="space-y-6">
        {/* Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mode</CardTitle>
            <CardDescription>Choose how you want to create your image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={mode === 'style_image' ? 'default' : 'outline'}
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setMode('style_image')}
              >
                <Upload className="h-6 w-6" />
                <span>Style an Image</span>
              </Button>
              <Button
                variant={mode === 'generate_new' ? 'default' : 'outline'}
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setMode('generate_new')}
              >
                <ImagePlus className="h-6 w-6" />
                <span>Generate New</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload (style_image mode only) */}
        {mode === 'style_image' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Image</CardTitle>
              <CardDescription>Upload a pilates studio photo to style</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, HEIC (max 20MB)</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={filePreview!}
                    alt="Preview"
                    className="w-full rounded-lg object-cover max-h-48"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Model Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model</CardTitle>
            <CardDescription>Configure model settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'style_image' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="imageHasModel"
                  checked={config.imageHasModel}
                  onCheckedChange={(checked) => updateConfig({ imageHasModel: !!checked })}
                />
                <Label htmlFor="imageHasModel">Image already has a model</Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="addModel"
                checked={config.addModel}
                onCheckedChange={(checked) => updateConfig({ addModel: !!checked })}
              />
              <Label htmlFor="addModel">Add a model to the image</Label>
            </div>

            {showModelOptions && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select
                      value={config.model?.gender || 'female'}
                      onValueChange={(v) => updateModel('gender', v)}
                    >
                      <SelectTrigger>
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
                    <Label>Pose</Label>
                    <Select
                      value={config.model?.pose || 'reformer'}
                      onValueChange={(v) => updateModel('pose', v)}
                    >
                      <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Pose Detail (optional)</Label>
                  <Input
                    placeholder="e.g., hundred position, teaser..."
                    value={config.model?.poseDetail || ''}
                    onChange={(e) => updateModel('poseDetail', e.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Clothing Options (when model is involved) */}
        {showModelOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clothing</CardTitle>
              <CardDescription>Set the model's clothing style and colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Top Style</Label>
                  <Select
                    value={config.clothing?.topStyle || 'tank'}
                    onValueChange={(v) => updateClothing('topStyle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOP_STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Top Color</Label>
                  <Select
                    value={config.clothing?.topColor || 'brand_primary'}
                    onValueChange={(v) => updateClothing('topColor', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOTHING_COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Leggings</Label>
                  <Select
                    value={config.clothing?.leggings || 'cream'}
                    onValueChange={(v) => updateClothing('leggings', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOTHING_COLOR_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Style Options & Generate */}
      <div className="space-y-6">
        {/* Style Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Style Options</CardTitle>
            <CardDescription>Configure the visual style of the output</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wall Color</Label>
                <Select value={config.style.wallColor} onValueChange={(v) => updateStyle('wallColor', v)}>
                  <SelectTrigger>
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
                <Label>Lighting</Label>
                <Select value={config.style.lighting} onValueChange={(v) => updateStyle('lighting', v)}>
                  <SelectTrigger>
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
                <Label>Color Mood</Label>
                <Select value={config.style.colorMood} onValueChange={(v) => updateStyle('colorMood', v)}>
                  <SelectTrigger>
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
                <Label>Desaturation</Label>
                <Select value={config.style.desaturation} onValueChange={(v) => updateStyle('desaturation', v)}>
                  <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Instructions</CardTitle>
            <CardDescription>Add any custom instructions for the AI</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g., Make the model look more relaxed, add soft shadows..."
              value={config.customInstructions || ''}
              onChange={(e) => updateConfig({ customInstructions: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={createGeneration.isPending || (mode === 'style_image' && !file)}
        >
          {createGeneration.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate 4K Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
