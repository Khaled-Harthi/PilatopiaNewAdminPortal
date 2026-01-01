'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Paperclip, Pencil, Send, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RichComposerProps {
  onSend: (message: string, attachment?: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function RichComposer({
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = 'Describe what to change...',
}: RichComposerProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachmentPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (!message.trim() && !attachment) return;
    if (isLoading || disabled) return;

    onSend(message.trim(), attachment || undefined);
    setMessage('');
    handleRemoveAttachment();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (message.trim() || attachment) && !isLoading && !disabled;

  return (
    <div className="border-t bg-white px-4 py-3">
      {/* Attachment preview */}
      {attachmentPreview && (
        <div className="mb-3 relative inline-block">
          <div className="w-20 h-20 rounded-lg overflow-hidden border shadow-sm">
            <img
              src={attachmentPreview}
              alt="Attachment"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
            onClick={handleRemoveAttachment}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled}
            className={cn(
              'min-h-[44px] max-h-[200px] resize-none pr-20 rounded-xl border-stone-200',
              'focus-visible:ring-1 focus-visible:ring-stone-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            rows={1}
          />

          {/* Attachment and draw buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stone-400 hover:text-stone-600"
              onClick={handleAttach}
              disabled={isLoading || disabled}
              title="Attach reference image"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stone-400 hover:text-stone-600"
              disabled={isLoading || disabled}
              title="Draw on image (coming soon)"
              onClick={() => {
                // TODO: Implement annotation canvas
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Send button */}
        <Button
          size="icon"
          className={cn(
            'h-10 w-10 rounded-xl shrink-0',
            'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
            'text-white shadow-md',
            !canSend && 'opacity-50'
          )}
          onClick={handleSend}
          disabled={!canSend}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-2 ml-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
