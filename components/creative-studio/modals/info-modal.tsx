'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Cpu, Image, Zap } from 'lucide-react';
import type { Generation, VersionHistoryItem } from '@/lib/creative-studio/types';

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generation: Generation | VersionHistoryItem;
  task?: Generation | null;
}

export function InfoModal({ open, onOpenChange, generation, task }: InfoModalProps) {
  // Merge data from generation and task (task has full config)
  const fullTask = task || (generation as Generation);
  const hasFullConfig = 'promptConfig' in fullTask;

  const generationTimeMs = 'generationTimeMs' in fullTask ? fullTask.generationTimeMs : null;
  const geminiModel = 'geminiModel' in fullTask ? fullTask.geminiModel : null;
  const resolution = 'resolution' in fullTask ? fullTask.resolution : null;
  const builtPrompt = hasFullConfig ? fullTask.builtPrompt : null;
  const promptConfig = hasFullConfig ? fullTask.promptConfig : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Generation Details
            <Badge variant="secondary" className="text-xs">
              v{generation.versionNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-50">
              <Cpu className="h-4 w-4 text-stone-500" />
              <div>
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="text-sm font-medium truncate">
                  {geminiModel || 'gemini-3-pro'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-50">
              <Image className="h-4 w-4 text-stone-500" />
              <div>
                <p className="text-xs text-muted-foreground">Resolution</p>
                <p className="text-sm font-medium">{resolution || '4K'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-50">
              <Zap className="h-4 w-4 text-stone-500" />
              <div>
                <p className="text-xs text-muted-foreground">Generation Time</p>
                <p className="text-sm font-medium">
                  {generationTimeMs ? `${(generationTimeMs / 1000).toFixed(1)}s` : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-stone-50">
              <Clock className="h-4 w-4 text-stone-500" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {format(new Date(generation.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Style Configuration */}
          {promptConfig && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-3">Style Configuration</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wall Color</span>
                    <span className="font-medium capitalize">
                      {promptConfig.style.wallColor.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Color Mood</span>
                    <span className="font-medium capitalize">
                      {promptConfig.style.colorMood}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lighting</span>
                    <span className="font-medium capitalize">
                      {promptConfig.style.lighting.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desaturation</span>
                    <span className="font-medium capitalize">
                      {promptConfig.style.desaturation}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Model Configuration (if applicable) */}
          {promptConfig?.addModel && promptConfig.model && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-3">Model Configuration</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium capitalize">
                      {promptConfig.model.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pose</span>
                    <span className="font-medium capitalize">
                      {promptConfig.model.pose}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Custom Instructions */}
          {promptConfig?.customInstructions && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-2">Custom Instructions</h4>
                <p className="text-sm text-muted-foreground">
                  {promptConfig.customInstructions}
                </p>
              </div>
            </>
          )}

          {/* Generated Prompt */}
          {builtPrompt && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm mb-2">Generated Prompt</h4>
                <div className="bg-stone-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {builtPrompt}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
