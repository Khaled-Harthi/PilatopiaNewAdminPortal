'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isUser?: boolean;
  attachmentUrl?: string;
}

export function ChatMessage({
  content,
  timestamp,
  isUser = false,
  attachmentUrl,
}: ChatMessageProps) {
  return (
    <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
      {/* Attachment preview if any */}
      {attachmentUrl && (
        <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden border shadow-sm">
          <img src={attachmentUrl} alt="Attachment" className="w-full h-auto" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[85%] px-4 py-2.5 rounded-2xl',
          isUser
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md shadow-sm'
            : 'bg-stone-100 text-stone-900 rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>

      {/* Timestamp */}
      <span className={cn('text-xs text-muted-foreground mt-1', isUser ? 'mr-2' : 'ml-2')}>
        {format(new Date(timestamp), 'h:mm a')}
      </span>
    </div>
  );
}
