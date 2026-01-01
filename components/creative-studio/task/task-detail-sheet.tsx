'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  AlertCircle,
  Download,
  Maximize2,
  RotateCcw,
  GitBranch,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
  Trash2,
  SplitSquareHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGeneration, useGenerationStatus, useUpdateTaskStatus } from '@/lib/creative-studio/hooks';
import { EnhancementForm } from './enhancement-form';
import { BranchDialog } from './branch-dialog';
import { VersionHistory } from './version-history';
import { ImageCompareSlider } from './image-compare-slider';
import { ImageCompareDialog } from './image-compare-dialog';
import type { Generation, TaskStatus, VersionHistoryItem } from '@/lib/creative-studio/types';
import { toast } from 'sonner';

interface TaskDetailSheetProps {
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

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
};

export function TaskDetailSheet({ taskId, open, onOpenChange }: TaskDetailSheetProps) {
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
  const [selectedVersion, setSelectedVersion] = useState<VersionHistoryItem | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  // Reset selected version and compare mode when task changes
  useEffect(() => {
    setSelectedVersion(null);
    setShowCompare(false);
    setShowCompareDialog(false);
  }, [taskId]);

  const updateTaskStatus = useUpdateTaskStatus();

  const handleBranch = (versionId: number, versionNumber?: number) => {
    setBranchSourceId(versionId);
    setBranchSourceVersion(versionNumber || task?.versionNumber || 1);
    setShowBranchDialog(true);
  };

  const handleApprove = async () => {
    if (!task) return;
    try {
      await updateTaskStatus.mutateAsync({ id: task.id, taskStatus: 'done' });
      toast.success('Task approved and moved to Done');
    } catch (error) {
      toast.error('Failed to approve task');
    }
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
    toast.info('Discard & Regenerate coming soon');
  };

  // Get the display image (selected version, result, or source)
  const displayImage = selectedVersion?.resultImageUrl || task?.resultImageUrl || task?.sourceImageUrl;
  const displayVersionLabel = selectedVersion ? `v${selectedVersion.versionNumber}` : null;
  const isViewingOldVersion = selectedVersion && selectedVersion.id !== task?.id;

  // Get comparison URLs (use selected version's result if viewing old version)
  const compareResultUrl = isViewingOldVersion ? selectedVersion?.resultImageUrl : task?.resultImageUrl;
  const compareSourceUrl = task?.sourceImageUrl; // Source is shared across all versions

  // Check if compare mode is available (needs both source and result for current view)
  const canCompare = compareSourceUrl && compareResultUrl;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[420px] sm:max-w-[420px] p-0 flex flex-col gap-0"
        >
          {isLoading || !task ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Header */}
              <SheetHeader className="p-6 pb-4 border-b">
                <div className="pr-8">
                  <SheetTitle className="text-lg line-clamp-2">
                    {task.title || `Generation #${task.id}`}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Task details for {task.title || `Generation #${task.id}`}
                  </SheetDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={cn('text-xs', TASK_STATUS_COLORS[task.taskStatus])}>
                    {TASK_STATUS_LABELS[task.taskStatus]}
                  </Badge>
                  {task.versionNumber > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      v{task.versionNumber}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {task.resolution}
                  </Badge>
                  {task.branchedFromGenerationId && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <GitBranch className="h-3 w-3" />
                      Branch
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              {/* Image Preview */}
              <div className="px-6 pt-4">
                {/* Version indicator when viewing old version */}
                {isViewingOldVersion && (
                  <div className="flex items-center justify-between mb-2 p-2 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">
                      Viewing <Badge variant="secondary" className="mx-1">{displayVersionLabel}</Badge>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVersion(null)}
                    >
                      Back to Latest
                    </Button>
                  </div>
                )}
                {/* Compare Mode: Show slider */}
                {showCompare && canCompare ? (
                  <ImageCompareSlider
                    originalUrl={compareSourceUrl!}
                    resultUrl={compareResultUrl!}
                  />
                ) : (
                  /* Normal Mode: Show single image */
                  <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                    {displayImage ? (
                      <>
                        <img
                          src={displayImage}
                          alt={task.title || 'Generation'}
                          className={cn(
                            'w-full h-full object-cover',
                            isProcessing && !isViewingOldVersion && 'opacity-50'
                          )}
                        />
                        {isProcessing && !isViewingOldVersion && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="text-center text-white">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                              <p className="text-sm font-medium">Generating...</p>
                            </div>
                          </div>
                        )}
                        {task.status === 'failed' && !isViewingOldVersion && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-sm">
                            <div className="text-center text-red-600 p-4">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">Generation failed</p>
                              <p className="text-xs mt-1 opacity-80">{task.errorMessage}</p>
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
                          <span className="text-sm">No image available</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Image action buttons */}
                {displayImage && !isProcessing && (task.status !== 'failed' || isViewingOldVersion) && (
                  <div className="flex gap-2 mt-3">
                    {canCompare && (
                      <Button
                        variant={showCompare ? 'default' : 'outline'}
                        size="sm"
                        className="h-8"
                        onClick={() => setShowCompare(!showCompare)}
                      >
                        <SplitSquareHorizontal className="h-3.5 w-3.5 mr-1.5" />
                        {showCompare ? 'Exit Compare' : 'Compare'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        if (showCompare && canCompare) {
                          setShowCompareDialog(true);
                        } else {
                          window.open(displayImage, '_blank');
                        }
                      }}
                    >
                      <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                      Full
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      asChild
                    >
                      <a href={displayImage} download>
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Save
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 flex gap-2">
                {task.taskStatus === 'review' && task.status === 'completed' && (
                  <>
                    <Button
                      onClick={handleApprove}
                      className="flex-1"
                      disabled={updateTaskStatus.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEnhancementForm(true)}
                      className="flex-1"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enhance
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBranch(task.id, task.versionNumber)}>
                          <GitBranch className="h-4 w-4 mr-2" />
                          Create Branch
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDiscard} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Discard & Redo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {task.taskStatus === 'done' && (
                  <Button variant="outline" onClick={handleReopen} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reopen for Review
                  </Button>
                )}

                {task.taskStatus === 'todo' && (
                  <Button
                    onClick={async () => {
                      try {
                        await updateTaskStatus.mutateAsync({ id: task.id, taskStatus: 'in_progress' });
                        toast.success('Generation started');
                      } catch {
                        toast.error('Failed to start generation');
                      }
                    }}
                    className="flex-1"
                    disabled={updateTaskStatus.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Generation
                  </Button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex-1 overflow-hidden border-t">
                <Tabs defaultValue="history" className="h-full flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 py-0 h-auto">
                    <TabsTrigger
                      value="history"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3"
                    >
                      History
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-4 py-3"
                    >
                      Details
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        <VersionHistory
                          taskId={task.id}
                          onBranch={handleBranch}
                          onVersionClick={(version) => setSelectedVersion(version)}
                        />
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="details" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-6">
                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                          </div>
                          {task.generationTimeMs && (
                            <div>{(task.generationTimeMs / 1000).toFixed(1)}s</div>
                          )}
                        </div>

                        <Separator />

                        {/* Style Configuration */}
                        <div>
                          <h4 className="font-medium text-sm mb-3">Style Configuration</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Wall Color</span>
                              <p className="font-medium capitalize">
                                {task.promptConfig.style.wallColor.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Color Mood</span>
                              <p className="font-medium capitalize">
                                {task.promptConfig.style.colorMood}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Lighting</span>
                              <p className="font-medium capitalize">
                                {task.promptConfig.style.lighting}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs text-muted-foreground">Desaturation</span>
                              <p className="font-medium capitalize">
                                {task.promptConfig.style.desaturation}
                              </p>
                            </div>
                          </div>
                        </div>

                        {task.promptConfig.addModel && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium text-sm mb-3">Model Configuration</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="space-y-1">
                                  <span className="text-xs text-muted-foreground">Gender</span>
                                  <p className="font-medium capitalize">
                                    {task.promptConfig.model?.gender}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-xs text-muted-foreground">Pose</span>
                                  <p className="font-medium capitalize">
                                    {task.promptConfig.model?.pose}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {task.promptConfig.customInstructions && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium text-sm mb-2">Custom Instructions</h4>
                              <p className="text-sm text-muted-foreground">
                                {task.promptConfig.customInstructions}
                              </p>
                            </div>
                          </>
                        )}

                        <Separator />

                        {/* Built Prompt (collapsible) */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Generated Prompt</h4>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg max-h-40 overflow-y-auto">
                            {task.builtPrompt}
                          </p>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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

      {/* Compare Dialog (Full Screen Side-by-Side) */}
      {task && canCompare && (
        <ImageCompareDialog
          open={showCompareDialog}
          onOpenChange={setShowCompareDialog}
          originalUrl={compareSourceUrl!}
          resultUrl={compareResultUrl!}
          title={`Compare${isViewingOldVersion ? ` v${selectedVersion?.versionNumber}` : ''}: ${task.title || `Generation #${task.id}`}`}
        />
      )}
    </>
  );
}
