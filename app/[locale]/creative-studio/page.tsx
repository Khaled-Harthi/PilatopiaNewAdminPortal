'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { HomePage } from '@/components/creative-studio/home/home-page';
import { CanvasView } from '@/components/creative-studio/canvas/canvas-view';
import { CreateCanvasModal } from '@/components/creative-studio/modals/create-canvas-modal';
import { AddNodeModal } from '@/components/creative-studio/modals/add-node-modal';
import { CreationPopover } from '@/components/creative-studio/panels/creation-popover';
import {
  useCreateCanvas,
  useCanvas,
  useUpdateNodeApproval,
  useAddNodeToCanvas,
  useRemoveNodeFromCanvas,
  useRetryGeneration,
} from '@/lib/creative-studio/hooks';
import type { Generation, ApprovalStatus, CanvasNode } from '@/lib/creative-studio/types';

function CreativeStudioContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-based canvas selection
  const selectedCanvasId = searchParams.get('canvas') ? parseInt(searchParams.get('canvas')!, 10) : null;

  // Modal states
  const [isCreateCanvasOpen, setIsCreateCanvasOpen] = useState(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [branchingNode, setBranchingNode] = useState<Generation | null>(null);

  // Hooks
  const createCanvasMutation = useCreateCanvas();
  const { data: canvasData, isLoading: canvasLoading } = useCanvas(selectedCanvasId);
  const updateApprovalMutation = useUpdateNodeApproval();
  const addNodeMutation = useAddNodeToCanvas();
  const deleteNodeMutation = useRemoveNodeFromCanvas();
  const retryMutation = useRetryGeneration();

  // Get canvas nodes (includes position, approval status, and generation)
  const canvasNodes: CanvasNode[] = canvasData?.nodes || [];

  const handleDeleteNode = useCallback((nodeId: number) => {
    if (!selectedCanvasId) return;
    deleteNodeMutation.mutate({ canvasId: selectedCanvasId, nodeId });
  }, [selectedCanvasId, deleteNodeMutation]);

  const handleRetryNode = useCallback((generationId: number) => {
    retryMutation.mutate(generationId);
  }, [retryMutation]);

  const handleOpenCanvas = useCallback((canvasId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('canvas', canvasId.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleBackToHome = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('canvas');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleCreateCanvas = async (data: { name: string; file?: File }) => {
    try {
      const canvas = await createCanvasMutation.mutateAsync(data.name || `Canvas ${new Date().toLocaleDateString()}`);

      // If a file was uploaded, add it as the first node on the canvas
      if (data.file) {
        await addNodeMutation.mutateAsync({
          canvasId: canvas.id,
          payload: {
            positionX: 100,
            positionY: 100,
            versionLabel: 'v1',
            mode: 'source_only', // Just upload, no generation - user can branch to style
          },
          file: data.file,
        });
      }

      // Open the newly created canvas
      handleOpenCanvas(canvas.id);
    } catch (error) {
      console.error('Failed to create canvas:', error);
      throw error;
    }
  };

  const handleBranchNode = useCallback((generation: Generation) => {
    setBranchingNode(generation);
  }, []);

  const handleUpdateApproval = useCallback((generationId: number, status: ApprovalStatus) => {
    if (!selectedCanvasId || !canvasData?.nodes) return;

    // Find the node for this generation
    const node = canvasData.nodes.find((n: CanvasNode) => n.generation.id === generationId);
    if (node) {
      updateApprovalMutation.mutate({
        canvasId: selectedCanvasId,
        nodeId: node.id,
        status,
      });
    }
  }, [selectedCanvasId, canvasData, updateApprovalMutation]);

  const handleCreateBranch = async (parentId: number, config: any) => {
    if (!selectedCanvasId) return;

    // Find the parent node to position the new node to its right
    const parentNode = canvasNodes.find((n) => n.generation.id === parentId);
    const parentX = parentNode?.positionX ?? 100;
    const parentY = parentNode?.positionY ?? 100;

    // Position new node to the right of parent with some offset
    const newPositionX = parentX + 350; // 350px to the right
    const newPositionY = parentY; // Same Y level

    // Build promptConfig from the creation popover's config
    const promptConfig = {
      mode: 'style_image' as const,
      imageHasModel: config.addModel,
      addModel: config.addModel,
      style: {
        wallColor: 'warm_cream' as const,
        colorMood: 'earthy' as const,
        lighting: config.stylePreset !== 'none' ? config.stylePreset : 'natural',
        desaturation: 'moderate' as const,
      },
      clothing: config.addModel && config.outfit ? {
        topStyle: config.outfit.top,
        topColor: config.outfit.topColor,
        leggings: config.outfit.bottom,
        leggingsColor: config.outfit.bottomColor,
      } : undefined,
      customInstructions: config.customInstructions || '',
    };

    try {
      await addNodeMutation.mutateAsync({
        canvasId: selectedCanvasId,
        payload: {
          parentNodeId: parentId,
          mode: 'style_image',
          stylePreset: config.stylePreset,
          promptConfig,
          customInstructions: config.customInstructions,
          resolution: config.resolution || '2K',
          positionX: newPositionX,
          positionY: newPositionY,
          versionLabel: 'v2', // Will be computed properly on backend
        },
      });
      setBranchingNode(null);
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  const handleAddNode = async (data: { title?: string; file: File }) => {
    if (!selectedCanvasId) return;

    // Calculate position for new node (place it after existing nodes)
    const existingNodes = canvasNodes.length;
    const col = existingNodes % 4;
    const row = Math.floor(existingNodes / 4);

    try {
      await addNodeMutation.mutateAsync({
        canvasId: selectedCanvasId,
        payload: {
          positionX: col * 280 + 100,
          positionY: row * 300 + 100,
          versionLabel: `v${existingNodes + 1}`,
          mode: 'source_only', // Just upload, no generation - user can branch to style
        },
        file: data.file,
      });
    } catch (error) {
      console.error('Failed to add node:', error);
      throw error;
    }
  };

  const handleQuickComment = useCallback(async (generationId: number, comment: string, resolution: string) => {
    if (!selectedCanvasId) return;

    // Find the parent node to position the new node to its right
    const parentNode = canvasNodes.find((n) => n.generation.id === generationId);
    const parentX = parentNode?.positionX ?? 100;
    const parentY = parentNode?.positionY ?? 100;

    // Position new node to the right of parent
    const newPositionX = parentX + 350;
    const newPositionY = parentY;

    try {
      await addNodeMutation.mutateAsync({
        canvasId: selectedCanvasId,
        payload: {
          parentNodeId: generationId,
          mode: 'quick_comment',
          customInstructions: comment,
          resolution,
          positionX: newPositionX,
          positionY: newPositionY,
          versionLabel: 'v2', // Will be computed properly on backend
        },
      });
    } catch (error) {
      console.error('Failed to create quick comment generation:', error);
    }
  }, [selectedCanvasId, canvasNodes, addNodeMutation]);

  // If a canvas is selected, show the canvas view
  if (selectedCanvasId) {
    if (canvasLoading) {
      return (
        <div className="h-screen bg-stone-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
        </div>
      );
    }

    return (
      <div className="h-screen bg-stone-900">
        <CanvasView
          canvasId={selectedCanvasId}
          canvasName={canvasData?.name || 'Untitled Canvas'}
          nodes={canvasNodes}
          onBack={handleBackToHome}
          onAddNode={() => setIsAddNodeOpen(true)}
          onBranchNode={handleBranchNode}
          onQuickComment={handleQuickComment}
          onUpdateApproval={handleUpdateApproval}
          onDeleteNode={handleDeleteNode}
          onRetryNode={handleRetryNode}
        />

        {/* Add Node Modal */}
        <AddNodeModal
          open={isAddNodeOpen}
          onOpenChange={setIsAddNodeOpen}
          onAddNode={handleAddNode}
        />

        {/* Branch/Create Popover */}
        {branchingNode && (
          <CreationPopover
            open={!!branchingNode}
            onOpenChange={(open) => !open && setBranchingNode(null)}
            parentGeneration={branchingNode}
            onSubmit={(config) => handleCreateBranch(branchingNode.id, config)}
          />
        )}
      </div>
    );
  }

  // Otherwise, show the home page
  return (
    <div className="h-screen bg-stone-50/30">
      <HomePage
        onOpenCanvas={handleOpenCanvas}
        onCreateCanvas={() => setIsCreateCanvasOpen(true)}
      />

      {/* Create Canvas Modal */}
      <CreateCanvasModal
        open={isCreateCanvasOpen}
        onOpenChange={setIsCreateCanvasOpen}
        onCreateCanvas={handleCreateCanvas}
      />
    </div>
  );
}

// Wrapper component with Suspense for useSearchParams
export default function CreativeStudioPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-stone-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    }>
      <CreativeStudioContent />
    </Suspense>
  );
}
