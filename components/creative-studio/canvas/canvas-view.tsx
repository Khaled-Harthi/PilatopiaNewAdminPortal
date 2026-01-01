'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  ConnectionMode,
  BackgroundVariant,
  PanOnScrollMode,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Map as MapIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasNode as CanvasNodeComponent } from './canvas-node';
import { NodeDetailPanel } from '../panels/node-detail-panel';
import { useBatchUpdateNodePositions, useUpdateNodeWidth } from '@/lib/creative-studio/hooks';
import type { Generation, ApprovalStatus, CanvasNode } from '@/lib/creative-studio/types';

// Custom node types
const nodeTypes: NodeTypes = {
  generation: CanvasNodeComponent,
};

export interface CanvasNodeData {
  generation: Generation;
  versionLabel: string;
  approvalStatus: ApprovalStatus;
  isGenerating: boolean;
  width: number;
  onBranch: (nodeId: string) => void;
  onQuickComment: (nodeId: string, comment: string, resolution: string) => void;
  onLike: (nodeId: string) => void;
  onDislike: (nodeId: string) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onRetry: (nodeId: string) => void;
  onResize: (nodeId: string, width: number) => void;
  [key: string]: unknown;
}

interface CanvasViewProps {
  canvasId: number;
  canvasName: string;
  nodes: CanvasNode[];
  onBack: () => void;
  onAddNode: () => void;
  onBranchNode: (generation: Generation) => void;
  onQuickComment: (generationId: number, comment: string, resolution: string) => void;
  onUpdateApproval: (generationId: number, status: ApprovalStatus) => void;
  onDeleteNode: (nodeId: number) => void;
  onRetryNode: (generationId: number) => void;
}

