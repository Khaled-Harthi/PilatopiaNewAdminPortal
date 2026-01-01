'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, useOnViewportChange } from '@xyflow/react';
import { Loader2, ThumbsUp, ThumbsDown, AlertCircle, Plus, MessageSquare, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Generation, ApprovalStatus, Resolution } from '@/lib/creative-studio/types';

interface CanvasNodeData {
  generation: Generation;
  versionLabel: string;
  approvalStatus: ApprovalStatus;
  isGenerating: boolean;
  width: number;
  onBranch: (nodeId: string) => void;
  onQuickComment: (nodeId: string, comment: string, resolution: Resolution) => void;
  onLike: (nodeId: string) => void;
  onDislike: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onRetry: (nodeId: string) => void;
  onResize: (nodeId: string, width: number) => void;
}

interface CanvasNodeProps {
  data: CanvasNodeData;
  selected?: boolean;
}

const RESOLUTIONS: Resolution[] = ['1K', '2K', '4K'];

export const CanvasNode = memo(function CanvasNode({ data, selected }: CanvasNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [resolution, setResolution] = useState<Resolution>('2K');
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(data.width || 240);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);
  const nodeData = data;
  const { generation, versionLabel, approvalStatus, isGenerating, width, onBranch, onQuickComment, onLike, onDislike, onSelect, onDelete, onRetry, onResize } = nodeData;

  // Sync currentWidth with props when they change (from server)
  useEffect(() => {
    if (!isResizing && width) {
      setCurrentWidth(width);
    }
  }, [width, isResizing]);

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = { x: e.clientX, width: currentWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const delta = moveEvent.clientX - resizeStartRef.current.x;
      const newWidth = Math.min(1000, Math.max(100, resizeStartRef.current.width + delta));
      setCurrentWidth(newWidth);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsResizing(false);
      if (resizeStartRef.current) {
        // Calculate final width from mouse position (avoids stale closure issue)
        const delta = upEvent.clientX - resizeStartRef.current.x;
        const finalWidth = Math.min(1000, Math.max(100, resizeStartRef.current.width + delta));
        if (finalWidth !== resizeStartRef.current.width) {
          onResize(String(generation.id), finalWidth);
        }
      }
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate popover position when shown
  useEffect(() => {
    if (showCommentInput && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setPopoverPosition({
        x: rect.right + 16, // 16px gap from node
        y: rect.top + rect.height / 2,
      });
    }
  }, [showCommentInput]);

  // Focus input when shown
  useEffect(() => {
    if (showCommentInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCommentInput]);

  // Close popover when viewport changes (pan/zoom)
  useOnViewportChange({
    onChange: () => {
      if (showCommentInput) {
        setShowCommentInput(false);
        setCommentText('');
        setResolution('2K');
      }
    },
  });

  // Close popover when clicking outside
  useEffect(() => {
    if (!showCommentInput) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is inside the popover (which is portaled to body)
      if (target.closest('.comment-popover-portal')) return;
      // Check if click is on the comment button
      if (target.closest('.comment-button')) return;

      setShowCommentInput(false);
      setCommentText('');
      setResolution('2K');
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCommentInput]);

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onQuickComment(String(generation.id), commentText.trim(), resolution);
      setCommentText('');
      setResolution('2K');
      setShowCommentInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    } else if (e.key === 'Escape') {
      setShowCommentInput(false);
      setCommentText('');
      setResolution('2K');
    }
  };

  const imageUrl = generation.resultImageUrl || generation.resultThumbnailUrl || generation.sourceImageUrl;
  const isFailed = generation.status === 'failed';
  const isLiked = approvalStatus === 'liked';
  const isDisliked = approvalStatus === 'disliked';

  return (
    <div
      ref={nodeRef}
      className={cn(
        'relative rounded-xl bg-white shadow-md border-2 transition-all',
        selected && 'ring-2 ring-amber-500 ring-offset-2',
        isLiked && 'border-green-500',
        isDisliked && 'border-stone-300 opacity-50',
        isFailed && 'border-red-400',
        !isLiked && !isDisliked && !isFailed && 'border-transparent'
      )}
      style={{ width: currentWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(String(generation.id))}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-stone-400 !border-white !w-3 !h-3"
      />

      {/* Image Container - preserves aspect ratio */}
      <div className="relative bg-stone-100 rounded-xl overflow-hidden">
        {isGenerating ? (
          <div className="relative min-h-[160px] flex flex-col items-center justify-center">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={versionLabel}
                  className="w-full h-auto opacity-50"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                  <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                  <span className="text-xs text-white font-medium">Generating...</span>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-stone-400 mb-2" />
                <span className="text-xs text-stone-500">Generating...</span>
              </>
            )}
          </div>
        ) : isFailed ? (
          <div className="min-h-[160px] flex flex-col items-center justify-center bg-red-50 p-3">
            <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
            <span className="text-xs text-red-600 font-medium mb-1">Failed</span>
            {generation.errorMessage && (
              <p className="text-[10px] text-red-500 text-center line-clamp-2 px-2 mb-2">
                {generation.errorMessage}
              </p>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg shadow-sm border border-stone-200 transition-all hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                onRetry(String(generation.id));
              }}
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={versionLabel}
            className="w-full h-auto"
          />
        ) : (
          <div className="min-h-[160px] flex items-center justify-center text-stone-400">
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Version Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded-md backdrop-blur-sm">
            {versionLabel}
          </span>
          {isLiked && (
            <span className="p-1 bg-green-500 text-white rounded-md">
              <ThumbsUp className="h-3 w-3" />
            </span>
          )}
          {isDisliked && (
            <span className="p-1 bg-stone-400 text-white rounded-md">
              <ThumbsDown className="h-3 w-3" />
            </span>
          )}
        </div>

      </div>

      {/* Action Buttons (on hover) - outside image container to avoid clipping */}
      {(isHovered || showCommentInput) && !isGenerating && (
        <>
          {/* Delete Button - top right */}
          <button
            className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 z-50 p-1.5 bg-white hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-full shadow-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(String(generation.id));
            }}
            title="Delete node"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {!isFailed && (
            <>
              {/* Branch Button */}
              <button
                className="absolute right-0 top-1/2 -translate-y-7 translate-x-1/2 z-50 p-2 bg-white hover:bg-stone-100 text-stone-900 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  onBranch(String(generation.id));
                }}
                title="Branch from this version"
              >
                <Plus className="h-4 w-4" />
              </button>
              {/* Quick Comment Button */}
              <button
                className={cn(
                  "comment-button absolute right-0 top-1/2 translate-y-3 translate-x-1/2 z-50 p-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-200 hover:scale-110",
                  showCommentInput ? "bg-stone-200 text-stone-900 scale-110" : "bg-white hover:bg-stone-100 text-stone-900"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCommentInput(!showCommentInput);
                }}
                title="Quick comment"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            </>
          )}
        </>
      )}

      {/* Inline Comment Input - Rendered via Portal to escape stacking context */}
      {showCommentInput && createPortal(
        <div
          className="comment-popover-portal fixed z-[9999]"
          style={{
            left: popoverPosition.x,
            top: popoverPosition.y,
            transform: 'translateY(-50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-stone-800 rounded-2xl shadow-2xl p-3 min-w-[320px]">
            {/* Comment textarea */}
            <textarea
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the changes you want..."
              rows={2}
              className="w-full bg-transparent text-white placeholder-stone-400 text-sm outline-none resize-none mb-3"
            />

            {/* Bottom row: Resolution picker + Create button */}
            <div className="flex items-center justify-between">
              {/* Resolution picker */}
              <div className="flex items-center gap-1 bg-stone-700/50 rounded-lg p-0.5">
                {RESOLUTIONS.map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                      resolution === res
                        ? "bg-stone-600 text-white"
                        : "text-stone-400 hover:text-white"
                    )}
                  >
                    {res}
                  </button>
                ))}
              </div>

              {/* Create button */}
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                  commentText.trim()
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-stone-700 text-stone-500 cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Resize Handle - bottom right corner */}
      {(isHovered || isResizing) && !isGenerating && (
        <div
          className="nodrag absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 group"
          onMouseDown={handleResizeStart}
        >
          {/* Visual indicator */}
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-stone-400 group-hover:border-stone-600 transition-colors" />
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-stone-400 !border-white !w-3 !h-3"
      />
    </div>
  );
});
