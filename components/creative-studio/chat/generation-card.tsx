'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Sparkles,
  GitBranch,
  Info,
  Loader2,
  AlertCircle,
  Download,
  Maximize2,
  SplitSquareHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ImageCompareDialog } from '../task/image-compare-dialog';
import type { Generation, VersionHistoryItem } from '@/lib/creative-studio/types';

interface GenerationCardProps {
  generation: Generation | VersionHistoryItem;
  isLatest?: boolean;
  isProcessing?: boolean;
  onApprove?: () => void;
  onEnhance?: () => void;
  onBranch?: () => void;
  onShowInfo?: () => void;
  sourceImageUrl?: string | null;
}

export function GenerationCard({
  generation,
  isLatest = false,
  isProcessing = false,
  onApprove,
  onEnhance,
  onBranch,
  onShowInfo,
  sourceImageUrl,
}: GenerationCardProps) {
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  const imageUrl = generation.resultImageUrl || generation.resultThumbnailUrl;
  const versionNumber = generation.versionNumber;
  const timestamp = generation.completedAt || generation.createdAt;
  const status = generation.status;
  const taskStatus = generation.taskStatus;
  const isFailed = status === 'failed';
  const isApproved = taskStatus === 'done';
  const canCompare = sourceImageUrl && imageUrl;

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        {/* Generation Card */}
        <div
          className={cn(
            'relative w-full max-w-md rounded-2xl overflow-hidden border bg-white shadow-sm',
            isApproved && 'ring-2 ring-green-500/30',
            isFailed && 'ring-2 ring-red-500/30'
          )}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] bg-stone-100">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-stone-400 mb-3" />
                <span className="text-sm font-medium text-stone-600">Generating...</span>
                <span className="text-xs text-stone-400 mt-1">This may take a moment</span>
              </div>
            ) : isFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
                <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
                <span className="text-sm font-medium text-red-600">Generation failed</span>
                {'errorMessage' in generation && generation.errorMessage && (
                  <span className="text-xs text-red-400 mt-1 px-4 text-center">
                    {generation.errorMessage}
                  </span>
                )}
              </div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={`Version ${versionNumber}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                No image
              </div>
            )}

            {/* Version badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs font-medium',
                  isApproved && 'bg-green-100 text-green-700'
                )}
              >
                v{versionNumber}
                {isApproved && <CheckCircle2 className="h-3 w-3 ml-1" />}
              </Badge>
            </div>

            {/* Image actions (on successful generations) */}
            {imageUrl && !isProcessing && !isFailed && (
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {canCompare && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => setShowCompareDialog(true)}
                  >
                    <SplitSquareHorizontal className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                  asChild
                >
                  <a href={imageUrl} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isProcessing && !isFailed && imageUrl && (
            <div className="px-4 py-3 flex items-center justify-between border-t bg-stone-50/50">
              <div className="flex items-center gap-2">
                {!isApproved && (
                  <>
                    <Button
                      size="sm"
                      className="h-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                      onClick={onApprove}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={onBranch}
                    >
                      <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                      Branch
                    </Button>
                  </>
                )}
                {isApproved && (
                  <span className="text-sm text-green-600 font-medium flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approved
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onShowInfo}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Failed state actions */}
          {isFailed && (
            <div className="px-4 py-3 flex items-center justify-center border-t bg-red-50/50">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={onBranch}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground ml-2">
          {isProcessing ? 'Generating...' : format(new Date(timestamp), 'h:mm a')}
        </span>
      </div>

      {/* Compare Dialog */}
      {canCompare && (
        <ImageCompareDialog
          open={showCompareDialog}
          onOpenChange={setShowCompareDialog}
          originalUrl={sourceImageUrl!}
          resultUrl={imageUrl!}
          title={`Compare: Source → v${versionNumber}`}
        />
      )}
    </>
  );
}
