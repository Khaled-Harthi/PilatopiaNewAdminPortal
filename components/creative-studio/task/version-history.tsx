'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GitBranch, ChevronDown, ChevronRight, Clock, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useVersionHistory } from '@/lib/creative-studio/hooks';
import type { Generation, VersionHistoryItem, BranchHistoryItem } from '@/lib/creative-studio/types';

interface VersionHistoryProps {
  taskId: number;
  onBranch: (versionId: number) => void;
  onVersionClick?: (version: VersionHistoryItem) => void;
}

export function VersionHistory({ taskId, onBranch, onVersionClick }: VersionHistoryProps) {
  const { data, isLoading } = useVersionHistory(taskId);
  const [showBranchHistory, setShowBranchHistory] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const { versions, branchHistory } = data;

  return (
    <div className="space-y-4">
      {/* Branch History (if branched from another task) */}
      {branchHistory && branchHistory.length > 0 && (
        <Collapsible open={showBranchHistory} onOpenChange={setShowBranchHistory}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground">
              {showBranchHistory ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <GitBranch className="h-4 w-4 mr-2" />
              Branched from {branchHistory[0]?.title || 'another task'} (v{branchHistory.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pl-6 border-l-2 border-dashed border-muted ml-4 space-y-2 py-2">
              {branchHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  {item.resultThumbnailUrl && (
                    <img
                      src={item.resultThumbnailUrl}
                      alt={`v${item.versionNumber}`}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span>v{item.versionNumber}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Version Timeline */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {versions.map((version, index) => (
            <VersionItem
              key={version.id}
              version={version}
              isLatest={index === versions.length - 1}
              onBranch={() => onBranch(version.id)}
              onClick={() => onVersionClick?.(version)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface VersionItemProps {
  version: VersionHistoryItem;
  isLatest: boolean;
  onBranch: () => void;
  onClick?: () => void;
}

function VersionItem({ version, isLatest, onBranch, onClick }: VersionItemProps) {
  const isCompleted = version.status === 'completed';
  const isProcessing = version.status === 'pending' || version.status === 'processing';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
        isLatest && 'border-primary bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
        {version.resultThumbnailUrl ? (
          <img
            src={version.resultThumbnailUrl}
            alt={`Version ${version.versionNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">v{version.versionNumber}</span>
          {isLatest && (
            <Badge variant="outline" className="text-xs">
              Latest
            </Badge>
          )}
          {isCompleted && (
            <Check className="h-3 w-3 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Clock className="h-3 w-3" />
          <span>
            {version.completedAt
              ? format(new Date(version.completedAt), 'MMM d, h:mm a')
              : format(new Date(version.createdAt), 'MMM d, h:mm a')}
          </span>
        </div>
        {version.reviewComment && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            &ldquo;{version.reviewComment}&rdquo;
          </p>
        )}
      </div>

      {/* Branch button */}
      {isCompleted && !isLatest && (
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onBranch();
          }}
        >
          <GitBranch className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
