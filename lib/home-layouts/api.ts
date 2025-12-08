/**
 * Home Layout API Functions
 */

import apiClient from '@/lib/axios';
import type {
  HomeLayout,
  HomeLayoutSummary,
  HomeLayoutCreate,
  HomeLayoutUpdate,
  HomeLayoutComponent,
  HomeLayoutComponentCreate,
  HomeLayoutComponentUpdate,
  ComponentTypesResponse,
  ReorderComponentsPayload,
} from './types';

const BASE_URL = '/admin/content/home-layouts';

// ============================================
// Layout CRUD
// ============================================

export async function fetchHomeLayouts(): Promise<HomeLayoutSummary[]> {
  const response = await apiClient.get<{ success: boolean; data: HomeLayoutSummary[] }>(
    BASE_URL
  );
  return response.data.data;
}

export async function fetchHomeLayout(id: number): Promise<HomeLayout> {
  const response = await apiClient.get<{ success: boolean; data: HomeLayout }>(
    `${BASE_URL}/${id}`
  );
  return response.data.data;
}

export async function createHomeLayout(payload: HomeLayoutCreate): Promise<HomeLayout> {
  const response = await apiClient.post<{ success: boolean; data: HomeLayout; message: string }>(
    BASE_URL,
    payload
  );
  return response.data.data;
}

export async function updateHomeLayout(
  id: number,
  payload: HomeLayoutUpdate
): Promise<HomeLayout> {
  const response = await apiClient.put<{ success: boolean; data: HomeLayout; message: string }>(
    `${BASE_URL}/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteHomeLayout(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}

// ============================================
// Layout Actions
// ============================================

export async function activateHomeLayout(id: number): Promise<HomeLayout> {
  const response = await apiClient.post<{ success: boolean; data: HomeLayout; message: string }>(
    `${BASE_URL}/${id}/activate`
  );
  return response.data.data;
}

export async function deactivateHomeLayout(id: number): Promise<HomeLayout> {
  const response = await apiClient.post<{ success: boolean; data: HomeLayout; message: string }>(
    `${BASE_URL}/${id}/deactivate`
  );
  return response.data.data;
}

export async function duplicateHomeLayout(id: number, name?: string): Promise<HomeLayout> {
  const response = await apiClient.post<{ success: boolean; data: HomeLayout; message: string }>(
    `${BASE_URL}/${id}/duplicate`,
    name ? { name } : undefined
  );
  return response.data.data;
}

// ============================================
// Component Management
// ============================================

export async function addComponent(
  layoutId: number,
  payload: HomeLayoutComponentCreate
): Promise<HomeLayoutComponent> {
  const response = await apiClient.post<{ success: boolean; data: HomeLayoutComponent; message: string }>(
    `${BASE_URL}/${layoutId}/components`,
    payload
  );
  return response.data.data;
}

export async function updateComponent(
  layoutId: number,
  componentId: number,
  payload: HomeLayoutComponentUpdate
): Promise<HomeLayoutComponent> {
  const response = await apiClient.put<{ success: boolean; data: HomeLayoutComponent; message: string }>(
    `${BASE_URL}/${layoutId}/components/${componentId}`,
    payload
  );
  return response.data.data;
}

export async function removeComponent(
  layoutId: number,
  componentId: number
): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${layoutId}/components/${componentId}`);
}

export async function reorderComponents(
  layoutId: number,
  payload: ReorderComponentsPayload
): Promise<void> {
  await apiClient.patch(`${BASE_URL}/${layoutId}/components/reorder`, payload);
}

// ============================================
// Component Types
// ============================================

export async function fetchComponentTypes(): Promise<ComponentTypesResponse> {
  const response = await apiClient.get<{ success: boolean; data: ComponentTypesResponse }>(
    `${BASE_URL}/component-types`
  );
  return response.data.data;
}
