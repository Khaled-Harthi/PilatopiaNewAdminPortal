'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LoyaltyTierBadge } from './loyalty-tier-badge';
import { MembershipProgress } from './membership-progress';
import type { Member, LoyaltyTier } from '@/lib/members/types';
import { getWhatsAppUrl } from '@/lib/members/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

interface MemberCardProps {
  member: Member;
  locale: string;
  onBookClass?: () => void;
  onRenew?: () => void;
}

function getMemberBadgeType(member: Member): 'expiring' | 'inactive' | 'new' | null {
  // Check if membership is expiring
  if (member.currentMembership?.expiryDate) {
    const daysUntilExpiry = differenceInDays(parseISO(member.currentMembership.expiryDate), new Date());
    if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
      return 'expiring';
    }
  }

  // Check if inactive (no visit in 14+ days)
  if (member.lastVisit) {
    const daysSinceVisit = differenceInDays(new Date(), parseISO(member.lastVisit));
    if (daysSinceVisit >= 14) {
      return 'inactive';
    }
  }

  // Check if new member (joined within 30 days)
  if (member.joiningDate) {
    const daysSinceJoin = differenceInDays(new Date(), parseISO(member.joiningDate));
    if (daysSinceJoin <= 30) {
      return 'new';
    }
  }

  return null;
}

function formatLastVisit(lastVisit: string | null | undefined, locale: string): string {
  if (!lastVisit) {
    return locale === 'ar' ? 'لم تسجل زيارة' : 'No visits recorded';
  }

  const date = parseISO(lastVisit);
  const daysAgo = differenceInDays(new Date(), date);

  if (daysAgo === 0) {
    return locale === 'ar' ? 'اليوم' : 'Today';
  } else if (daysAgo === 1) {
    return locale === 'ar' ? 'أمس' : 'Yesterday';
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
}

function formatExpiryDate(expiresAt: string | null | undefined, locale: string): { text: string; isWarning: boolean } | null {
  if (!expiresAt) return null;

  const date = parseISO(expiresAt);
  const daysUntil = differenceInDays(date, new Date());

  if (daysUntil < 0) {
    return { text: locale === 'ar' ? 'منتهية الصلاحية' : 'Expired', isWarning: true };
  } else if (daysUntil === 0) {
    return { text: locale === 'ar' ? 'تنتهي اليوم' : 'Expires today', isWarning: true };
  } else if (daysUntil <= 7) {
    return {
      text: locale === 'ar' ? `تنتهي خلال ${daysUntil} أيام` : `Expires in ${daysUntil} days`,
      isWarning: true
    };
  }

  return null;
}

export function MemberCard({ member, locale, onBookClass, onRenew }: MemberCardProps) {
  const badgeType = getMemberBadgeType(member);
  const lastVisitText = formatLastVisit(member.lastVisit, locale);
  const expiryInfo = formatExpiryDate(member.currentMembership?.expiryDate, locale);
  const whatsAppUrl = member.phoneNumber ? getWhatsAppUrl(member.phoneNumber) : null;

  // Calculate membership percentage
  const totalClasses = member.currentMembership?.totalClasses ?? 0;
  const remainingClasses = member.currentMembership?.remainingClasses ?? 0;
  const usedClasses = totalClasses - remainingClasses;
  const hasActiveMembership = member.membershipStatus === 'active' && totalClasses > 0;

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header Row: Name, Tier, Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <Link href={`/members/${member.id}`} className="group-hover:underline">
                  <h3 className="font-semibold text-base truncate">{member.name}</h3>
                </Link>
                {member.loyalty?.tier && (
                  <LoyaltyTierBadge
                    tier={member.loyalty.tier}
                    tierColor={member.loyalty.tier_color}
                  />
                )}
              </div>

              {/* Phone with WhatsApp link */}
              {member.phoneNumber && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{member.phoneNumber}</span>
                  {whatsAppUrl && (
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Status Badge */}
            {badgeType && (
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full shrink-0',
                badgeType === 'expiring' && 'bg-orange-100 text-orange-700',
                badgeType === 'inactive' && 'bg-gray-100 text-gray-600',
                badgeType === 'new' && 'bg-blue-100 text-blue-700'
              )}>
                {badgeType === 'expiring' && (locale === 'ar' ? 'قريب الانتهاء' : 'Expiring')}
                {badgeType === 'inactive' && (locale === 'ar' ? 'غير نشط' : 'Inactive')}
                {badgeType === 'new' && (locale === 'ar' ? 'جديد' : 'New')}
              </span>
            )}
          </div>

          {/* Membership Progress */}
          {hasActiveMembership && (
            <div className="space-y-2">
              <MembershipProgress
                used={usedClasses}
                total={totalClasses}
              />
              {expiryInfo && (
                <p className={cn(
                  'text-xs',
                  expiryInfo.isWarning ? 'text-orange-600' : 'text-muted-foreground'
                )}>
                  {expiryInfo.text}
                </p>
              )}
            </div>
          )}

          {/* No Membership State */}
          {!hasActiveMembership && (
            <p className="text-sm text-muted-foreground">
              {locale === 'ar' ? 'لا توجد عضوية نشطة' : 'No active membership'}
            </p>
          )}

          {/* Last Visit */}
          <p className="text-xs text-muted-foreground">
            {locale === 'ar' ? 'آخر زيارة:' : 'Last visit:'} {lastVisitText}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {onBookClass && (
                <Button variant="ghost" size="sm" onClick={onBookClass}>
                  <Calendar className="h-4 w-4 mr-1" />
                  {locale === 'ar' ? 'حجز' : 'Book'}
                </Button>
              )}
              {onRenew && hasActiveMembership && expiryInfo?.isWarning && (
                <Button variant="ghost" size="sm" onClick={onRenew}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {locale === 'ar' ? 'تجديد' : 'Renew'}
                </Button>
              )}
            </div>

            <Link href={`/members/${member.id}`}>
              <Button variant="ghost" size="sm">
                {locale === 'ar' ? 'عرض الملف' : 'View Profile'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
