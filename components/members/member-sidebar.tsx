'use client';

import { MessageCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoyaltyTierBadge } from './loyalty-tier-badge';
import type { MemberProfile } from '@/lib/members/types';
import { getWhatsAppUrl } from '@/lib/members/types';
import { format, parseISO } from 'date-fns';

interface MemberSidebarProps {
  member: MemberProfile;
}

function formatJoinDate(dateStr: string): string | null {
  try {
    const date = parseISO(dateStr);
    return format(date, 'd MMMM yyyy');
  } catch {
    return null;
  }
}

function formatBirthday(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    return format(date, 'MMMM d');
  } catch {
    return null;
  }
}

export function MemberSidebar({ member }: MemberSidebarProps) {
  const joinDate = formatJoinDate(member.joiningDate);
  const birthday = formatBirthday(member.birthDate);
  const whatsAppUrl = member.phoneNumber ? getWhatsAppUrl(member.phoneNumber) : null;

  return (
    <aside className="w-full md:w-64 shrink-0 px-2 pt-2 pb-3 md:p-6">
      {/* Bordered card that doesn't stretch full height */}
      <div className="border rounded-lg p-3 md:p-4 flex flex-col items-center text-center">
        {/* Avatar - Large, centered */}
        <Avatar className="h-16 w-16 mb-3">
          <AvatarFallback className="bg-background">
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {/* Name - Prominent */}
        <h1 className="text-base font-semibold mb-1">{member.name}</h1>

        {/* Tier Badge - Subtle */}
        {member.loyalty && (
          <div className="mb-3">
            <LoyaltyTierBadge
              tier={member.loyalty.tier}
              tierColor={member.loyalty.tier_color}
              size="sm"
            />
          </div>
        )}

        {/* WhatsApp Button - Primary action */}
        {whatsAppUrl && (
          <Button
            size="sm"
            className="mb-2 gap-2 bg-green-600 hover:bg-green-700 text-white"
            asChild
          >
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        )}

        {/* Phone Number - Secondary info */}
        {member.phoneNumber && (
          <p className="text-sm text-muted-foreground mb-3">{member.phoneNumber}</p>
        )}

        <Separator className="w-full my-3" />

        {/* Metadata - Side-by-side on mobile, stacked on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 w-full text-left md:text-center">
          {joinDate && (
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm">{joinDate}</p>
            </div>
          )}
          {birthday && (
            <div>
              <p className="text-xs text-muted-foreground">Birthday</p>
              <p className="text-sm">{birthday}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
