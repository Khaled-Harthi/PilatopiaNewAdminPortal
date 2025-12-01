/**
 * Type definitions for Members Management
 */

// ============================================
// Loyalty Program Types
// ============================================

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';

export interface MemberLoyalty {
  tier: LoyaltyTier;
  tier_color: string; // hex color from backend
  lifetime_classes: number;
  total_points: number;
  available_points: number;
  next_tier: LoyaltyTier | null;
  classes_to_next_tier: number;
  progress_percentage: number;
}

// ============================================
// Member Types
// ============================================

export type MembershipStatus = 'active' | 'expired' | 'expiring' | 'no_membership';

export interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  birthDate: string | null;
  joiningDate: string;
  membershipStatus: MembershipStatus;
  points?: number;
  loyalty?: MemberLoyalty;
  // Summary info for list view
  currentMembership?: {
    planName: string;
    remainingClasses: number;
    totalClasses: number;
    expiryDate: string;
  } | null;
  lastVisit: string | null;
  totalSpent?: number;
}

export interface MemberProfile extends Member {
  // Additional profile details
  notes?: string | null;
  // Activity stats
  visitsThisMonth?: number;
  visitsLastMonth?: number;
  totalVisits?: number;
  avgVisitsPerWeek?: number;
  // Engagement patterns
  favoriteClass?: string | null;
  favoriteInstructor?: string | null;
  preferredTime?: string | null;
  currentStreakWeeks?: number;
}

// ============================================
// Membership Types
// ============================================

export type MembershipState = 'active' | 'upcoming' | 'expiring' | 'expired';

export interface Membership {
  id: string;
  plan_name: string;
  plan_id: number;
  start_date: string;
  expiry_date: string;
  class_count: number;
  used_classes: number;
  remaining_classes: number;
  state: MembershipState;
  created_at: string;
}

export interface MembershipsResponse {
  success: boolean;
  current: Membership[];
  upcoming: Membership[];
  past: Membership[];
}

// ============================================
// Booking Types
// ============================================

export type AttendanceStatus = 'upcoming' | 'attended' | 'no_show' | 'cancelled';

export interface MemberBooking {
  id: string;
  class_id: number;
  class_name: string;
  class_type: string;
  schedule_time: string;
  duration_minutes: number;
  instructor_name: string;
  instructor_id: number;
  class_room_name: string;
  booked_seats: number;
  capacity: number;
  attendance_status: AttendanceStatus;
  check_in_time: string | null;
}

export interface BookingsResponse {
  success: boolean;
  bookings: MemberBooking[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// ============================================
// Stats & Segments Types
// ============================================

export type MemberSegment = 'all' | 'expiring' | 'inactive' | 'new' | 'no_membership';

export interface MemberStats {
  total: number;
  active_memberships: number;
  expiring_soon: number; // within 7 days
  inactive: number; // no visit 14+ days
  new_this_month: number;
  no_membership: number;
  // Tier breakdown
  tier_counts: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    vip: number;
  };
}

export interface MemberStatsResponse {
  success: boolean;
  stats: MemberStats;
}

// ============================================
// Activity Types
// ============================================

export interface MemberActivity {
  visits_this_month: number;
  visits_last_month: number;
  total_visits: number;
  avg_visits_per_week: number;
  favorite_class: string | null;
  favorite_instructor: string | null;
  preferred_time: string | null;
  current_streak_weeks: number;
  last_visit: string | null;
}

export interface MemberActivityResponse {
  success: boolean;
  activity: MemberActivity;
}

// ============================================
// List & Query Types
// ============================================

export type MemberSortField = 'recent' | 'name' | 'expiry' | 'tier' | 'spent';
export type SortOrder = 'asc' | 'desc';

export interface MemberQueryParams {
  segment?: MemberSegment;
  search?: string;
  tier?: LoyaltyTier[];
  sort?: MemberSortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface MembersResponse {
  success: boolean;
  members: Member[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// ============================================
// Create/Update Types
// ============================================

export interface CreateMemberPayload {
  name: string;
  phoneNumber: string;
  birthDate?: string;
}

export interface UpdateMemberPayload {
  name?: string;
  phoneNumber?: string;
  birthDate?: string;
  notes?: string;
}

export interface CreateMemberResponse {
  success: boolean;
  member: Member;
}

// ============================================
// Visit History Types
// ============================================

export interface VisitRecord {
  id: string;
  class_id: number;
  class_name: string;
  class_type: string;
  schedule_time: string;
  instructor_name: string;
  class_room_name: string;
  attendance_status: 'attended' | 'no_show';
  check_in_time: string | null;
  notes: string | null;
}

export interface VisitHistoryResponse {
  success: boolean;
  visits: VisitRecord[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// ============================================
// Utility Types
// ============================================

export interface LoyaltyTierConfig {
  tier: LoyaltyTier;
  label: string;
  min_classes: number;
  max_classes: number | null;
  color: string;
}

export const LOYALTY_TIERS: LoyaltyTierConfig[] = [
  { tier: 'bronze', label: 'Bronze', min_classes: 0, max_classes: 25, color: 'text-amber-700' },
  { tier: 'silver', label: 'Silver', min_classes: 26, max_classes: 75, color: 'text-slate-400' },
  { tier: 'gold', label: 'Gold', min_classes: 76, max_classes: 150, color: 'text-yellow-500' },
  { tier: 'platinum', label: 'Platinum', min_classes: 151, max_classes: 300, color: 'text-purple-500' },
  { tier: 'vip', label: 'VIP', min_classes: 301, max_classes: null, color: 'text-amber-400' },
];

export function getTierConfig(tier: LoyaltyTier): LoyaltyTierConfig {
  return LOYALTY_TIERS.find(t => t.tier === tier) || LOYALTY_TIERS[0];
}

export function formatPhoneForWhatsApp(phone: string): string {
  // Remove spaces, dashes, and other non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // If starts with 0, replace with Saudi country code
  if (cleaned.startsWith('0')) {
    return '966' + cleaned.slice(1);
  }
  // If doesn't have country code, assume Saudi
  if (!cleaned.startsWith('+') && !cleaned.startsWith('966')) {
    return '966' + cleaned;
  }
  // Remove + if present
  return cleaned.replace('+', '');
}

export function getWhatsAppUrl(phone: string): string {
  return `https://wa.me/${formatPhoneForWhatsApp(phone)}`;
}
