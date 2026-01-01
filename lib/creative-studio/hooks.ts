/**
 * Creative Studio React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGenerations,
  fetchGeneration,
  fetchGenerationStatus,
  createGeneration,
  deleteGeneration,
  retryGeneration,
  previewPrompt,
  fetchDefaultConfig,
  fetchGroupedGenerations,
  updateTaskStatus,
  enhanceGeneration,
  discardRegenerate,
  fetchVersionHistory,
  branchFromGeneration,
  fetchBranches,
  reorderTasks,
  // Canvas API
  createCanvas,
  fetchCanvases,
  fetchCanvas,
  updateCanvas,
  deleteCanvas as deleteCanvasApi,
  restoreCanvas,
  permanentDeleteCanvas,
  addNodeToCanvas,
  updateNodePosition,
  batchUpdateNodePositions,
  updateNodeApproval,
  removeNodeFromCanvas,
  updateNodeWidth,
  fetchLibrary,
  type AddNodePayload,
} from './api';
import type {
  GenerationCreatePayload,
  PromptConfig,
  TaskStatus,
  EnhancePayload,
  DiscardRegeneratePayload,
  BranchPayload,
  ReorderPayload,
  GroupedGenerations,
  ApprovalStatus,
  StylePreset,
} from './types';

const QUERY_KEY = 'creative-generations';
const DEFAULT_CONFIG_KEY = 'creative-default-config';

// ============================================
// Generation Hooks
// ============================================

/**
 * List generations with pagination
 */
export function useGenerations(params: {
  page?: number;
  limit?: number;
  status?: string;
  mode?: string;
} = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => fetchGenerations(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get a single generation
 */
export function useGeneration(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchGeneration(id!),
    enabled: id !== null,
    staleTime: 1000 * 10,
  });
}

/**
 * Poll generation status (for pending/processing generations)
 */
export function useGenerationStatus(id: number | null, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'status'],
    queryFn: () => fetchGenerationStatus(id!),
    enabled: enabled && id !== null,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when complete or failed
      if (data?.status === 'completed' || data?.status === 'failed' || data?.status === 'cancelled') {
        return false;
      }
      return 2000; // Poll every 2 seconds while processing
    },
  });
}

/**
 * Count pending/processing generations (for header badge)
 */
export function usePendingGenerationsCount() {
  const { data } = useGenerations({ status: 'pending,processing', limit: 1 });
  return data?.total || 0;
}

/**
 * Create a new generation
 */
export function useCreateGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, file }: { payload: GenerationCreatePayload; file?: File }) =>
      createGeneration(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Delete a generation
 */
export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGeneration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Retry a failed generation
 */
export function useRetryGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => retryGeneration(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

// ============================================
// Utility Hooks
// ============================================

/**
 * Preview prompt (for debugging/display)
 */
export function usePromptPreview(config: PromptConfig | null) {
  return useQuery({
    queryKey: ['prompt-preview', config],
    queryFn: () => previewPrompt(config!),
    enabled: config !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get default configuration
 */
export function useDefaultConfig() {
  return useQuery({
    queryKey: [DEFAULT_CONFIG_KEY],
    queryFn: fetchDefaultConfig,
    staleTime: 1000 * 60 * 60, // 1 hour - rarely changes
  });
}

// ============================================
// Kanban Hooks
// ============================================

const GROUPED_KEY = 'creative-generations-grouped';
const VERSION_KEY = 'creative-generation-versions';
const BRANCH_KEY = 'creative-generation-branches';

/**
 * Fetch generations grouped by task status for kanban board
 */
export function useGroupedGenerations() {
  return useQuery({
    queryKey: [GROUPED_KEY],
    queryFn: fetchGroupedGenerations,
    staleTime: 1000 * 10, // 10 seconds
  });
}

/**
 * Update task status (kanban column change)
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, taskStatus }: { id: number; taskStatus: TaskStatus }) =>
      updateTaskStatus(id, taskStatus),
    onMutate: async ({ id, taskStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [GROUPED_KEY] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<GroupedGenerations>([GROUPED_KEY]);

      // Optimistically update
      queryClient.setQueryData<GroupedGenerations>([GROUPED_KEY], (old) => {
        if (!old) return old;

        // Deep clone to avoid mutations
        const newData: GroupedGenerations = {
          todo: [...(old.todo || [])],
          in_progress: [...(old.in_progress || [])],
          review: [...(old.review || [])],
          done: [...(old.done || [])],
        };

        // Find and remove the task from its current column
        let movedTask = null;
        for (const status of ['todo', 'in_progress', 'review', 'done'] as TaskStatus[]) {
          const index = newData[status]?.findIndex((t) => t.id === id);
          if (index !== undefined && index !== -1) {
            [movedTask] = newData[status].splice(index, 1);
            break;
          }
        }

        // Add to new column
        if (movedTask) {
          movedTask.taskStatus = taskStatus;
          newData[taskStatus] = [...(newData[taskStatus] || []), movedTask];
        }

        return newData;
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([GROUPED_KEY], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPED_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Enhance a generation with feedback
 */
export function useEnhanceGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EnhancePayload }) =>
      enhanceGeneration(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPED_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Discard result and regenerate
 */
export function useDiscardRegenerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DiscardRegeneratePayload }) =>
      discardRegenerate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPED_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Get version history for a task
 */
export function useVersionHistory(id: number | null) {
  return useQuery({
    queryKey: [VERSION_KEY, id],
    queryFn: () => fetchVersionHistory(id!),
    enabled: id !== null,
    staleTime: 1000 * 30,
  });
}

/**
 * Create a branch from a specific version
 */
export function useBranchFromGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: BranchPayload }) =>
      branchFromGeneration(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPED_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BRANCH_KEY] });
    },
  });
}

