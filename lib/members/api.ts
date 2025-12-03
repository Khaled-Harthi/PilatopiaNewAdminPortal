/**
 * API service for Members Management
 */

import apiClient from '../axios';
import { normalizePhoneForSearch } from './types';
import type {
  Member,
  MemberProfile,
  MembersResponse,
  MemberStatsResponse,
  MemberActivityResponse,
  MembershipsResponse,
  BookingsResponse,
  VisitHistoryResponse,
  MemberQueryParams,
  CreateMemberPayload,
  UpdateMemberPayload,
  CreateMemberResponse,
} from './types';

// ============================================
// Members List API
// ============================================

/**
 * Fetches paginated list of members with optional filters
 */
export async function fetchMembers(params: MemberQueryParams = {}): Promise<MembersResponse> {
  const response = await apiClient.get<MembersResponse>('/admin/members', {
    params: {
      segment: params.segment,
      search: params.search,
      tier: params.tier?.join(','),
      sort: params.sort,
      order: params.order,
      page: params.page || 1,
      limit: params.limit || 20,
    },
  });
  return response.data;
}

/**
 * Fetches aggregate statistics for member segments
 */
export async function fetchMemberStats(): Promise<MemberStatsResponse> {
  const response = await apiClient.get<MemberStatsResponse>('/admin/members/stats');
  return response.data;
}

// ============================================
// Member Profile API
// ============================================

/**
 * Fetches detailed member profile by ID or phone number
 */
export async function fetchMemberProfile(memberId: string): Promise<MemberProfile> {
  const response = await apiClient.get<MemberProfile>(`/admin/members/${memberId}`);
  return response.data;
}

/**
 * Looks up a member by phone number and returns their ID
 * Normalizes phone numbers to handle various Saudi formats (05xx, 5xx, 966xx, +966xx)
 */
