'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, MessageCircle, ArrowUpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { DailyClassDetail, DailyWaitlistMember } from '@/lib/schedule/types';

interface WaitlistClassCardProps {
  classDetail: DailyClassDetail;
  date: string;
  dayName: string;
  onPromote: (memberId: number) => void;
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

export function WaitlistClassCard({
  classDetail,
  date,
  dayName,
  onPromote,
  isPromoting,
}: WaitlistClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { class: classInfo, stats, waitlist } = classDetail;
  const isFull = stats.total_booked >= classInfo.capacity;
  const formattedTime = formatTime(classInfo.schedule_time);

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      {/* Collapsed Header */}
      <button
        className="w-full p-3 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span className="font-medium text-sm">{formattedTime}</span>
            <span className="text-sm truncate">{classInfo.name}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            {waitlist.length} waiting
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 ml-6">
          <span className="text-xs text-muted-foreground">
            {classInfo.class_room_name}
          </span>
          {isFull && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              FULL
            </span>
          )}
        </div>
      </button>

      {/* Expanded Content - Waitlist People */}
      {isExpanded && (
        <div className="border-t px-3 pb-3 space-y-2">
          {waitlist.map((member, index) => (
            <WaitlistPersonRow
              key={member.member_id}
              member={member}
              position={index + 1}
              className={classInfo.name}
              classTime={formattedTime}
              classRoomName={classInfo.class_room_name}
              date={date}
              dayName={dayName}
              onPromote={() => onPromote(member.member_id)}
              isPromoting={isPromoting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WaitlistPersonRowProps {
  member: DailyWaitlistMember;
  position: number;
  className: string;
  classTime: string;
  classRoomName: string;
  date: string;
  dayName: string;
  onPromote: () => void;
  isPromoting?: boolean;
}

function WaitlistPersonRow({
  member,
  position,
  className,
  classTime,
  classRoomName,
  date,
  dayName,
  onPromote,
  isPromoting,
}: WaitlistPersonRowProps) {
  const whatsappLink = generateWhatsAppLink(
    member.phone_number,
    member.member_name,
    className,
    dayName,
    date,
    classTime,
    classRoomName
  );

  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-md bg-muted/50 mt-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-muted-foreground w-5">
          #{position}
        </span>
        <Link
          href={`/members/${member.member_id}`}
          className="text-sm truncate hover:underline flex items-center gap-1"
        >
          {member.member_name}
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
        </Link>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          asChild
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={onPromote}
          disabled={isPromoting}
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Promote
        </Button>
      </div>
    </div>
  );
}
