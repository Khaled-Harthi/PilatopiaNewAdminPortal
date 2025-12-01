'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/axios';

interface AdjustBalanceDialogProps {
  membershipId: string | number;
  currentBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AdjustBalanceDialog({
  membershipId,
  currentBalance,
  open,
  onOpenChange,
  onSuccess,
}: AdjustBalanceDialogProps) {
  const [adjustment, setAdjustment] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newBalance = currentBalance + adjustment;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset state
      setAdjustment(1);
      setReason('');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleIncrement = () => {
    setAdjustment((prev) => prev + 1);
  };

  const handleDecrement = () => {
    // Don't allow reducing below negative of current balance
    if (currentBalance + adjustment - 1 >= 0) {
      setAdjustment((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this adjustment');
      return;
    }

    if (adjustment === 0) {
      setError('Adjustment cannot be zero');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(`/admin/balance/memberships/${membershipId}/adjust`, {
        adjustment,
        reason: reason.trim(),
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to adjust balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Adjust Class Balance</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Add or remove classes from this membership. Current balance: {currentBalance} classes.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          {/* Adjustment Counter */}
          <div className="space-y-2">
            <Label>Adjustment</Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={newBalance <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[80px]">
                <span className={`text-3xl font-bold ${adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {adjustment >= 0 ? '+' : ''}{adjustment}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              New balance: <span className="font-medium">{newBalance} classes</span>
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (required)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Compensation for cancelled class, Admin correction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
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
            disabled={isSubmitting || !reason.trim() || adjustment === 0}
          >
            {isSubmitting ? 'Adjusting...' : 'Adjust Balance'}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
