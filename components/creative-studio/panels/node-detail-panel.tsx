'use client';

import { format } from 'date-fns';
import { X, ThumbsUp, ThumbsDown, GitBranch, Download, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Generation } from '@/lib/creative-studio/types';

interface NodeDetailPanelProps {
  generation: Generation;
  approvalStatus?: 'liked' | 'disliked' | null;
  onClose: () => void;
  onLike: () => void;
  onDislike: () => void;
  onBranch: () => void;
}

export function NodeDetailPanel({
  generation,
  approvalStatus,
  onClose,
  onLike,
  onDislike,
  onBranch,
}: NodeDetailPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const imageUrl = generation.resultImageUrl || generation.resultThumbnailUrl;
  const isLiked = approvalStatus === 'liked';
  const isDisliked = approvalStatus === 'disliked';

  return (
    <div className="dark w-[400px] border-l border-stone-700 bg-stone-900 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700">
        <h3 className="font-medium text-white">v{generation.versionNumber}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-stone-400 hover:text-white hover:bg-stone-800">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Image - max 20% of panel height, preserving aspect ratio */}
        {imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-stone-700 bg-stone-800">
            <img
              src={imageUrl}
              alt={`Version ${generation.versionNumber}`}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '25vh' }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-stone-900/90 hover:bg-stone-800 rounded-lg shadow-sm transition-colors"
                title="Open full image"
              >
                <Maximize2 className="h-4 w-4 text-stone-300" />
              </a>
              <a
                href={imageUrl}
                download
                className="p-2 bg-stone-900/90 hover:bg-stone-800 rounded-lg shadow-sm transition-colors"
                title="Download image"
              >
                <Download className="h-4 w-4 text-stone-300" />
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex-1 border border-stone-600 text-stone-300 hover:bg-stone-700 hover:text-white',
              isLiked && 'bg-green-600 hover:bg-green-700 text-white border-green-600'
            )}
            onClick={onLike}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'flex-1 border border-stone-600 text-stone-300 hover:bg-stone-700 hover:text-white',
              isDisliked && 'bg-stone-600 hover:bg-stone-500 text-white border-stone-600'
            )}
            onClick={onDislike}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            {isDisliked ? 'Disliked' : 'Dislike'}
          </Button>
        </div>

        {/* Branch Button */}
        <Button
          variant="ghost"
          className="w-full border border-stone-600 text-stone-300 hover:bg-stone-700 hover:text-white"
          onClick={onBranch}
        >
          <GitBranch className="h-4 w-4 mr-2" />
          Branch from this version
        </Button>

        {/* Collapsible Details */}
        <div className="border border-stone-600 rounded-lg">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-300 hover:bg-stone-700 transition-colors rounded-lg"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>Generation Details</span>
            {showDetails ? (
              <ChevronUp className="h-4 w-4 text-stone-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-stone-500" />
            )}
          </button>

          {showDetails && (
            <div className="px-4 pb-4 space-y-3 text-sm border-t border-stone-700">
              <div className="pt-3">
                <span className="text-stone-500">Model:</span>
                <span className="ml-2 text-stone-300">{generation.geminiModel || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-stone-500">Resolution:</span>
                <span className="ml-2 text-stone-300">{generation.resolution}</span>
              </div>
              {generation.generationTimeMs && (
                <div>
                  <span className="text-stone-500">Time:</span>
                  <span className="ml-2 text-stone-300">
                    {(generation.generationTimeMs / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
              {generation.promptConfig?.style?.lighting && (
                <div>
                  <span className="text-stone-500">Style:</span>
                  <span className="ml-2 text-stone-300 capitalize">
                    {generation.promptConfig.style.lighting}
                  </span>
                </div>
              )}
              {generation.promptConfig?.clothing && (
                <div>
                  <span className="text-stone-500">Outfit:</span>
                  <span className="ml-2 text-stone-300 capitalize">
                    {generation.promptConfig.clothing.topStyle?.replace('_', ' ')} +{' '}
                    {generation.promptConfig.clothing.leggings?.replace('_', ' ')}
                  </span>
                </div>
              )}
              {generation.promptConfig?.customInstructions && (
                <div>
                  <span className="text-stone-500 block mb-1">Custom Instructions:</span>
                  <p className="text-stone-300 bg-stone-800 p-2 rounded-md text-xs">
                    {generation.promptConfig.customInstructions}
                  </p>
                </div>
              )}
              {generation.builtPrompt && (
                <div>
                  <span className="text-stone-500 block mb-1">Full Prompt:</span>
                  <p className="text-stone-300 bg-stone-800 p-2 rounded-md text-xs whitespace-pre-wrap">
                    {generation.builtPrompt}
                  </p>
                </div>
              )}
              <div>
                <span className="text-stone-500">Created:</span>
                <span className="ml-2 text-stone-300">
                  {format(new Date(generation.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
