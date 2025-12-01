/**
 * React Query hooks for Settings Content Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchClassTypes,
  createClassType,
  updateClassType,
  deleteClassType,
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  fetchTagCategories,
  createTagCategory,
  updateTagCategory,
  deleteTagCategory,
  fetchInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  fetchNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  fetchFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from './api';
import type {
  ClassTypeCreate,
  ClassTypeUpdate,
  RoomCreate,
  RoomUpdate,
  TagCreate,
  TagUpdate,
  TagCategoryCreate,
  TagCategoryUpdate,
  InstructorCreate,
  InstructorUpdate,
  NotificationTemplateCreate,
  NotificationTemplateUpdate,
  FAQCreate,
  FAQUpdate,
} from './types';

// ============================================
// Class Types Hooks
// ============================================

export function useClassTypes() {
  return useQuery({
    queryKey: ['class-types'],
    queryFn: fetchClassTypes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateClassType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClassTypeCreate) => createClassType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-types'] });
    },
  });
}

export function useUpdateClassType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClassTypeUpdate }) =>
      updateClassType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-types'] });
    },
  });
}

export function useDeleteClassType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClassType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-types'] });
    },
  });
}

// ============================================
// Rooms Hooks
// ============================================

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoomCreate) => createRoom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RoomUpdate }) => updateRoom(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// ============================================
// Tags Hooks
// ============================================

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TagCreate) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TagUpdate }) => updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

// ============================================
// Tag Categories Hooks
// ============================================

export function useTagCategories() {
  return useQuery({
    queryKey: ['tag-categories'],
    queryFn: fetchTagCategories,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTagCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TagCategoryCreate) => createTagCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
    },
  });
}

export function useUpdateTagCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TagCategoryUpdate }) =>
      updateTagCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
    },
  });
}

export function useDeleteTagCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTagCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tag-categories'] });
    },
  });
}

// ============================================
// Instructors Hooks
// ============================================

export function useInstructors() {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: fetchInstructors,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InstructorCreate) => createInstructor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InstructorUpdate }) =>
      updateInstructor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInstructor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
  });
}

// ============================================
// Notification Templates Hooks
// ============================================

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ['notification-templates'],
    queryFn: fetchNotificationTemplates,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: NotificationTemplateCreate) => createNotificationTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotificationTemplateUpdate }) =>
      updateNotificationTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotificationTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}

// ============================================
// FAQ Hooks
// ============================================

export function useFAQs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFAQs,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FAQCreate) => createFAQ(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FAQUpdate }) => updateFAQ(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
}
