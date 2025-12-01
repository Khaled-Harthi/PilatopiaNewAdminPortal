'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  useMemberProfile,
  useMemberMemberships,
  useMemberBookings,
  useVisitHistory,
  useCancelMemberBooking,
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
import { AddMembershipWizard } from '@/components/member/AddMembershipWizard';

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('MemberProfile');

  // State
  const [isAddMembershipOpen, setIsAddMembershipOpen] = useState(false);
  const [isBookClassOpen, setIsBookClassOpen] = useState(false);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [isExtendExpiryOpen, setIsExtendExpiryOpen] = useState(false);

  // Queries
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useMemberProfile(id);
  const { data: membershipsData, refetch: refetchMemberships } = useMemberMemberships(id);
  const { data: bookingsData, refetch: refetchBookings } = useMemberBookings(id, 1, 20);
  const { data: visitsData } = useVisitHistory(id, 1, 10);

  // Mutations
  const cancelBooking = useCancelMemberBooking();

  // Loading state
  if (isLoadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t('loading')}</p>
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

  const handleExtendExpiry = () => {
    setIsExtendExpiryOpen(true);
  };

  const handleExtendExpirySuccess = () => {
    toast.success('Expiry extended successfully');
    refetchMemberships();
  };

  const handleAddClass = () => {
    setIsAdjustBalanceOpen(true);
  };

  const handleAdjustBalanceSuccess = () => {
    toast.success('Balance adjusted successfully');
    refetchMemberships();
  };

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
            current={membershipsData?.current ?? null}
            onAddMembership={() => setIsAddMembershipOpen(true)}
            onExtendExpiry={membershipsData?.current ? handleExtendExpiry : undefined}
            onAddClass={membershipsData?.current ? handleAddClass : undefined}
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

          {/* Transactions */}
          <div className="border rounded-lg p-3 md:p-4">
            <h3 className="text-sm font-semibold mb-3">Transactions</h3>
            <TransactionsHistory
              current={membershipsData?.current ?? null}
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

      {/* Add Membership Wizard */}
      <AddMembershipWizard
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
      {membershipsData?.current && (
        <AdjustBalanceDialog
          membershipId={membershipsData.current.id}
          currentBalance={membershipsData.current.remaining_classes}
          open={isAdjustBalanceOpen}
          onOpenChange={setIsAdjustBalanceOpen}
          onSuccess={handleAdjustBalanceSuccess}
        />
      )}

      {/* Extend Expiry Dialog */}
      {membershipsData?.current && (
        <ExtendExpiryDialog
          membershipId={membershipsData.current.id}
          currentExpiryDate={membershipsData.current.expiry_date}
          open={isExtendExpiryOpen}
          onOpenChange={setIsExtendExpiryOpen}
          onSuccess={handleExtendExpirySuccess}
        />
      )}
    </DashboardLayout>
  );
}
