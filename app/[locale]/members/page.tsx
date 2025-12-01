'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale } from 'next-intl';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  MemberListItem,
  AddMemberWizard,
} from '@/components/members';
import { useMembers } from '@/lib/members/hooks';
import { AddMembershipSheet } from '@/components/member/AddMembershipSheet';

export default function MembersPage() {
  const router = useRouter();
  const locale = useLocale();
  const isAr = locale === 'ar';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddMembershipOpen, setIsAddMembershipOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Queries
  const { data: membersData, isLoading: isLoadingMembers, refetch: refetchMembers } = useMembers({
    page: currentPage,
    limit: 20,
    search: searchQuery || undefined,
  });

  // Handlers
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleClear = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleAddMemberSuccess = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsAddMembershipOpen(true);
    refetchMembers();
  };

  const handleAddMembershipSuccess = () => {
    refetchMembers();
    setSelectedMemberId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {isAr ? 'الأعضاء' : 'Members'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAr ? 'إدارة أعضاء الاستوديو' : 'Manage studio members'}
            </p>
          </div>
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {isAr ? 'إضافة عضو' : 'Add Member'}
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAr ? 'البحث بالاسم أو رقم الجوال...' : 'Search by name or phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>
            {isAr ? 'بحث' : 'Search'}
          </Button>
          {searchQuery && (
            <Button variant="ghost" onClick={handleClear}>
              {isAr ? 'مسح' : 'Clear'}
            </Button>
          )}
        </div>

        {/* Members List */}
        <Card className="overflow-hidden">
          {/* List Header */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
            <div className="flex-1">{isAr ? 'العضو' : 'Member'}</div>
            <div className="hidden sm:block w-32 text-right">{isAr ? 'العضوية' : 'Membership'}</div>
            <div className="hidden md:block w-28 text-right">{isAr ? 'آخر زيارة' : 'Last Visit'}</div>
            <div className="w-4" />
          </div>

          {/* List Content */}
          {isLoadingMembers ? (
            <div className="divide-y">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : membersData?.members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {isAr ? 'لا يوجد أعضاء' : 'No members found'}
              </p>
              {searchQuery && (
                <Button variant="link" onClick={handleClear}>
                  {isAr ? 'مسح البحث' : 'Clear search'}
                </Button>
              )}
            </div>
          ) : (
            <div>
              {membersData?.members.map((member) => (
                <MemberListItem
                  key={member.id}
                  member={member}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {membersData && membersData.pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {isAr
                ? `الصفحة ${membersData.pagination.current_page} من ${membersData.pagination.total_pages} (${membersData.pagination.total_items} عضو)`
                : `Page ${membersData.pagination.current_page} of ${membersData.pagination.total_pages} (${membersData.pagination.total_items} members)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {isAr ? 'السابق' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(membersData.pagination.total_pages, p + 1))}
                disabled={currentPage === membersData.pagination.total_pages}
              >
                {isAr ? 'التالي' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Wizard */}
      <AddMemberWizard
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onSuccess={handleAddMemberSuccess}
        locale={locale}
      />

      {/* Add Membership Sheet */}
      {selectedMemberId && (
        <AddMembershipSheet
          open={isAddMembershipOpen}
          onOpenChange={setIsAddMembershipOpen}
          memberId={selectedMemberId}
          onSuccess={handleAddMembershipSuccess}
        />
      )}
    </DashboardLayout>
  );
}
