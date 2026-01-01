'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useEnhanceGeneration } from '@/lib/creative-studio/hooks';
import type { Generation } from '@/lib/creative-studio/types';

interface EnhancementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Generation;
  onSuccess?: () => void;
}

export function EnhancementForm({ open, onOpenChange, task, onSuccess }: EnhancementFormProps) {
  const [comment, setComment] = useState('');
  const enhanceGeneration = useEnhanceGeneration();

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Please enter enhancement feedback');
      return;
    }

    try {
      await enhanceGeneration.mutateAsync({
        id: task.id,
        payload: { comment: comment.trim() },
      });
      toast.success('Enhancement started! A new version is being generated.');
      setComment('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to start enhancement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enhance with Feedback</DialogTitle>
          <DialogDescription>
            Describe what changes you want. The AI will use the current result as a starting point
            and apply your feedback to create an improved version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current result preview */}
          {task.resultThumbnailUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={task.resultThumbnailUrl}
                alt="Current result"
                className="w-full h-32 object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="feedback">Enhancement Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="e.g., Make the lighting warmer, add more contrast, adjust the model's pose..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about what you want changed. The generated image will be used as input.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={enhanceGeneration.isPending || !comment.trim()}
          >
            {enhanceGeneration.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Start Enhancement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
