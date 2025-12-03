'use client';

import { MessageSquare, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LoyaltyTierBadge } from './loyalty-tier-badge';
import type { Member } from '@/lib/members/types';
import { getWhatsAppUrl } from '@/lib/members/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

interface MemberListItemProps {
  member: Member;
  locale: string;
}

function getMemberBadgeType(member: Member): 'expiring' | 'inactive' | 'new' | 'upcoming' | null {
  // Check for upcoming membership (future start date)
  if (!member.currentMembership && member.upcomingMembership) {
    return 'upcoming';
  }

  if (member.currentMembership?.expiryDate) {
    const daysUntilExpiry = differenceInDays(parseISO(member.currentMembership.expiryDate), new Date());
    if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
      return 'expiring';
    }
  }

  if (member.lastVisit) {
    const daysSinceVisit = differenceInDays(new Date(), parseISO(member.lastVisit));
    if (daysSinceVisit >= 14) {
      return 'inactive';
    }
  }

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
    return locale === 'ar' ? 'لا زيارات' : 'No visits';
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

function formatMembershipStatus(member: Member, locale: string): { text: string; color: string; subtext?: string } {
  // Check for current active membership first
  if (member.currentMembership) {
    const remaining = member.currentMembership.remainingClasses;
    const total = member.currentMembership.totalClasses;
    const expiryDate = parseISO(member.currentMembership.expiryDate);
    const daysUntilExpiry = differenceInDays(expiryDate, new Date());

    if (daysUntilExpiry < 0) {
      return {
        text: locale === 'ar' ? 'منتهية' : 'Expired',
        color: 'text-destructive'
      };
    }

    if (daysUntilExpiry <= 7) {
      return {
        text: `${remaining}/${total}`,
        color: 'text-orange-600'
      };
    }

    return {
      text: `${remaining}/${total}`,
      color: 'text-foreground'
    };
  }

  // Check for upcoming membership (starts in the future)
  if (member.upcomingMembership) {
    const startDate = parseISO(member.upcomingMembership.startDate);
    const daysUntilStart = differenceInDays(startDate, new Date());
    const startText = daysUntilStart === 0
      ? (locale === 'ar' ? 'يبدأ اليوم' : 'Starts today')
      : daysUntilStart === 1
        ? (locale === 'ar' ? 'يبدأ غداً' : 'Starts tomorrow')
        : (locale === 'ar' ? `يبدأ في ${daysUntilStart} أيام` : `Starts in ${daysUntilStart} days`);

    return {
      text: member.upcomingMembership.planName,
      color: 'text-blue-600',
      subtext: startText
    };
  }

  return {
    text: locale === 'ar' ? 'لا توجد عضوية' : 'No membership',
    color: 'text-muted-foreground'
  };
}

export function MemberListItem({ member, locale }: MemberListItemProps) {
  const isRtl = locale === 'ar';
  const badgeType = getMemberBadgeType(member);
  const lastVisitText = formatLastVisit(member.lastVisit, locale);
  const membershipStatus = formatMembershipStatus(member, locale);
  const whatsAppUrl = member.phoneNumber ? getWhatsAppUrl(member.phoneNumber) : null;

  return (
    <Link
      href={`/members/${member.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors border-b last:border-b-0"
    >
      {/* Name, Phone & Badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{member.name}</span>
          {member.loyalty?.tier && (
            <LoyaltyTierBadge
              tier={member.loyalty.tier}
              tierColor={member.loyalty.tier_color}
              size="sm"
            />
          )}
          {badgeType && (
            <span className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded',
              badgeType === 'expiring' && 'bg-orange-100 text-orange-700',
              badgeType === 'inactive' && 'bg-gray-100 text-gray-600',
              badgeType === 'new' && 'bg-blue-100 text-blue-700',
              badgeType === 'upcoming' && 'bg-blue-100 text-blue-700'
            )}>
              {badgeType === 'expiring' && (locale === 'ar' ? 'قريب الانتهاء' : 'Expiring')}
              {badgeType === 'inactive' && (locale === 'ar' ? 'غير نشط' : 'Inactive')}
              {badgeType === 'new' && (locale === 'ar' ? 'جديد' : 'New')}
              {badgeType === 'upcoming' && (locale === 'ar' ? 'قادم' : 'Upcoming')}
            </span>
          )}
        </div>
        {/* Phone number row */}
        {member.phoneNumber && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{member.phoneNumber}</span>
            {whatsAppUrl && (
              <button
                type="button"
                className="text-green-600 hover:text-green-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {/* Mobile: Show membership status inline */}
        <div className="sm:hidden mt-1 text-sm text-muted-foreground">
          <span className={membershipStatus.color}>{membershipStatus.text}</span>
          {membershipStatus.subtext && <span className="text-xs"> ({membershipStatus.subtext})</span>}
          {' · '}{lastVisitText}
        </div>
      </div>

      {/* Membership Status - Desktop */}
      <div className="hidden sm:block w-28 text-right shrink-0">
        <span className={cn('text-sm', membershipStatus.color)}>
          {membershipStatus.text}
        </span>
        {membershipStatus.subtext && (
          <div className="text-xs text-muted-foreground">
            {membershipStatus.subtext}
          </div>
        )}
      </div>

      {/* Last Visit - Desktop */}
      <div className="hidden md:block w-24 text-right shrink-0">
        <span className="text-sm text-muted-foreground">{lastVisitText}</span>
      </div>

      {/* Arrow */}
      <ChevronRight className={cn('h-4 w-4 text-muted-foreground shrink-0', isRtl && 'rotate-180')} />
    </Link>
  );
}
