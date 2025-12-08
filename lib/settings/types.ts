// ============================================
// Content Module Types
// ============================================

// Class Types
export interface ClassType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassTypeCreate {
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  is_active?: boolean;
}

export interface ClassTypeUpdate extends Partial<ClassTypeCreate> {}

// Rooms
export interface Room {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomCreate {
  name_en: string;
  name_ar: string;
  is_active?: boolean;
}

export interface RoomUpdate extends Partial<RoomCreate> {}

// Tags
export interface Tag {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  category_id: string | null;
  category: TagCategory | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagCreate {
  name_en: string;
  name_ar: string;
  icon?: string | null;
  color?: string | null;
  category_id?: string | null;
  is_active?: boolean;
}

export interface TagUpdate extends Partial<TagCreate> {}

// Tag Categories
export interface TagCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TagCategoryCreate {
  name_en: string;
  name_ar: string;
  is_active?: boolean;
}

export interface TagCategoryUpdate extends Partial<TagCategoryCreate> {}

// Instructors
export interface Instructor {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstructorCreate {
  name_en: string;
  name_ar: string;
  bio_en?: string | null;
  bio_ar?: string | null;
  photo_url?: string | null;
  is_active?: boolean;
}

export interface InstructorUpdate extends Partial<InstructorCreate> {}

// Notification Templates
export interface NotificationTemplate {
  id: string;
  key: string;
  title: string;
  body: string;
  channel: 'push' | 'whatsapp' | 'sms' | 'email';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplateCreate {
  key: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  channel: 'push' | 'whatsapp' | 'sms' | 'email';
  is_active?: boolean;
}

export interface NotificationTemplateUpdate
  extends Partial<Omit<NotificationTemplateCreate, 'key'>> {}

// FAQ
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FAQCreate {
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
}

export interface FAQUpdate extends Partial<FAQCreate> {}

// ============================================
// Configuration Module Types
// ============================================

// Membership Plans
export interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  banner_url: string | null;
  classes_count: number;
  validity_days: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MembershipPlanCreate {
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  banner_url?: string | null;
  classes_count: number;
  validity_days: number;
  price: number;
  is_active?: boolean;
}

export interface MembershipPlanUpdate extends Partial<MembershipPlanCreate> {}

// Loyalty Tiers (NOT translatable - uses tier_name directly)
export interface LoyaltyTier {
  id: string;
  tier_name: string;
  min_classes: number;
  benefits: Record<string, unknown>;
  tier_color: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTierCreate {
  tier_name: string;
  min_classes: number;
  benefits?: Record<string, unknown>;
  tier_color?: string | null;
  sort_order?: number;
  active?: boolean;
}

export interface LoyaltyTierUpdate extends Partial<LoyaltyTierCreate> {}

// Loyalty Badges
export interface LoyaltyBadge {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyBadgeCreate {
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  icon_url?: string | null;
  is_active?: boolean;
}

export interface LoyaltyBadgeUpdate extends Partial<LoyaltyBadgeCreate> {}

// Loyalty Redemptions (translatable via name_en/ar, description_en/ar)
export type RedemptionType = 'discount_code' | 'free_class' | 'merchandise';

export interface LoyaltyRedemption {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  redemption_type: RedemptionType;
  points_cost: number;
  max_per_user: number;
  total_available: number;
  total_redeemed: number;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRedemptionCreate {
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  photo?: File | null;
  redemption_type: RedemptionType;
  points_cost: number;
  max_per_user?: number;
  total_available?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  active?: boolean;
}

export interface LoyaltyRedemptionUpdate
  extends Partial<LoyaltyRedemptionCreate> {}

// Loyalty Rules
export interface LoyaltyRule {
  id: string;
  action_type: string;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRuleCreate {
  action_type: string;
  points: number;
  is_active?: boolean;
}

export interface LoyaltyRuleUpdate extends Partial<LoyaltyRuleCreate> {}

// ============================================
// Admin Users Types
// ============================================

export type AdminRole = 'super_admin' | 'staff' | 'instructor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserCreate {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
  is_active?: boolean;
}

export interface AdminUserUpdate extends Partial<Omit<AdminUserCreate, 'email'>> {}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// Banners Types
// ============================================

export type BannerDisplayType = 'modal' | 'screen';

export type BannerStatus = 'active' | 'scheduled' | 'expired';

export interface Banner {
  id: number;
  image_url: string;
  title: string;
  subtitle: string | null;
  content_html: string;
  cta_text: string | null;
  display_type: BannerDisplayType;
  cta_link: string | null;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BannerWithTranslations extends Banner {
  title_ar?: string;
  subtitle_ar?: string | null;
  content_html_ar?: string;
  cta_text_ar?: string | null;
}

export interface BannerCreate {
  image_url: string;
  title: string;
  title_ar?: string;
  subtitle?: string | null;
  subtitle_ar?: string | null;
  content_html: string;
  content_html_ar?: string;
  cta_text?: string | null;
  cta_text_ar?: string | null;
  cta_link?: string | null;
  display_type: BannerDisplayType;
  start_date?: string | null;
  end_date?: string | null;
}

export interface BannerUpdate extends Partial<BannerCreate> {}

export interface CTAOption {
  label: string;
  value: string;
}

export interface CTAOptionsResponse {
  success: boolean;
  data: {
    options: CTAOption[];
  };
}
