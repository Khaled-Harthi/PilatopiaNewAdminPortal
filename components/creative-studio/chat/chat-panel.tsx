'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useGeneration,
  useGenerationStatus,
  useVersionHistory,
  useUpdateTaskStatus,
  useEnhanceGeneration,
} from '@/lib/creative-studio/hooks';
import { GenerationCard } from './generation-card';
import { ChatMessage } from './chat-message';
import { RichComposer } from './rich-composer';
import { InfoModal } from '../modals/info-modal';
import type { Generation, VersionHistoryItem } from '@/lib/creative-studio/types';
import { toast } from 'sonner';

interface ChatPanelProps {
  taskId: number | null;
  open: boolean;
  onClose: () => void;
  className?: string;
}

type PanelMode = 'docked' | 'fullscreen';

interface ChatItem {
  type: 'user' | 'system' | 'generation';
  content?: string;
  generation?: VersionHistoryItem | Generation;
  timestamp: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Generating',
  processing: 'Generating',
  completed: 'Review',
  failed: 'Failed',
  done: 'Approved',
  todo: 'Queued',
  in_progress: 'Generating',
  review: 'Review',
};

export function ChatPanel({ taskId, open, onClose, className }: ChatPanelProps) {
  const [mode, setMode] = useState<PanelMode>('docked');
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedGenerationForInfo, setSelectedGenerationForInfo] = useState<Generation | VersionHistoryItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: task, isLoading, refetch } = useGeneration(taskId);
  const { data: versionHistory, refetch: refetchVersions } = useVersionHistory(taskId);
  const isProcessing = task?.status === 'pending' || task?.status === 'processing';

  // Poll for status updates when processing
  const { data: statusData } = useGenerationStatus(
    isProcessing ? taskId : null,
    isProcessing
  );

  // Refetch when status changes to completed
  useEffect(() => {
    if (statusData?.status === 'completed' || statusData?.status === 'failed') {
      refetch();
      refetchVersions();
    }
  }, [statusData?.status, refetch, refetchVersions]);

  const updateTaskStatus = useUpdateTaskStatus();
  const enhanceGeneration = useEnhanceGeneration();

  // Build chat items from version history
  const chatItems: ChatItem[] = [];

  if (versionHistory) {
    // Add initial task creation
    if (task?.sourceImageUrl) {
      chatItems.push({
        type: 'system',
        content: `Task "${task.title || 'Untitled'}" started`,
        timestamp: versionHistory.versions[0]?.createdAt || task.createdAt,
      });
    }

    // Add each version as a generation
    const sortedVersions = [...(versionHistory.versions || [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedVersions.forEach((version, index) => {
      // Add user feedback if this is an enhancement (v2+)
      if (version.versionNumber > 1 && version.reviewComment) {
        chatItems.push({
          type: 'user',
          content: version.reviewComment,
          timestamp: version.createdAt,
        });
      }

      // Add the generation
      chatItems.push({
        type: 'generation',
        generation: version,
        timestamp: version.completedAt || version.createdAt,
      });
    });

    // Add current processing state if applicable
    if (isProcessing && task) {
      const lastVersion = sortedVersions[sortedVersions.length - 1];
      if (!lastVersion || lastVersion.id !== task.id) {
        chatItems.push({
          type: 'generation',
          generation: task,
          timestamp: task.createdAt,
        });
      }
    }
  }

  // Scroll to bottom when new items are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatItems.length]);

  const handleApprove = async (generationId: number) => {
    try {
      await updateTaskStatus.mutateAsync({ id: generationId, taskStatus: 'done' });
      toast.success('Task approved');
      refetch();
    } catch {
      toast.error('Failed to approve task');
    }
  };

  const handleEnhance = async (feedback: string, referenceImage?: File) => {
    if (!task) return;
    try {
      await enhanceGeneration.mutateAsync({
        id: task.id,
        payload: { comment: feedback },
      });
      toast.success('Enhancement started');
      refetch();
      refetchVersions();
    } catch {
      toast.error('Failed to start enhancement');
    }
  };

  const handleShowInfo = (generation: Generation | VersionHistoryItem) => {
    setSelectedGenerationForInfo(generation);
    setInfoModalOpen(true);
  };

  const getStatusBadge = () => {
    if (!task) return null;
    const status = isProcessing ? 'Generating' : STATUS_LABELS[task.taskStatus] || task.taskStatus;
    const colorClass = {
      'Generating': 'bg-blue-100 text-blue-700',
      'Review': 'bg-amber-100 text-amber-700',
      'Approved': 'bg-green-100 text-green-700',
      'Failed': 'bg-red-100 text-red-700',
      'Queued': 'bg-slate-100 text-slate-700',
    }[status] || 'bg-slate-100 text-slate-700';

    return (
      <Badge className={cn('text-xs', colorClass)}>
        {isProcessing && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
        {status}
      </Badge>
    );
  };

  if (!open) return null;

  const panelClasses = mode === 'fullscreen'
    ? 'fixed inset-0 z-50 bg-background'
    : 'fixed right-0 top-0 h-full w-[560px] border-l bg-background z-40 shadow-xl';

  return (
    <>
      <div className={cn(panelClasses, className)}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-stone-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="font-semibold text-lg truncate">
              {isLoading ? 'Loading...' : (task?.title || `Task #${taskId}`)}
            </h2>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMode(mode === 'docked' ? 'fullscreen' : 'docked')}
            >
              {mode === 'docked' ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex flex-col h-[calc(100%-65px)]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="p-5 space-y-5">
                  {/* Source image if available */}
                  {task?.sourceImageUrl && (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="w-full max-w-sm rounded-xl overflow-hidden border shadow-sm">
                        <img
                          src={task.sourceImageUrl}
                          alt="Source"
                          className="w-full h-auto"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Original source image
                      </span>
                    </div>
                  )}

                  {/* Chat items */}
                  {chatItems.map((item, index) => {
                    if (item.type === 'system') {
                      return (
                        <div key={index} className="text-center py-2">
                          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            {item.content}
                          </span>
                        </div>
                      );
                    }

                    if (item.type === 'user') {
                      return (
                        <ChatMessage
                          key={index}
                          content={item.content || ''}
                          timestamp={item.timestamp}
                          isUser
                        />
                      );
                    }

                    if (item.type === 'generation' && item.generation) {
                      const gen = item.generation;
                      const isLatest = 'isCurrentVersion' in gen ? gen.isCurrentVersion :
                        (versionHistory?.versions && gen.id === versionHistory.versions[versionHistory.versions.length - 1]?.id);

                      return (
                        <GenerationCard
                          key={gen.id}
                          generation={gen}
                          isLatest={isLatest}
                          isProcessing={'status' in gen && (gen.status === 'pending' || gen.status === 'processing')}
                          onApprove={() => handleApprove(gen.id)}
                          onEnhance={() => {
                            // Focus composer instead of opening modal
                          }}
                          onBranch={() => {
                            toast.info('Branching coming soon');
                          }}
                          onShowInfo={() => handleShowInfo(gen)}
                          sourceImageUrl={task?.sourceImageUrl}
                        />
                      );
                    }

                    return null;
                  })}

                  {/* Empty state */}
                  {chatItems.length === 0 && !task?.sourceImageUrl && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No generations yet.</p>
                      <p className="text-sm mt-1">Send feedback to start enhancing.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Composer */}
              <RichComposer
                onSend={handleEnhance}
                isLoading={enhanceGeneration.isPending || isProcessing}
                disabled={task?.taskStatus === 'done'}
                placeholder={
                  task?.taskStatus === 'done'
                    ? 'Task is approved. Reopen to make changes.'
                    : isProcessing
                    ? 'Generating...'
                    : 'Describe what to change...'
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Info Modal */}
      {selectedGenerationForInfo && (
        <InfoModal
          open={infoModalOpen}
          onOpenChange={setInfoModalOpen}
          generation={selectedGenerationForInfo}
          task={task}
        />
      )}
    </>
  );
}
