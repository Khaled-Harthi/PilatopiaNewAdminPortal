/**
 * Creative Studio API Functions
 */

import apiClient from '@/lib/axios';
import type {
  Generation,
  GenerationListResponse,
  GenerationCreatePayload,
  GenerationCreateResponse,
  PromptConfig,
  GroupedGenerations,
  TaskStatus,
  VersionHistoryResponse,
  BranchInfo,
  EnhancePayload,
  DiscardRegeneratePayload,
  BranchPayload,
  ReorderPayload,
  Canvas,
  CanvasNode,
  ApprovalStatus,
  StylePreset,
} from './types';

const BASE_URL = '/admin/creative-studio';

// ============================================
// Generation CRUD
// ============================================

/**
 * Create a new generation request
 * Supports file upload for style_image mode
 */
export async function createGeneration(
  payload: GenerationCreatePayload,
  file?: File
): Promise<GenerationCreateResponse> {
  const formData = new FormData();
  formData.append('mode', payload.mode);
  formData.append('promptConfig', JSON.stringify(payload.promptConfig));
  if (payload.resolution) {
    formData.append('resolution', payload.resolution);
  }
  if (payload.title) {
    formData.append('title', payload.title);
  }
  if (payload.startImmediately !== undefined) {
    formData.append('startImmediately', String(payload.startImmediately));
  }
  if (file) {
    formData.append('file', file);
  }

  const response = await apiClient.post<{ success: boolean; data: GenerationCreateResponse }>(
    `${BASE_URL}/generations`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

/**
 * List generations with pagination and filters
 */
export async function fetchGenerations(params: {
  page?: number;
  limit?: number;
  status?: string;
  mode?: string;
} = {}): Promise<GenerationListResponse> {
  const response = await apiClient.get<{ success: boolean; data: GenerationListResponse }>(
    `${BASE_URL}/generations`,
    { params }
  );
  return response.data.data;
}

/**
 * Get a single generation by ID
 */
export async function fetchGeneration(id: number): Promise<Generation> {
  const response = await apiClient.get<{ success: boolean; data: Generation }>(
    `${BASE_URL}/generations/${id}`
  );
  return response.data.data;
}

/**
 * Get lightweight status for polling
 */
export async function fetchGenerationStatus(id: number): Promise<{
  id: number;
  status: string;
  errorMessage: string | null;
  resultImageUrl: string | null;
  completedAt: string | null;
}> {
  const response = await apiClient.get<{
    success: boolean;
    data: {
      id: number;
      status: string;
      errorMessage: string | null;
      resultImageUrl: string | null;
      completedAt: string | null;
    };
  }>(`${BASE_URL}/generations/${id}/status`);
  return response.data.data;
}

/**
 * Delete (cancel) a generation
 */
export async function deleteGeneration(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/generations/${id}`);
}

/**
 * Retry a failed generation
 */
export async function retryGeneration(id: number): Promise<GenerationCreateResponse> {
  const response = await apiClient.post<{ success: boolean; data: GenerationCreateResponse }>(
    `${BASE_URL}/generations/${id}/retry`
  );
  return response.data.data;
}

// ============================================
// Utility Endpoints
// ============================================

/**
 * Preview the built prompt without generating
 */
export async function previewPrompt(config: PromptConfig): Promise<{ prompt: string }> {
  const response = await apiClient.get<{ success: boolean; data: { prompt: string } }>(
    `${BASE_URL}/prompt-preview`,
    {
      params: { config: JSON.stringify(config) },
    }
  );
  return response.data.data;
}

/**
 * Get default prompt configuration
 */
export async function fetchDefaultConfig(): Promise<PromptConfig> {
  const response = await apiClient.get<{ success: boolean; data: PromptConfig }>(
    `${BASE_URL}/default-config`
  );
  return response.data.data;
}

// ============================================
// Kanban Endpoints
// ============================================

/**
 * Fetch generations grouped by task status for kanban board
 */
export async function fetchGroupedGenerations(): Promise<GroupedGenerations> {
  const response = await apiClient.get<{ success: boolean; data: GroupedGenerations }>(
    `${BASE_URL}/generations`,
    { params: { groupByStatus: true } }
  );
  return response.data.data;
}

/**
 * Update task status (kanban column)
 */
export async function updateTaskStatus(
  id: number,
  taskStatus: TaskStatus
): Promise<Generation> {
  const response = await apiClient.patch<{ success: boolean; data: Generation }>(
    `${BASE_URL}/generations/${id}/status`,
    { task_status: taskStatus }
  );
  return response.data.data;
}

/**
 * Enhance a generation with feedback (creates new version using generated image)
 */
export async function enhanceGeneration(
  id: number,
  payload: EnhancePayload
): Promise<GenerationCreateResponse> {
  const response = await apiClient.post<{ success: boolean; data: GenerationCreateResponse }>(
    `${BASE_URL}/generations/${id}/enhance`,
    payload
  );
  return response.data.data;
}

/**
 * Discard result and regenerate with new configuration
 */
export async function discardRegenerate(
  id: number,
  payload: DiscardRegeneratePayload
): Promise<GenerationCreateResponse> {
  const response = await apiClient.post<{ success: boolean; data: GenerationCreateResponse }>(
    `${BASE_URL}/generations/${id}/discard-regenerate`,
    payload
  );
  return response.data.data;
}

/**
 * Get version history for a task
 */
export async function fetchVersionHistory(id: number): Promise<VersionHistoryResponse> {
  const response = await apiClient.get<{ success: boolean; data: VersionHistoryResponse }>(
    `${BASE_URL}/generations/${id}/versions`
  );
  return response.data.data;
}

/**
 * Create a branch from a specific version
 */
export async function branchFromGeneration(
  id: number,
  payload: BranchPayload = {}
): Promise<GenerationCreateResponse> {
  const response = await apiClient.post<{ success: boolean; data: GenerationCreateResponse }>(
    `${BASE_URL}/generations/${id}/branch`,
    payload
  );
  return response.data.data;
}

/**
 * Get all branches created from a generation
 */
export async function fetchBranches(id: number): Promise<BranchInfo[]> {
  const response = await apiClient.get<{ success: boolean; data: BranchInfo[] }>(
    `${BASE_URL}/generations/${id}/branches`
  );
  return response.data.data;
}

/**
 * Batch reorder tasks (for drag-drop)
 */
export async function reorderTasks(payload: ReorderPayload): Promise<void> {
  await apiClient.patch(`${BASE_URL}/generations/reorder`, payload);
}

// ============================================
// Canvas Endpoints
// ============================================

export interface CanvasListResponse {
  active: Canvas[];
  trashed: Canvas[];
}

export interface CanvasWithNodes extends Canvas {
  nodes: CanvasNode[];
}

/**
 * Create a new canvas
 */
export async function createCanvas(name: string): Promise<Canvas> {
  const response = await apiClient.post<{ success: boolean; data: Canvas }>(
    `${BASE_URL}/canvases`,
    { name }
  );
  return response.data.data;
}

/**
 * List all canvases (active and trashed)
 */
export async function fetchCanvases(): Promise<CanvasListResponse> {
  const response = await apiClient.get<{ success: boolean; data: CanvasListResponse }>(
    `${BASE_URL}/canvases`
  );
  return response.data.data;
}

/**
 * Get canvas with all nodes
 */
export async function fetchCanvas(id: number): Promise<CanvasWithNodes> {
  const response = await apiClient.get<{ success: boolean; data: CanvasWithNodes }>(
    `${BASE_URL}/canvases/${id}`
  );
  return response.data.data;
}

/**
 * Update canvas (name or thumbnail)
 */
export async function updateCanvas(
  id: number,
  data: { name?: string; thumbnailUrl?: string }
): Promise<Canvas> {
  const response = await apiClient.patch<{ success: boolean; data: Canvas }>(
    `${BASE_URL}/canvases/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Soft delete canvas (move to trash)
 */
export async function deleteCanvas(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/canvases/${id}`);
}

/**
 * Restore canvas from trash
 */
export async function restoreCanvas(id: number): Promise<void> {
  await apiClient.post(`${BASE_URL}/canvases/${id}/restore`);
}

/**
 * Permanently delete canvas
 */
export async function permanentDeleteCanvas(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/canvases/${id}/permanent`);
}

// ============================================
// Canvas Node Endpoints
// ============================================

export interface AddNodePayload {
  positionX?: number;
  positionY?: number;
  versionLabel?: string;
  mode?: 'style_image' | 'generate_new' | 'quick_comment' | 'source_only';
  resolution?: string;
  parentNodeId?: number; // For branching
  stylePreset?: StylePreset;
  promptConfig?: PromptConfig;
  customInstructions?: string;
}

export interface AddNodeResponse {
  node: CanvasNode;
  generation: {
    id: number;
    status: string;
  };
}

/**
 * Add a new node to canvas (with optional file upload)
 */
export async function addNodeToCanvas(
  canvasId: number,
  payload: AddNodePayload,
  file?: File
): Promise<AddNodeResponse> {
  const formData = new FormData();

  if (payload.positionX !== undefined) {
    formData.append('positionX', String(payload.positionX));
  }
  if (payload.positionY !== undefined) {
    formData.append('positionY', String(payload.positionY));
  }
  if (payload.versionLabel) {
    formData.append('versionLabel', payload.versionLabel);
  }
  if (payload.mode) {
    formData.append('mode', payload.mode);
  }
  if (payload.resolution) {
    formData.append('resolution', payload.resolution);
  }
  if (payload.parentNodeId !== undefined) {
    formData.append('parentNodeId', String(payload.parentNodeId));
  }
  if (payload.stylePreset) {
    formData.append('stylePreset', payload.stylePreset);
  }
  if (payload.promptConfig) {
    formData.append('promptConfig', JSON.stringify(payload.promptConfig));
  }
  if (payload.customInstructions) {
    formData.append('customInstructions', payload.customInstructions);
  }
  if (file) {
    formData.append('file', file);
  }

  const response = await apiClient.post<{ success: boolean; data: AddNodeResponse }>(
    `${BASE_URL}/canvases/${canvasId}/nodes`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

/**
 * Update node position
 */
export async function updateNodePosition(
  canvasId: number,
  nodeId: number,
  position: { x: number; y: number }
): Promise<CanvasNode> {
  const response = await apiClient.patch<{ success: boolean; data: CanvasNode }>(
    `${BASE_URL}/canvases/${canvasId}/nodes/${nodeId}/position`,
    position
  );
  return response.data.data;
}

/**
 * Batch update node positions
 */
export async function batchUpdateNodePositions(
  canvasId: number,
  updates: Array<{ nodeId: number; x: number; y: number }>
): Promise<void> {
  await apiClient.patch(
    `${BASE_URL}/canvases/${canvasId}/nodes/positions`,
    { updates }
  );
}

/**
 * Update node approval status (like/dislike)
 */
export async function updateNodeApproval(
  canvasId: number,
  nodeId: number,
  status: ApprovalStatus
): Promise<CanvasNode> {
  const response = await apiClient.patch<{ success: boolean; data: CanvasNode }>(
    `${BASE_URL}/canvases/${canvasId}/nodes/${nodeId}/approval`,
    { status }
  );
  return response.data.data;
}

/**
 * Remove node from canvas
 */
export async function removeNodeFromCanvas(
  canvasId: number,
  nodeId: number
): Promise<void> {
  await apiClient.delete(`${BASE_URL}/canvases/${canvasId}/nodes/${nodeId}`);
}

/**
 * Update node width (for resizing)
 */
export async function updateNodeWidth(
  canvasId: number,
  nodeId: number,
  width: number
): Promise<CanvasNode> {
  const response = await apiClient.patch<{ success: boolean; data: CanvasNode }>(
    `${BASE_URL}/canvases/${canvasId}/nodes/${nodeId}/width`,
    { width }
  );
  return response.data.data;
}

// ============================================
// Library Endpoint
// ============================================

export interface LibraryItem {
  id: number;
  canvasId: number;
  canvasName: string;
  generationId: number;
  versionLabel: string;
  resultImageUrl: string | null;
  resultThumbnailUrl: string | null;
  title: string | null;
  versionNumber: number;
  createdAt: string;
  likedAt: string;
}

/**
 * Get liked nodes for library
 */
export async function fetchLibrary(canvasId?: number): Promise<LibraryItem[]> {
  const response = await apiClient.get<{ success: boolean; data: LibraryItem[] }>(
    `${BASE_URL}/library`,
    { params: canvasId ? { canvasId } : {} }
  );
  return response.data.data;
}
