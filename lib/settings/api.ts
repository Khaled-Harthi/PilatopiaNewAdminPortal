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
  LoyaltyTier,
  LoyaltyTierCreate,
  LoyaltyTierUpdate,
  LoyaltyRedemption,
  LoyaltyRedemptionCreate,
  LoyaltyRedemptionUpdate,
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

// ============================================
// Loyalty Tiers API
// ============================================

export async function fetchLoyaltyTiers(): Promise<LoyaltyTier[]> {
  const response = await apiClient.get<{ data: LoyaltyTier[] }>('/admin/loyalty/tiers');
  return response.data.data;
}

export async function createLoyaltyTier(payload: LoyaltyTierCreate): Promise<LoyaltyTier> {
  const response = await apiClient.post<{ data: LoyaltyTier }>('/admin/loyalty/tiers', payload);
  return response.data.data;
}

export async function updateLoyaltyTier(
  id: string,
  payload: LoyaltyTierUpdate
): Promise<LoyaltyTier> {
  const response = await apiClient.put<{ data: LoyaltyTier }>(
    `/admin/loyalty/tiers/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteLoyaltyTier(id: string): Promise<void> {
  await apiClient.delete(`/admin/loyalty/tiers/${id}`);
}

// ============================================
// Loyalty Redemptions API (with multipart support)
// ============================================

export async function fetchLoyaltyRedemptions(): Promise<LoyaltyRedemption[]> {
  const response = await apiClient.get<{ data: LoyaltyRedemption[] }>(
    '/admin/loyalty/redemptions',
    {
      params: { lang: getLocale() },
    }
  );
  return response.data.data;
}

export async function createLoyaltyRedemption(
  payload: LoyaltyRedemptionCreate
): Promise<LoyaltyRedemption> {
  const formData = new FormData();

  formData.append('name_en', payload.name_en);
  formData.append('name_ar', payload.name_ar);
  if (payload.description_en) formData.append('description_en', payload.description_en);
  if (payload.description_ar) formData.append('description_ar', payload.description_ar);
  formData.append('redemption_type', payload.redemption_type);
  formData.append('points_cost', payload.points_cost.toString());
  if (payload.max_per_user !== undefined)
    formData.append('max_per_user', payload.max_per_user.toString());
  if (payload.total_available !== undefined)
    formData.append('total_available', payload.total_available.toString());
  if (payload.valid_from) formData.append('valid_from', payload.valid_from);
  if (payload.valid_until) formData.append('valid_until', payload.valid_until);
  if (payload.active !== undefined) formData.append('active', payload.active.toString());
  if (payload.photo) formData.append('photo', payload.photo);

  const response = await apiClient.post<{ data: LoyaltyRedemption }>(
    '/admin/loyalty/redemptions',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data;
}

export async function updateLoyaltyRedemption(
  id: string,
  payload: LoyaltyRedemptionUpdate
): Promise<LoyaltyRedemption> {
  const formData = new FormData();

  if (payload.name_en) formData.append('name_en', payload.name_en);
  if (payload.name_ar) formData.append('name_ar', payload.name_ar);
  if (payload.description_en !== undefined)
    formData.append('description_en', payload.description_en || '');
  if (payload.description_ar !== undefined)
    formData.append('description_ar', payload.description_ar || '');
  if (payload.redemption_type) formData.append('redemption_type', payload.redemption_type);
  if (payload.points_cost !== undefined)
    formData.append('points_cost', payload.points_cost.toString());
  if (payload.max_per_user !== undefined)
    formData.append('max_per_user', payload.max_per_user.toString());
  if (payload.total_available !== undefined)
    formData.append('total_available', payload.total_available.toString());
  if (payload.valid_from !== undefined) formData.append('valid_from', payload.valid_from || '');
  if (payload.valid_until !== undefined) formData.append('valid_until', payload.valid_until || '');
  if (payload.active !== undefined) formData.append('active', payload.active.toString());
  if (payload.photo) formData.append('photo', payload.photo);

  const response = await apiClient.put<{ data: LoyaltyRedemption }>(
    `/admin/loyalty/redemptions/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data;
}

export async function deleteLoyaltyRedemption(id: string): Promise<void> {
  await apiClient.delete(`/admin/loyalty/redemptions/${id}`);
}

// ============================================
// Banners API
// ============================================

import type {
  Banner,
  BannerWithTranslations,
  BannerCreate,
  BannerUpdate,
  CTAOption,
} from './types';

export async function fetchBanners(): Promise<Banner[]> {
  const response = await apiClient.get<{ success: boolean; data: Banner[] }>(
    '/admin/content/banners'
  );
  return response.data.data;
}

export async function fetchBannerCTAOptions(): Promise<CTAOption[]> {
  const response = await apiClient.get<{ success: boolean; data: { options: CTAOption[] } }>(
    '/admin/content/banners/cta-options'
  );
  return response.data.data.options;
}

export async function fetchBanner(id: number): Promise<BannerWithTranslations> {
  const response = await apiClient.get<{ success: boolean; data: BannerWithTranslations }>(
    `/admin/content/banners/${id}`,
    {
      params: { lang: 'all' },
    }
  );
  return response.data.data;
}

export async function createBanner(payload: BannerCreate): Promise<Banner> {
  const formData = new FormData();

  if (payload.image_file) {
    formData.append('image', payload.image_file);
  } else if (payload.image_url) {
    formData.append('image_url', payload.image_url);
  }

  formData.append('title', payload.title);
  if (payload.title_ar) formData.append('title_ar', payload.title_ar);
  if (payload.subtitle) formData.append('subtitle', payload.subtitle);
  if (payload.subtitle_ar) formData.append('subtitle_ar', payload.subtitle_ar);
  formData.append('content_html', payload.content_html);
  if (payload.content_html_ar) formData.append('content_html_ar', payload.content_html_ar);
  if (payload.cta_text) formData.append('cta_text', payload.cta_text);
  if (payload.cta_text_ar) formData.append('cta_text_ar', payload.cta_text_ar);
  if (payload.cta_link) formData.append('cta_link', payload.cta_link);
  formData.append('display_type', payload.display_type);
  if (payload.start_date) formData.append('start_date', payload.start_date);
  if (payload.end_date) formData.append('end_date', payload.end_date);

  const response = await apiClient.post<{ success: boolean; data: Banner; message: string }>(
    '/admin/content/banners',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data;
}

export async function updateBanner(id: number, payload: BannerUpdate): Promise<Banner> {
  const formData = new FormData();

  if (payload.image_file) {
    formData.append('image', payload.image_file);
  } else if (payload.image_url !== undefined) {
    formData.append('image_url', payload.image_url || '');
  }

  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.title_ar !== undefined) formData.append('title_ar', payload.title_ar || '');
  if (payload.subtitle !== undefined) formData.append('subtitle', payload.subtitle || '');
  if (payload.subtitle_ar !== undefined) formData.append('subtitle_ar', payload.subtitle_ar || '');
  if (payload.content_html !== undefined) formData.append('content_html', payload.content_html);
  if (payload.content_html_ar !== undefined)
    formData.append('content_html_ar', payload.content_html_ar || '');
  if (payload.cta_text !== undefined) formData.append('cta_text', payload.cta_text || '');
  if (payload.cta_text_ar !== undefined) formData.append('cta_text_ar', payload.cta_text_ar || '');
  if (payload.cta_link !== undefined) formData.append('cta_link', payload.cta_link || '');
  if (payload.display_type !== undefined) formData.append('display_type', payload.display_type);
  if (payload.start_date !== undefined) formData.append('start_date', payload.start_date || '');
  if (payload.end_date !== undefined) formData.append('end_date', payload.end_date || '');

  const response = await apiClient.put<{ success: boolean; data: Banner; message: string }>(
    `/admin/content/banners/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data.data;
}

export async function deleteBanner(id: number): Promise<void> {
  await apiClient.delete(`/admin/content/banners/${id}`);
}

export async function reorderBanners(orderedIds: number[]): Promise<void> {
  await apiClient.put('/admin/content/banners/reorder', { orderedIds });
}
