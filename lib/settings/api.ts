/**
 * API service for Settings Content Management
 */

import apiClient from '../axios';
import type {
  ClassType,
  ClassTypeCreate,
  ClassTypeUpdate,
  Room,
  RoomCreate,
  RoomUpdate,
  Tag,
  TagCreate,
  TagUpdate,
  TagCategory,
  TagCategoryCreate,
  TagCategoryUpdate,
  Instructor,
  InstructorCreate,
  InstructorUpdate,
  NotificationTemplate,
  NotificationTemplateCreate,
  NotificationTemplateUpdate,
  FAQ,
  FAQCreate,
  FAQUpdate,
} from './types';

// Helper to get current locale
const getLocale = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    const locale = path.split('/')[1];
    return locale === 'ar' ? 'ar' : 'en';
  }
  return 'en';
};

// ============================================
// Class Types API
// ============================================

export async function fetchClassTypes(): Promise<ClassType[]> {
  const response = await apiClient.get<{ data: ClassType[] }>('/admin/content/class-types', {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function fetchClassType(id: string): Promise<ClassType> {
  const response = await apiClient.get<{ data: ClassType }>(`/admin/content/class-types/${id}`, {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function createClassType(payload: ClassTypeCreate): Promise<ClassType> {
  const response = await apiClient.post<{ data: ClassType }>('/admin/content/class-types', payload);
  return response.data.data;
}

export async function updateClassType(id: string, payload: ClassTypeUpdate): Promise<ClassType> {
  const response = await apiClient.put<{ data: ClassType }>(
    `/admin/content/class-types/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteClassType(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/class-types/${id}`);
}

// ============================================
// Rooms API
// ============================================

export async function fetchRooms(): Promise<Room[]> {
  const response = await apiClient.get<{ data: Room[] }>('/admin/content/rooms', {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function fetchRoom(id: string): Promise<Room> {
  const response = await apiClient.get<{ data: Room }>(`/admin/content/rooms/${id}`, {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function createRoom(payload: RoomCreate): Promise<Room> {
  const response = await apiClient.post<{ data: Room }>('/admin/content/rooms', payload);
  return response.data.data;
}

export async function updateRoom(id: string, payload: RoomUpdate): Promise<Room> {
  const response = await apiClient.put<{ data: Room }>(`/admin/content/rooms/${id}`, payload);
  return response.data.data;
}

export async function deleteRoom(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/rooms/${id}`);
}

// ============================================
// Tags API
// ============================================

export async function fetchTags(): Promise<Tag[]> {
  const response = await apiClient.get<{ data: Tag[] }>('/admin/content/tags', {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function fetchTag(id: string): Promise<Tag> {
  const response = await apiClient.get<{ data: Tag }>(`/admin/content/tags/${id}`, {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function createTag(payload: TagCreate): Promise<Tag> {
  const response = await apiClient.post<{ data: Tag }>('/admin/content/tags', payload);
  return response.data.data;
}

export async function updateTag(id: string, payload: TagUpdate): Promise<Tag> {
  const response = await apiClient.put<{ data: Tag }>(`/admin/content/tags/${id}`, payload);
  return response.data.data;
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/tags/${id}`);
}

// ============================================
// Tag Categories API
// ============================================

export async function fetchTagCategories(): Promise<TagCategory[]> {
  const response = await apiClient.get<{ data: TagCategory[] }>('/admin/content/tag-categories', {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function fetchTagCategory(id: string): Promise<TagCategory> {
  const response = await apiClient.get<{ data: TagCategory }>(
    `/admin/content/tag-categories/${id}`,
    {
      params: { lang: getLocale() },
    }
  );
  return response.data.data;
}

export async function createTagCategory(payload: TagCategoryCreate): Promise<TagCategory> {
  const response = await apiClient.post<{ data: TagCategory }>(
    '/admin/content/tag-categories',
    payload
  );
  return response.data.data;
}

export async function updateTagCategory(
  id: string,
  payload: TagCategoryUpdate
): Promise<TagCategory> {
  const response = await apiClient.put<{ data: TagCategory }>(
    `/admin/content/tag-categories/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteTagCategory(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/tag-categories/${id}`);
}

// ============================================
// Instructors API
// ============================================

export async function fetchInstructors(): Promise<Instructor[]> {
  const response = await apiClient.get<{ data: Instructor[] }>('/admin/content/instructors', {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function fetchInstructor(id: string): Promise<Instructor> {
  const response = await apiClient.get<{ data: Instructor }>(`/admin/content/instructors/${id}`, {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function createInstructor(payload: InstructorCreate): Promise<Instructor> {
  const response = await apiClient.post<{ data: Instructor }>(
    '/admin/content/instructors',
    payload
  );
  return response.data.data;
}

export async function updateInstructor(
  id: string,
  payload: InstructorUpdate
): Promise<Instructor> {
  const response = await apiClient.put<{ data: Instructor }>(
    `/admin/content/instructors/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteInstructor(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/instructors/${id}`);
}

// ============================================
// Notification Templates API
// ============================================

export async function fetchNotificationTemplates(): Promise<NotificationTemplate[]> {
  const response = await apiClient.get<{ data: NotificationTemplate[] }>(
    '/admin/content/notification-templates',
    {
      params: { lang: getLocale() },
    }
  );
  return response.data.data;
}

export async function fetchNotificationTemplate(id: string): Promise<NotificationTemplate> {
  const response = await apiClient.get<{ data: NotificationTemplate }>(
    `/admin/content/notification-templates/${id}`,
    {
      params: { lang: getLocale() },
    }
  );
  return response.data.data;
}

export async function createNotificationTemplate(
  payload: NotificationTemplateCreate
): Promise<NotificationTemplate> {
  const response = await apiClient.post<{ data: NotificationTemplate }>(
    '/admin/content/notification-templates',
    payload
  );
  return response.data.data;
}

export async function updateNotificationTemplate(
  id: string,
  payload: NotificationTemplateUpdate
): Promise<NotificationTemplate> {
  const response = await apiClient.put<{ data: NotificationTemplate }>(
    `/admin/content/notification-templates/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteNotificationTemplate(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/notification-templates/${id}`);
}

// ============================================
// FAQ API
// ============================================

export async function fetchFAQs(): Promise<FAQ[]> {
  const response = await apiClient.get<{ data: FAQ[] }>('/admin/content/faq', {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function fetchFAQ(id: string): Promise<FAQ> {
  const response = await apiClient.get<{ data: FAQ }>(`/admin/content/faq/${id}`, {
    params: { lang: getLocale() },
  });
  return response.data.data;
}

export async function createFAQ(payload: FAQCreate): Promise<FAQ> {
  const response = await apiClient.post<{ data: FAQ }>('/admin/content/faq', payload);
  return response.data.data;
}

export async function updateFAQ(id: string, payload: FAQUpdate): Promise<FAQ> {
  const response = await apiClient.put<{ data: FAQ }>(`/admin/content/faq/${id}`, payload);
  return response.data.data;
}

export async function deleteFAQ(id: string): Promise<void> {
  await apiClient.delete(`/admin/content/faq/${id}`);
}
