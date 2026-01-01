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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Loader2, Play, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useBranchFromGeneration } from '@/lib/creative-studio/hooks';

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: number;
  sourceTitle?: string | null;
  sourceVersion?: number;
  onSuccess?: () => void;
}

export function BranchDialog({
  open,
  onOpenChange,
  sourceId,
  sourceTitle,
  sourceVersion,
  onSuccess,
}: BranchDialogProps) {
  const [title, setTitle] = useState(`${sourceTitle || 'Task'} Branch from v${sourceVersion || 1}`);
  const [startImmediately, setStartImmediately] = useState(false);

  const branchMutation = useBranchFromGeneration();

  const handleSubmit = async () => {
    try {
      await branchMutation.mutateAsync({
        id: sourceId,
        payload: {
          title: title.trim() || undefined,
          startImmediately,
        },
      });
      toast.success(
        startImmediately
          ? 'Branch created and generation started!'
          : 'Branch created and added to To Do'
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Branch
          </DialogTitle>
          <DialogDescription>
            Create a new task branching from version {sourceVersion} of{' '}
            {sourceTitle || `Generation #${sourceId}`}. The branch will inherit the prompt
            configuration and use the result image as a starting point.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="branch-title">Branch Title</Label>
            <Input
              id="branch-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for the branch"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Start Generation Immediately</Label>
              <p className="text-xs text-muted-foreground">
                If disabled, the branch will be saved to To Do
              </p>
            </div>
            <Switch checked={startImmediately} onCheckedChange={setStartImmediately} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={branchMutation.isPending}>
            {branchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : startImmediately ? (
              <Play className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {startImmediately ? 'Create & Start' : 'Create Branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
