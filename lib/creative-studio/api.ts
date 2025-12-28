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
