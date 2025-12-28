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
} from './api';
import type { GenerationCreatePayload, PromptConfig } from './types';

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
