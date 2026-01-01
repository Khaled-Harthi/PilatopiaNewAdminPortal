'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Rows2, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalUrl: string;
  resultUrl: string;
  title?: string;
}

export function ImageCompareDialog({
  open,
  onOpenChange,
  originalUrl,
  resultUrl,
  title = 'Compare Images',
}: ImageCompareDialogProps) {
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <div className="flex gap-1">
              <Button
                variant={layout === 'horizontal' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLayout('horizontal')}
              >
                <Columns2 className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'vertical' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setLayout('vertical')}
              >
                <Rows2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 p-4 flex flex-col overflow-hidden">
          <div className={cn(
            'flex-1 min-h-0 gap-4 items-center justify-center',
            layout === 'horizontal' ? 'flex' : 'flex flex-col overflow-auto'
          )}>
            {/* Original Image */}
            <div className={cn(
              'flex items-center justify-center',
              layout === 'horizontal' ? 'flex-1 min-w-0 h-full' : 'w-full'
            )}>
              <img
                src={originalUrl}
                alt="Original"
                className={cn(
                  'object-contain rounded-xl',
                  layout === 'horizontal'
                    ? 'max-w-full max-h-[calc(95vh-140px)]'
                    : 'max-w-full max-h-[45vh]'
                )}
              />
            </div>

            {/* Result Image */}
            <div className={cn(
              'flex items-center justify-center',
              layout === 'horizontal' ? 'flex-1 min-w-0 h-full' : 'w-full'
            )}>
              <img
                src={resultUrl}
                alt="Result"
                className={cn(
                  'object-contain rounded-xl',
                  layout === 'horizontal'
                    ? 'max-w-full max-h-[calc(95vh-140px)]'
                    : 'max-w-full max-h-[45vh]'
                )}
              />
            </div>
          </div>

          {/* Footer with labels and download buttons */}
          <div className={cn(
            'shrink-0 mt-3 gap-4',
            layout === 'horizontal' ? 'grid grid-cols-2' : 'flex flex-col'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Original Source
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href={originalUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                AI Generated
              </span>
              <Button variant="outline" size="sm" asChild>
                <a href={resultUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
