'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { ArrowLeft, ArrowRight, User, Cake, Calendar, Award } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberMemberships } from '@/components/member/MemberMemberships';
import { MemberBookings } from '@/components/member/MemberBookings';
import { Link } from '@/i18n/routing';
import apiClient from '@/lib/axios';

interface MemberProfile {
  id: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  joiningDate: string;
  membershipStatus: 'active' | 'expired' | 'no membership';
  points: number;
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const locale = useLocale();
  const t = useTranslations('MemberProfile');
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<MemberProfile>(`/admin/members/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load member profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('notFound')}</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = () => {
    switch (profile.membershipStatus) {
      case 'active':
        return <Badge className="bg-green-500">{t('status.active')}</Badge>;
      case 'expired':
        return <Badge variant="destructive">{t('status.expired')}</Badge>;
      default:
        return <Badge variant="secondary">{t('status.noMembership')}</Badge>;
    }
  };

  const formatBirthDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMemberSinceText = (dateStr: string) => {
    const joinDate = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - joinDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return t('joinedYearsAgo', { years: diffYears });
    } else if (diffMonths > 0) {
      return t('joinedMonthsAgo', { months: diffMonths });
    } else {
      return t('joinedDaysAgo', { days: diffDays });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/members">
            <Button variant="ghost" size="icon">
              <BackArrow className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        {/* Profile Layout */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Profile Card - Left Side */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.phoneNumber}</p>
                </div>

                {/* Status Badge */}
                <div className="w-full">
                  {getStatusBadge()}
                </div>

                {/* Info Grid with Icons */}
                <div className="w-full pt-4 space-y-3 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Cake className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{formatBirthDate(profile.birthDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{getMemberSinceText(profile.joiningDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('points', { points: profile.points })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Right Side */}
          <div className="space-y-6">
            {/* Bookings Section */}
            <MemberBookings memberId={id} />

            {/* Memberships Section */}
            <MemberMemberships memberId={id} onUpdate={loadProfile} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