/**
 * Get branches created from a generation
 */
export function useBranches(id: number | null) {
  return useQuery({
    queryKey: [BRANCH_KEY, id],
    queryFn: () => fetchBranches(id!),
    enabled: id !== null,
    staleTime: 1000 * 30,
  });
}

/**
 * Batch reorder tasks (for drag-drop)
 */
export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderPayload) => reorderTasks(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GROUPED_KEY] });
    },
  });
}

// ============================================
// Canvas Hooks
// ============================================

const CANVAS_KEY = 'creative-canvases';
const CANVAS_DETAIL_KEY = 'creative-canvas';
const LIBRARY_KEY = 'creative-library';

/**
 * Fetch all canvases (active and trashed)
 */
export function useCanvases() {
  return useQuery({
    queryKey: [CANVAS_KEY],
    queryFn: fetchCanvases,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Fetch a single canvas with all nodes
 * Polls every 3 seconds while any generation is pending/processing
 */
export function useCanvas(id: number | null) {
  return useQuery({
    queryKey: [CANVAS_DETAIL_KEY, id],
    queryFn: () => fetchCanvas(id!),
    enabled: id !== null,
    staleTime: 1000 * 3,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.nodes) return false;
      // Poll while any node has pending/processing generation
      const hasPending = data.nodes.some(
        (node: { generation: { status: string } }) =>
          node.generation.status === 'pending' || node.generation.status === 'processing'
      );
      return hasPending ? 3000 : false; // Poll every 3 seconds if pending
    },
  });
}

/**
 * Create a new canvas
 */
export function useCreateCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createCanvas(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_KEY] });
    },
  });
}

/**
 * Update canvas (name or thumbnail)
 */
export function useUpdateCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; thumbnailUrl?: string } }) =>
      updateCanvas(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CANVAS_DETAIL_KEY, id] });
    },
  });
}

/**
 * Soft delete canvas (move to trash)
 */
export function useDeleteCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCanvasApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_KEY] });
    },
  });
}

/**
 * Restore canvas from trash
 */
export function useRestoreCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restoreCanvas(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_KEY] });
    },
  });
}

/**
 * Permanently delete canvas
 */
export function usePermanentDeleteCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permanentDeleteCanvas(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_KEY] });
    },
  });
}

// ============================================
// Canvas Node Hooks
// ============================================

/**
 * Add a node to canvas
 */
export function useAddNodeToCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canvasId,
      payload,
      file,
    }: {
      canvasId: number;
      payload: AddNodePayload;
      file?: File;
    }) => addNodeToCanvas(canvasId, payload, file),
    onSuccess: (_, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_DETAIL_KEY, canvasId] });
    },
  });
}

/**
 * Update node position
 */
export function useUpdateNodePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canvasId,
      nodeId,
      position,
    }: {
      canvasId: number;
      nodeId: number;
      position: { x: number; y: number };
    }) => updateNodePosition(canvasId, nodeId, position),
    // Don't invalidate on every drag - batch updates handle this
  });
}

/**
 * Batch update node positions (after drag end)
 */
export function useBatchUpdateNodePositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canvasId,
      updates,
    }: {
      canvasId: number;
      updates: Array<{ nodeId: number; x: number; y: number }>;
    }) => batchUpdateNodePositions(canvasId, updates),
    onSuccess: (_, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_DETAIL_KEY, canvasId] });
    },
  });
}

/**
 * Update node approval status (like/dislike)
 */
export function useUpdateNodeApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canvasId,
      nodeId,
      status,
    }: {
      canvasId: number;
      nodeId: number;
      status: ApprovalStatus;
    }) => updateNodeApproval(canvasId, nodeId, status),
    onSuccess: (_, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_DETAIL_KEY, canvasId] });
      queryClient.invalidateQueries({ queryKey: [LIBRARY_KEY] });
    },
  });
}

/**
 * Remove node from canvas
 */
export function useRemoveNodeFromCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ canvasId, nodeId }: { canvasId: number; nodeId: number }) =>
      removeNodeFromCanvas(canvasId, nodeId),
    onSuccess: (_, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_DETAIL_KEY, canvasId] });
    },
  });
}

/**
 * Update node width (for resizing)
 */
export function useUpdateNodeWidth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canvasId,
      nodeId,
      width,
    }: {
      canvasId: number;
      nodeId: number;
      width: number;
    }) => updateNodeWidth(canvasId, nodeId, width),
    onSuccess: (_, { canvasId }) => {
      queryClient.invalidateQueries({ queryKey: [CANVAS_DETAIL_KEY, canvasId] });
    },
  });
}

// ============================================
// Library Hooks
// ============================================

/**
 * Fetch library (liked nodes)
 */
export function useLibrary(canvasId?: number) {
  return useQuery({
    queryKey: [LIBRARY_KEY, canvasId],
    queryFn: () => fetchLibrary(canvasId),
    staleTime: 1000 * 30,
  });
}
