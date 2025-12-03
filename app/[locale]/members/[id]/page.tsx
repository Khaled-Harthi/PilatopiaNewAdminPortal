'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  useMemberProfile,
  useMemberMemberships,
  useMemberBookings,
  useVisitHistory,
  useCancelMemberBooking,
  useLookupMemberByPhone,
} from '@/lib/members/hooks';
import {
  MemberDetailHeader,
  MemberSidebar,
  UpcomingClassesList,
  PastClassesList,
  TransactionsHistory,
} from '@/components/members';
import { MembershipStatusCard } from '@/components/members/membership-status-card';
import { BookClassDialog } from '@/components/members/book-class-dialog';
import { AdjustBalanceDialog } from '@/components/members/adjust-balance-dialog';
import { ExtendExpiryDialog } from '@/components/members/extend-expiry-dialog';
import { AddMembershipSheet } from '@/components/member/AddMembershipSheet';
import type { Membership } from '@/lib/members/types';
import { isPhoneNumber } from '@/lib/members/types';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = use(params);
  const t = useTranslations('MemberProfile');
  const router = useRouter();

  // Decode URL-encoded phone numbers (e.g., %2B for +)
  const decodedId = decodeURIComponent(rawId);

  // Check if the ID is a phone number
  const isPhone = isPhoneNumber(decodedId);

  // Lookup member by phone if needed
  const { data: lookedUpMemberId, isLoading: isLookingUp } = useLookupMemberByPhone(
    isPhone ? decodedId : null,
    isPhone
  );

  // Redirect to the actual member ID when phone lookup completes
  useEffect(() => {
    if (isPhone && lookedUpMemberId) {
      router.replace(`/members/${lookedUpMemberId}`);
    }
  }, [isPhone, lookedUpMemberId, router]);

  // Use the looked up ID or the original ID
  const id = isPhone ? (lookedUpMemberId || '') : decodedId;

  // State
  const [isAddMembershipOpen, setIsAddMembershipOpen] = useState(false);
  const [isBookClassOpen, setIsBookClassOpen] = useState(false);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [isExtendExpiryOpen, setIsExtendExpiryOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);

  // Queries
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useMemberProfile(id);
  const { data: membershipsData, refetch: refetchMemberships } = useMemberMemberships(id);
  const { data: bookingsData, refetch: refetchBookings } = useMemberBookings(id, 1, 20);
  const { data: visitsData } = useVisitHistory(id, 1, 10);

  // Mutations
  const cancelBooking = useCancelMemberBooking();

  // Loading state (including phone lookup)
  if (isLoadingProfile || isLookingUp) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Phone lookup failed - no member found with that phone
  if (isPhone && !lookedUpMemberId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('notFound')} (Phone: {decodedId})
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Not found
  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('notFound')}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Handlers
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking.mutateAsync({ memberId: id, bookingId });
      toast.success('Booking cancelled successfully');
      refetchBookings();
      refetchMemberships();
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleAddMembershipSuccess = () => {
    refetchProfile();
    refetchMemberships();
  };

  const handleBookClass = () => {
    setIsBookClassOpen(true);
  };

  const handleBookClassSuccess = () => {
    toast.success('Class booked successfully');
    refetchBookings();
  };

  const handleExtendExpiry = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsExtendExpiryOpen(true);
  };

  const handleExtendExpirySuccess = () => {
    toast.success('Expiry extended successfully');
    refetchMemberships();
    setSelectedMembership(null);
  };

  const handleAddClass = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsAdjustBalanceOpen(true);
  };

  const handleAdjustBalanceSuccess = () => {
    toast.success('Balance adjusted successfully');
    refetchMemberships();
    setSelectedMembership(null);
  };

  const currentMemberships = membershipsData?.current ?? [];
  const upcomingMemberships = membershipsData?.upcoming ?? [];
  const hasActiveMembership = currentMemberships.length > 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <MemberDetailHeader memberId={id} />

      {/* Main Content: Sidebar + Right Content */}
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar - Centered content */}
        <MemberSidebar member={profile} />

        {/* Right Content */}
        <main className="flex-1 px-2 py-2 md:px-6 md:py-4 space-y-4 md:space-y-4">
          {/* Membership Status Card */}
          <MembershipStatusCard
            current={currentMemberships}
            upcoming={upcomingMemberships}
            onAddMembership={() => setIsAddMembershipOpen(true)}
            onExtendExpiry={hasActiveMembership ? handleExtendExpiry : undefined}
            onAddClass={hasActiveMembership ? handleAddClass : undefined}
          />

          {/* Upcoming Classes */}
          <div className="border rounded-lg p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold">Upcoming Classes</h3>
              <Button size="sm" className="w-full sm:w-auto" onClick={handleBookClass}>
                Book Class
              </Button>
            </div>
            <UpcomingClassesList
              bookings={bookingsData?.bookings ?? []}
              onCancel={handleCancelBooking}
            />
          </div>

          {/* Memberships (formerly Transactions) */}
          <div className="border rounded-lg p-3 md:p-4">
            <h3 className="text-sm font-semibold mb-3">Memberships</h3>
            <TransactionsHistory
              current={currentMemberships}
              past={membershipsData?.past ?? []}
            />
          </div>

          {/* Past Classes */}
          <div className="border rounded-lg p-3 md:p-4">
            <h3 className="text-sm font-semibold mb-3">Past Classes</h3>
            <PastClassesList
              visits={visitsData?.visits ?? []}
              totalVisits={visitsData?.pagination?.total_items ?? 0}
            />
          </div>
        </main>
      </div>

      {/* Add Membership Sheet */}
      <AddMembershipSheet
        open={isAddMembershipOpen}
        onOpenChange={setIsAddMembershipOpen}
        memberId={id}
        onSuccess={handleAddMembershipSuccess}
      />

      {/* Book Class Dialog */}
      <BookClassDialog
        memberId={id}
        open={isBookClassOpen}
        onOpenChange={setIsBookClassOpen}
        onSuccess={handleBookClassSuccess}
      />

      {/* Adjust Balance Dialog */}
      {selectedMembership && (
        <AdjustBalanceDialog
          membershipId={selectedMembership.id}
          currentBalance={selectedMembership.remaining_classes}
          open={isAdjustBalanceOpen}
          onOpenChange={(open) => {
            setIsAdjustBalanceOpen(open);
            if (!open) setSelectedMembership(null);
          }}
          onSuccess={handleAdjustBalanceSuccess}
        />
      )}

      {/* Extend Expiry Dialog */}
      {selectedMembership && (
        <ExtendExpiryDialog
          membershipId={selectedMembership.id}
          currentExpiryDate={selectedMembership.expiry_date}
          open={isExtendExpiryOpen}
          onOpenChange={(open) => {
            setIsExtendExpiryOpen(open);
            if (!open) setSelectedMembership(null);
          }}
          onSuccess={handleExtendExpirySuccess}
        />
      )}
    </DashboardLayout>
  );
}