export async function lookupMemberByPhone(phoneNumber: string): Promise<string | null> {
  try {
    // Normalize the phone number to the format expected by the API
    const normalizedPhone = normalizePhoneForSearch(phoneNumber);

    const response = await apiClient.get<{ members: { id: string }[] }>('/admin/members', {
      params: { search: normalizedPhone, limit: 1, page: 1 },
    });
    const members = response.data.members || [];
    // Return first exact match
    if (members.length > 0) {
      return members[0].id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetches member activity summary (visit patterns)
 */
export async function fetchMemberActivity(memberId: string): Promise<MemberActivityResponse> {
  const response = await apiClient.get<MemberActivityResponse>(
    `/admin/members/${memberId}/activity`
  );
  return response.data;
}

// ============================================
// Member Memberships API
// ============================================

// Raw membership response from API
interface RawMembership {
  id: number;
  planName: string;
  planId: number;
  originalBalance: number;
  adjustments: number;
  usedBalance: number;
  remainingBalance: number;
  startsAt: string;
  expiresAt: string;
  status: string;
  createdAt: string;
}

/**
 * Fetches member's memberships
 */
export async function fetchMemberMemberships(memberId: string): Promise<MembershipsResponse> {
  const response = await apiClient.get<{
    memberships: RawMembership[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>(`/admin/members/${memberId}/memberships`);

  const rawMemberships = response.data.memberships || [];

  if (rawMemberships.length === 0) {
    return {
      success: true,
      current: [],
      upcoming: [],
      past: [],
    };
  }

  // Determine membership state based on API status, dates, and balance
  const getMembershipState = (m: RawMembership): 'active' | 'upcoming' | 'expiring' | 'expired' => {
    const now = new Date();
    const start = new Date(m.startsAt);
    const expiry = new Date(m.expiresAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (start > now) return 'upcoming';
    if (m.status === 'expired' || expiry < now) return 'expired';
    if (m.remainingBalance === 0) return 'expired'; // No classes left
    if (daysUntilExpiry <= 7) return 'expiring';
    return 'active';
  };

  // Transform to Membership format
  const memberships = rawMemberships.map((m) => ({
    id: String(m.id),
    plan_name: m.planName,
    plan_id: m.planId,
    start_date: m.startsAt,
    expiry_date: m.expiresAt,
    class_count: m.originalBalance + m.adjustments,
    used_classes: m.usedBalance,
    remaining_classes: m.remainingBalance,
    state: getMembershipState(m),
    created_at: m.createdAt,
  }));

  // Sort by created_at descending
  memberships.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Find all current (active or expiring) memberships
  const current = memberships.filter((m) => m.state === 'active' || m.state === 'expiring');

  // Upcoming memberships
  const upcoming = memberships.filter((m) => m.state === 'upcoming');

  // Past memberships (expired only)
  const past = memberships.filter((m) => m.state === 'expired');

  return {
    success: true,
    current,
    upcoming,
    past,
  };
}

// ============================================
// Member Bookings API
// ============================================

// Raw API booking response type
interface RawBooking {
  booking_id: number;
  class_id: number;
  user_id: number;
  booked_at: string;
  cancelled_at: string | null;
  class_name: string;
  class_room_name: string | null;
  schedule_time: string;
  duration_minutes: number;
  instructor_name: string;
  attendance_id: number | null;
  check_in_time: string | null;
  status: string;
  total_count: string;
}

/**
 * Fetches member's bookings and transforms field names
 */
export async function fetchMemberBookings(
  memberId: string,
  page: number = 1,
  limit: number = 10
): Promise<BookingsResponse> {
  const response = await apiClient.get<{
    success: boolean;
    bookings: RawBooking[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }>(`/admin/members/${memberId}/bookings`, {
    params: { page, limit },
  });

  // Map API status to AttendanceStatus type
  const mapStatus = (status: string): 'upcoming' | 'attended' | 'no_show' | 'cancelled' => {
    switch (status) {
      case 'upcoming': return 'upcoming';
      case 'attended': return 'attended';
      case 'no-show': return 'no_show';
      case 'cancelled': return 'cancelled';
      default: return 'upcoming';
    }
  };

  // Transform field names to match frontend types
  const transformedBookings = response.data.bookings.map((booking) => ({
    id: String(booking.booking_id),
    class_id: booking.class_id,
    class_name: booking.class_name,
    class_type: '', // Not provided by API
    schedule_time: booking.schedule_time,
    duration_minutes: booking.duration_minutes,
    instructor_name: booking.instructor_name,
    instructor_id: 0, // Not provided by API
    class_room_name: booking.class_room_name || '',
    booked_seats: 1,
    capacity: 0,
    attendance_status: mapStatus(booking.status),
    check_in_time: booking.check_in_time,
  }));

  return {
    success: response.data.success,
    bookings: transformedBookings,
    pagination: response.data.pagination,
  };
}

/**
 * Creates a booking for a member
 */
export async function createMemberBooking(
  memberId: string,
  classId: number
): Promise<{ success: boolean; booking_id: number }> {
  const response = await apiClient.post(`/admin/members/${memberId}/bookings`, {
    classId,
  });
  return response.data;
}

/**
 * Cancels a member's booking
 */
export async function cancelMemberBooking(
  memberId: string,
  bookingId: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete(
    `/admin/members/${memberId}/bookings/${bookingId}`
  );
  return response.data;
}

// ============================================
// Visit History API
// ============================================

/**
 * Fetches member's visit history by deriving from bookings
 * (Workaround: /visits endpoint not implemented in backend)
 */
export async function fetchVisitHistory(
  memberId: string,
  page: number = 1,
  limit: number = 10
): Promise<VisitHistoryResponse> {
  // Fetch all bookings and filter for past classes (attended/no-show)
  const bookingsResponse = await fetchMemberBookings(memberId, 1, 100);

  // Filter for past bookings only (attended or no_show)
  const pastBookings = bookingsResponse.bookings.filter(
    (b) => b.attendance_status === 'attended' || b.attendance_status === 'no_show'
  );

  // Sort by date descending
  pastBookings.sort(
    (a, b) => new Date(b.schedule_time).getTime() - new Date(a.schedule_time).getTime()
  );

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginatedVisits = pastBookings.slice(startIndex, startIndex + limit);

  // Transform to VisitRecord format
  const visits = paginatedVisits.map((booking) => ({
    id: booking.id,
    class_id: booking.class_id,
    class_name: booking.class_name,
    class_type: booking.class_type,
    schedule_time: booking.schedule_time,
    instructor_name: booking.instructor_name,
    class_room_name: booking.class_room_name,
    attendance_status: booking.attendance_status as 'attended' | 'no_show',
    check_in_time: booking.check_in_time,
    notes: null,
  }));

  return {
    success: true,
    visits,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(pastBookings.length / limit),
      total_items: pastBookings.length,
      items_per_page: limit,
    },
  };
}

// ============================================
// Member CRUD API
// ============================================

/**
 * Creates a new member
 */
export async function createMember(payload: CreateMemberPayload): Promise<CreateMemberResponse> {
  const response = await apiClient.post<CreateMemberResponse>('/admin/members', payload);
  return response.data;
}

/**
 * Updates a member's profile
 */
export async function updateMember(
  memberId: string,
  payload: UpdateMemberPayload
): Promise<{ success: boolean }> {
  const response = await apiClient.put(`/admin/members/${memberId}`, payload);
  return response.data;
}

/**
 * Deletes a member
 */
export async function deleteMember(memberId: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete(`/admin/members/${memberId}`);
  return response.data;
}

// ============================================
// Membership Purchase API
// ============================================

/**
 * Purchases a membership for a member
 */
export async function purchaseMembership(
  memberId: string,
  payload: {
    planId: number;
    paymentMethod: string;
    startDate: string;
    promoCode?: string;
    notes?: string;
  }
): Promise<{ success: boolean; transaction_id: string }> {
  const response = await apiClient.post(`/admin/members/${memberId}/purchase`, payload);
  return response.data;
}

/**
 * Renews/extends a membership
 */
export async function renewMembership(
  memberId: string,
  membershipId: string,
  payload: {
    planId: number;
    paymentMethod: string;
    startDate?: string;
  }
): Promise<{ success: boolean; transaction_id: string }> {
  const response = await apiClient.post(
    `/admin/members/${memberId}/memberships/${membershipId}/renew`,
    payload
  );
  return response.data;
}
