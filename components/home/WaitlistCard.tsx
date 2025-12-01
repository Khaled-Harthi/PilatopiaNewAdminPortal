'use client';

import { MessageCircle, ArrowUpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WaitlistCardProps {
  memberId: number;
  memberName: string;
  phoneNumber: string;
  className: string;
  classTime: string;
  classRoomName: string;
  position: number;
  joinedAt: string;
  date: string; // For WhatsApp message
  dayName: string; // e.g., "Saturday"
  onPromote: () => void;
  isPromoting?: boolean;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(isoString: string): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 0) return 'just now';
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function generateWhatsAppLink(
  phoneNumber: string,
  memberName: string,
  className: string,
  dayName: string,
  date: string,
  time: string,
  room: string
): string {
  // Arabic message template
  const message = `مرحباً ${memberName}،

يوجد مكان متاح في حصة ${className}
📅 ${dayName} ${date}
⏰ ${time}
📍 ${room}

هل تودين الحجز؟`;

  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');

  return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
}

export function WaitlistCard({
  memberId,
  memberName,
  phoneNumber,
  className,
  classTime,
  classRoomName,
  position,
  joinedAt,
  date,
  dayName,
  onPromote,
  isPromoting,
}: WaitlistCardProps) {
  const formattedTime = formatTime(classTime);
  const waitingTime = joinedAt ? formatRelativeTime(joinedAt) : '';

  const whatsappLink = generateWhatsAppLink(
    phoneNumber,
    memberName,
    className,
    dayName,
    date,
    formattedTime,
    classRoomName
  );

  return (
    <div className="bg-card border rounded-lg p-3 min-w-[200px] flex-shrink-0">
      {/* Member Name */}
      <div className="flex items-center gap-1 mb-1">
        <Link
          href={`/members/${memberId}`}
          className="font-medium text-sm hover:underline truncate"
        >
          {memberName}
        </Link>
        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
      </div>

      {/* Class Info */}
      <div className="text-xs text-muted-foreground mb-1">
        {className} · {formattedTime}
      </div>

      {/* Position & Wait Time */}
      <div className="text-xs text-muted-foreground mb-3">
        #{position} in line {waitingTime && `· ${waitingTime}`}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1 flex-1"
          asChild
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3 w-3" />
            WhatsApp
          </a>
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-7 text-xs gap-1 flex-1"
          onClick={onPromote}
          disabled={isPromoting}
        >
          <ArrowUpCircle className="h-3 w-3" />
          Promote
        </Button>
      </div>
    </div>
  );
}
