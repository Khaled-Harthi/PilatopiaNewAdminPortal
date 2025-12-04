'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { LoyaltyTierBadge } from './loyalty-tier-badge';
import type { MemberProfile } from '@/lib/members/types';
import { getWhatsAppUrl } from '@/lib/members/types';
import { format } from 'date-fns';

interface MemberProfileHeaderProps {
  member: MemberProfile;
}

export function MemberProfileHeader({ member }: MemberProfileHeaderProps) {
  const t = useTranslations('MemberProfile');

  const formatBirthdayWithAge = (dateStr: string | null): { date: string; age: number } | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return {
      date: format(date, 'd MMMM yyyy'),
      age,
    };
  };

  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return format(date, 'MMMM yyyy');
  };

  const progressToNextTier = member.loyalty?.next_tier
    ? `${member.loyalty.progress_percentage}% to ${member.loyalty.next_tier.toUpperCase()}`
    : null;

  return (
    <Card>
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Name and Tier */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {member.name}
            </h1>

            {member.loyalty && (
              <div className="space-y-1">
                <LoyaltyTierBadge
                  tier={member.loyalty.tier}
                  tierColor={member.loyalty.tier_color}
                  size="lg"
                />
                <p className="text-sm text-muted-foreground">
                  {member.loyalty.lifetime_classes.toLocaleString()} lifetime classes
                  <span className="mx-1.5">·</span>
                  {member.loyalty.total_points.toLocaleString()} points
                  {progressToNextTier && (
                    <>
                      <span className="mx-1.5">·</span>
                      {progressToNextTier}
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp Contact */}
          {member.phoneNumber && (
            <div className="pt-2">
              <a
                href={getWhatsAppUrl(member.phoneNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium">{member.phoneNumber}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </div>
          )}

          {/* Member Info */}
          <div className="pt-2 space-y-1 text-sm text-muted-foreground">
            {formatJoinDate(member.joiningDate) && (
              <p>Member since {formatJoinDate(member.joiningDate)}</p>
            )}
            {(() => {
              const birthdayInfo = formatBirthdayWithAge(member.birthDate);
              return birthdayInfo && (
                <p>Birthday {birthdayInfo.date} ({birthdayInfo.age} yrs)</p>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
