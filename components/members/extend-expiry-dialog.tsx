'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/axios';

interface ExtendExpiryDialogProps {
  membershipId: string | number;
  currentExpiryDate: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExtendExpiryDialog({
  membershipId,
  currentExpiryDate,
  open,
  onOpenChange,
  onSuccess,
}: ExtendExpiryDialogProps) {
  const currentExpiry = new Date(currentExpiryDate);
  const [newExpiryDate, setNewExpiryDate] = useState<Date>(addDays(currentExpiry, 30));
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extensionDays = differenceInDays(newExpiryDate, currentExpiry);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset state
      setNewExpiryDate(addDays(new Date(currentExpiryDate), 30));
      setReason('');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (extensionDays <= 0) {
      setError('New expiry date must be after current expiry date');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Set time to 23:59:59 as per business rules
      const expiryWithTime = new Date(newExpiryDate);
      expiryWithTime.setHours(23, 59, 59, 0);

      await apiClient.post(`/admin/balance/memberships/${membershipId}/extend`, {
        expiryDate: expiryWithTime.toISOString(),
        reason: reason.trim() || undefined,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to extend expiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Extend Membership Expiry</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Current expiry: {format(currentExpiry, 'PPP')}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>New Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !newExpiryDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newExpiryDate ? format(newExpiryDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newExpiryDate}
                  onSelect={(date) => date && setNewExpiryDate(date)}
                  disabled={(date) => date <= currentExpiry}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {extensionDays > 0 && (
              <p className="text-sm text-muted-foreground">
                Extending by <span className="font-medium text-green-600">+{extensionDays} days</span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Customer request, Medical leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || extensionDays <= 0}
          >
            {isSubmitting ? 'Extending...' : 'Extend Expiry'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