export function CanvasView({
  canvasId,
  canvasName,
  nodes: canvasNodes,
  onBack,
  onAddNode,
  onBranchNode,
  onQuickComment,
  onUpdateApproval,
  onDeleteNode,
  onRetryNode,
}: CanvasViewProps) {
  const [showMinimap, setShowMinimap] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const batchUpdatePositions = useBatchUpdateNodePositions();
  const updateNodeWidth = useUpdateNodeWidth();
  const draggedNodesRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Handlers defined first
  const handleBranch = useCallback((nodeId: string) => {
    const node = canvasNodes.find((n) => String(n.generation.id) === nodeId);
    if (node) {
      onBranchNode(node.generation);
    }
  }, [canvasNodes, onBranchNode]);

  const handleQuickComment = useCallback((nodeId: string, comment: string, resolution: string) => {
    onQuickComment(Number(nodeId), comment, resolution);
  }, [onQuickComment]);

  const handleSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleDelete = useCallback((nodeId: string) => {
    // Find the canvas node to get its actual node ID
    const canvasNode = canvasNodes.find((n) => String(n.generation.id) === nodeId);
    if (canvasNode) {
      onDeleteNode(canvasNode.id);
      // Clear selection if deleted node was selected
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    }
  }, [canvasNodes, onDeleteNode, selectedNodeId]);

  const handleRetry = useCallback((nodeId: string) => {
    onRetryNode(Number(nodeId));
  }, [onRetryNode]);

  const handleResize = useCallback((nodeId: string, width: number) => {
    // Find the canvas node to get its actual node ID (not generation ID)
    const canvasNode = canvasNodes.find((n) => String(n.generation.id) === nodeId);
    if (canvasNode) {
      updateNodeWidth.mutate({
        canvasId,
        nodeId: canvasNode.id,
        width: Math.round(width),
      });
    }
  }, [canvasId, canvasNodes, updateNodeWidth]);

  // Create initial React Flow nodes from canvas nodes
  const createNodes = useCallback(() => {
    return canvasNodes.map((node) => {
      const gen = node.generation;

      return {
        id: String(gen.id),
        type: 'generation',
        position: { x: node.positionX, y: node.positionY },
        data: {
          generation: gen,
          versionLabel: node.versionLabel,
          approvalStatus: node.approvalStatus,
          isGenerating: gen.status === 'pending' || gen.status === 'processing',
          width: node.width || 240,
          onBranch: handleBranch,
          onQuickComment: handleQuickComment,
          onLike: () => {},
          onDislike: () => {},
          onSelect: handleSelect,
          onDelete: handleDelete,
          onRetry: handleRetry,
          onResize: handleResize,
        } as CanvasNodeData,
      };
    });
  }, [canvasNodes, handleBranch, handleQuickComment, handleSelect, handleDelete, handleRetry, handleResize]);

  // Create edges based on parent-child relationships
  const createEdges = useCallback((): Edge[] => {
    const edges: Edge[] = [];
    canvasNodes.forEach((node) => {
      const gen = node.generation;
      const isGenerating = gen.status === 'pending' || gen.status === 'processing';

      if (gen.parentGenerationId) {
        edges.push({
          id: `e${gen.parentGenerationId}-${gen.id}`,
          source: String(gen.parentGenerationId),
          target: String(gen.id),
          type: 'smoothstep',
          animated: isGenerating,
          style: { stroke: '#57534e', strokeWidth: 2 },
        });
      }
      if (gen.branchedFromGenerationId && gen.branchedFromGenerationId !== gen.parentGenerationId) {
        edges.push({
          id: `b${gen.branchedFromGenerationId}-${gen.id}`,
          source: String(gen.branchedFromGenerationId),
          target: String(gen.id),
          type: 'smoothstep',
          animated: isGenerating,
          // Dashed while generating, solid when complete
          style: isGenerating
            ? { stroke: '#57534e', strokeWidth: 2 }
            : { stroke: '#57534e', strokeWidth: 2 },
        });
      }
    });
    return edges;
  }, [canvasNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  // Sync React Flow nodes when canvas nodes change (e.g., new node added)
  // Note: Only depend on canvasNodes data changes, not the callback functions
  useEffect(() => {
    setNodes(createNodes());
    setEdges(createEdges());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasNodes]);

  // Update handlers in nodes when they change
  const handleLike = useCallback((nodeId: string) => {
    onUpdateApproval(Number(nodeId), 'liked');
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, approvalStatus: 'liked' } }
          : node
      )
    );
  }, [onUpdateApproval, setNodes]);

  const handleDislike = useCallback((nodeId: string) => {
    onUpdateApproval(Number(nodeId), 'disliked');
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, approvalStatus: 'disliked' } }
          : node
      )
    );
  }, [onUpdateApproval, setNodes]);

  // Handle node drag - track which nodes moved
  const onNodeDrag = useCallback((_event: React.MouseEvent, node: Node) => {
    draggedNodesRef.current.set(node.id, { x: node.position.x, y: node.position.y });
  }, []);

  // Handle node drag stop - save positions to backend
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    // Get all dragged nodes and their new positions
    const updates: Array<{ nodeId: number; x: number; y: number }> = [];

    draggedNodesRef.current.forEach((position, nodeId) => {
      // Find the canvas node to get its actual node ID (not generation ID)
      const canvasNode = canvasNodes.find((n) => String(n.generation.id) === nodeId);
      if (canvasNode) {
        updates.push({
          nodeId: canvasNode.id,
          x: Math.round(position.x),
          y: Math.round(position.y),
        });
      }
    });

    if (updates.length > 0) {
      batchUpdatePositions.mutate({
        canvasId,
        updates,
      });
    }

    // Clear tracked nodes
    draggedNodesRef.current.clear();
  }, [canvasId, canvasNodes, batchUpdatePositions]);

  // Update node handlers when they change
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onLike: handleLike,
          onDislike: handleDislike,
        },
      }))
    );
  }, [handleLike, handleDislike, setNodes]);

  const selectedGeneration = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = canvasNodes.find((n) => String(n.generation.id) === selectedNodeId);
    return node?.generation || null;
  }, [selectedNodeId, canvasNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700 bg-stone-900">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-stone-300 hover:text-white hover:bg-stone-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-medium text-white">{canvasName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onAddNode}
              className="bg-white hover:bg-stone-100 text-stone-900"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={showMinimap ? "bg-stone-700 text-white" : "text-stone-300 hover:text-white hover:bg-stone-800"}
              onClick={() => setShowMinimap(!showMinimap)}
            >
              <MapIcon className="h-4 w-4 mr-1.5" />
              Minimap
            </Button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 bg-stone-900">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            minZoom={0.1}
            maxZoom={5}
            panOnScroll={true}
            panOnScrollMode={PanOnScrollMode.Free}
            zoomOnScroll={false}
            zoomOnPinch={true}
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#57534e', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#44403c" />
            <Controls position="bottom-left" className="[&>button]:bg-stone-800 [&>button]:border-stone-700 [&>button]:text-stone-300 [&>button:hover]:bg-stone-700" />
            {showMinimap && (
              <MiniMap
                position="bottom-right"
                nodeColor={(node) => {
                  const data = node.data as CanvasNodeData | undefined;
                  if (data?.approvalStatus === 'liked') return '#22c55e';
                  if (data?.approvalStatus === 'disliked') return '#57534e';
                  if (data?.isGenerating) return '#fbbf24';
                  return '#a8a29e';
                }}
                maskColor="rgba(0, 0, 0, 0.3)"
                style={{ background: '#1c1917', border: '1px solid #44403c' }}
              />
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Side Panel */}
      {selectedNodeId && selectedGeneration && (
        <NodeDetailPanel
          generation={selectedGeneration}
          onClose={() => setSelectedNodeId(null)}
          onLike={() => handleLike(selectedNodeId)}
          onDislike={() => handleDislike(selectedNodeId)}
          onBranch={() => handleBranch(selectedNodeId)}
        />
      )}
    </div>
  );
}
