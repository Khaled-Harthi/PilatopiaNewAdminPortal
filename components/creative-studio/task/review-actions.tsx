'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateTaskStatus } from '@/lib/creative-studio/hooks';
import type { Generation } from '@/lib/creative-studio/types';

interface ReviewActionsProps {
  task: Generation;
  onEnhance: () => void;
  onDiscard: () => void;
}

export function ReviewActions({ task, onEnhance, onDiscard }: ReviewActionsProps) {
  const updateTaskStatus = useUpdateTaskStatus();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await updateTaskStatus.mutateAsync({ id: task.id, taskStatus: 'done' });
      toast.success('Task approved and moved to Done');
    } catch (error) {
      toast.error('Failed to approve task');
    } finally {
      setIsApproving(false);
    }
  };

  const isCompleted = task.status === 'completed';

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        onClick={handleApprove}
        disabled={!isCompleted || isApproving}
        className="flex-1"
      >
        {isApproving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Check className="h-4 w-4 mr-2" />
        )}
        Approve
      </Button>
      <Button
        variant="secondary"
        onClick={onEnhance}
        disabled={!isCompleted}
        className="flex-1"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Enhance
      </Button>
      <Button
        variant="outline"
        onClick={onDiscard}
        disabled={!isCompleted}
        className="flex-1"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Discard
      </Button>
    </div>
  );
}
