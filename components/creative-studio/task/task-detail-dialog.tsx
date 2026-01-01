'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
  Clock,
  Maximize2,
  RotateCcw,
  GitBranch,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGeneration, useGenerationStatus, useUpdateTaskStatus } from '@/lib/creative-studio/hooks';
import { ReviewActions } from './review-actions';
import { EnhancementForm } from './enhancement-form';
import { VersionHistory } from './version-history';
import { BranchDialog } from './branch-dialog';
import type { Generation, TaskStatus } from '@/lib/creative-studio/types';
import { toast } from 'sonner';

interface TaskDetailDialogProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function TaskDetailDialog({ taskId, open, onOpenChange }: TaskDetailDialogProps) {
  const { data: task, isLoading, refetch } = useGeneration(taskId);
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
    }
  }, [statusData?.status, refetch]);

  const [showEnhancementForm, setShowEnhancementForm] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [branchSourceId, setBranchSourceId] = useState<number | null>(null);
  const [branchSourceVersion, setBranchSourceVersion] = useState<number | null>(null);

  const updateTaskStatus = useUpdateTaskStatus();

  const handleBranch = (versionId: number) => {
    setBranchSourceId(versionId);
    // Find the version number
    // For now, we'll use the task's version
    setBranchSourceVersion(task?.versionNumber || 1);
    setShowBranchDialog(true);
  };

  const handleReopen = async () => {
    if (!task) return;
    try {
      await updateTaskStatus.mutateAsync({ id: task.id, taskStatus: 'review' });
      toast.success('Task reopened and moved to Review');
    } catch (error) {
      toast.error('Failed to reopen task');
    }
  };

  const handleDiscard = () => {
    // TODO: Implement discard and regenerate
    toast.info('Discard & Regenerate coming soon');
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {isLoading || !task ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <DialogHeader className="px-6 pt-6 pb-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl">
                      {task.title || `Generation #${task.id}`}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        {TASK_STATUS_LABELS[task.taskStatus]}
                      </Badge>
                      <Badge className={cn('text-xs', STATUS_COLORS[task.status])}>
                        {task.status}
                      </Badge>
                      {task.versionNumber > 1 && (
                        <Badge variant="secondary">v{task.versionNumber}</Badge>
                      )}
                      <Badge variant="outline">{task.resolution}</Badge>
                      {task.branchedFromGenerationId && (
                        <Badge variant="outline" className="gap-1">
                          <GitBranch className="h-3 w-3" />
                          Branch
                        </Badge>
                      )}
                    </div>
                  </div>

                  {task.taskStatus === 'done' && (
                    <Button variant="outline" size="sm" onClick={handleReopen}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reopen
                    </Button>
                  )}
                </div>
              </DialogHeader>

              <div className="flex h-[calc(90vh-140px)]">
                {/* Main Image */}
                <div className="flex-1 p-6 flex flex-col">
                  <div className="relative flex-1 bg-muted rounded-lg overflow-hidden">
                    {task.resultImageUrl ? (
                      <>
                        <img
                          src={task.resultImageUrl}
                          alt={task.title || 'Generation result'}
                          className={cn(
                            'w-full h-full object-contain',
                            isProcessing && 'opacity-50'
                          )}
                        />
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Generating...</p>
                            </div>
                          </div>
                        )}
                        {task.status === 'failed' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                            <div className="text-center text-red-600">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm">{task.errorMessage || 'Generation failed'}</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : task.sourceImageUrl ? (
                      <>
                        <img
                          src={task.sourceImageUrl}
                          alt="Source image"
                          className={cn(
                            'w-full h-full object-contain',
                            isProcessing && 'opacity-50'
                          )}
                        />
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm">Generating...</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {isProcessing ? (
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="text-sm">Generating...</p>
                          </div>
                        ) : (
                          <span>No image available</span>
                        )}
                      </div>
                    )}

                    {/* Image actions */}
                    {task.resultImageUrl && (
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(task.resultImageUrl!, '_blank')}
                        >
                          <Maximize2 className="h-4 w-4 mr-1" />
                          View Full
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                        >
                          <a href={task.resultImageUrl} download>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Review Actions (only show in review status) */}
                  {task.taskStatus === 'review' && (
                    <div className="mt-4">
                      <ReviewActions
                        task={task}
                        onEnhance={() => setShowEnhancementForm(true)}
                        onDiscard={handleDiscard}
                      />
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Created: {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                    {task.generationTimeMs && (
                      <div>
                        Generation time: {(task.generationTimeMs / 1000).toFixed(1)}s
                      </div>
                    )}
                    {task.geminiModel && (
                      <div>Model: {task.geminiModel}</div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-[320px] border-l">
                  <Tabs defaultValue="versions" className="h-full flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b px-2">
                      <TabsTrigger value="versions">Versions</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="versions" className="flex-1 p-4 mt-0">
                      <VersionHistory
                        taskId={task.id}
                        onBranch={handleBranch}
                      />
                    </TabsContent>

                    <TabsContent value="details" className="flex-1 p-4 mt-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">Prompt Configuration</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Mode</span>
                                <span>{task.promptConfig.mode}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Wall Color</span>
                                <span>{task.promptConfig.style.wallColor}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Color Mood</span>
                                <span>{task.promptConfig.style.colorMood}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Lighting</span>
                                <span>{task.promptConfig.style.lighting}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Desaturation</span>
                                <span>{task.promptConfig.style.desaturation}</span>
                              </div>
                              {task.promptConfig.addModel && (
                                <>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Model Gender</span>
                                    <span>{task.promptConfig.model?.gender}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Model Pose</span>
                                    <span>{task.promptConfig.model?.pose}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium text-sm mb-2">Built Prompt</h4>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-2 rounded">
                              {task.builtPrompt}
                            </p>
                          </div>

                          {task.promptConfig.customInstructions && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium text-sm mb-2">Custom Instructions</h4>
                                <p className="text-xs text-muted-foreground">
                                  {task.promptConfig.customInstructions}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhancement Form Dialog */}
      {task && (
        <EnhancementForm
          open={showEnhancementForm}
          onOpenChange={setShowEnhancementForm}
          task={task}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Branch Dialog */}
      {task && branchSourceId && (
        <BranchDialog
          open={showBranchDialog}
          onOpenChange={setShowBranchDialog}
          sourceId={branchSourceId}
          sourceTitle={task.title}
          sourceVersion={branchSourceVersion || undefined}
          onSuccess={() => {
            setBranchSourceId(null);
            setBranchSourceVersion(null);
          }}
        />
      )}
    </>
  );
}
