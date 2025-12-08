/**
 * Home Layout React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHomeLayouts,
  fetchHomeLayout,
  createHomeLayout,
  updateHomeLayout,
  deleteHomeLayout,
  activateHomeLayout,
  deactivateHomeLayout,
  duplicateHomeLayout,
  addComponent,
  updateComponent,
  removeComponent,
  reorderComponents,
  fetchComponentTypes,
} from './api';
import type {
  HomeLayoutCreate,
  HomeLayoutUpdate,
  HomeLayoutComponentCreate,
  HomeLayoutComponentUpdate,
  ReorderComponentsPayload,
} from './types';

const QUERY_KEY = 'home-layouts';
const COMPONENT_TYPES_KEY = 'home-layout-component-types';

// ============================================
// Layout Hooks
// ============================================

export function useHomeLayouts() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: fetchHomeLayouts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHomeLayout(id: number | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchHomeLayout(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateHomeLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HomeLayoutCreate) => createHomeLayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateHomeLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HomeLayoutUpdate }) =>
      updateHomeLayout(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteHomeLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteHomeLayout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ============================================
// Layout Action Hooks
// ============================================

export function useActivateHomeLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activateHomeLayout(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDeactivateHomeLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deactivateHomeLayout(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });
}

export function useDuplicateHomeLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name?: string }) =>
      duplicateHomeLayout(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ============================================
// Component Hooks
// ============================================

export function useAddComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      layoutId,
      payload,
    }: {
      layoutId: number;
      payload: HomeLayoutComponentCreate;
    }) => addComponent(layoutId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.layoutId],
      });
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      layoutId,
      componentId,
      payload,
    }: {
      layoutId: number;
      componentId: number;
      payload: HomeLayoutComponentUpdate;
    }) => updateComponent(layoutId, componentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.layoutId],
      });
    },
  });
}

export function useRemoveComponent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      layoutId,
      componentId,
    }: {
      layoutId: number;
      componentId: number;
    }) => removeComponent(layoutId, componentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.layoutId],
      });
    },
  });
}

export function useReorderComponents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      layoutId,
      payload,
    }: {
      layoutId: number;
      payload: ReorderComponentsPayload;
    }) => reorderComponents(layoutId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.layoutId],
      });
    },
  });
}

// ============================================
// Component Types Hook
// ============================================

export function useComponentTypes() {
  return useQuery({
    queryKey: [COMPONENT_TYPES_KEY],
    queryFn: fetchComponentTypes,
    staleTime: 1000 * 60 * 30, // 30 minutes - these rarely change
  });
}
