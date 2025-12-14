'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { useCreateMember } from '@/lib/members/hooks';
import { toast } from 'sonner';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const createMember = useCreateMember();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset form state when opening
      setName('');
      setPhoneNumber('');
      setBirthDate('');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    // Format phone number - ensure it starts with +966
    let formattedPhone = phoneNumber.trim().replace(/\s/g, '');
    if (formattedPhone.startsWith('05')) {
      formattedPhone = '+966' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('5')) {
      formattedPhone = '+966' + formattedPhone;
    } else if (formattedPhone.startsWith('966')) {
      formattedPhone = '+' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+966' + formattedPhone;
    }

    try {
      const result = await createMember.mutateAsync({
        name: name.trim(),
        phoneNumber: formattedPhone,
        birthDate: birthDate || undefined,
      });

      toast.success('Member created successfully');
      onOpenChange(false);

      // Navigate to the new member's profile
      if (result.member?.id) {
        router.push(`/${locale}/members/${result.member.id}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create member';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>New Member</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Add a new member to your studio.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4 px-4 sm:px-0">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter member name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="05XXXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                Saudi phone number (will be formatted automatically)
              </p>
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date (optional)</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMember.isPending}
            >
              {createMember.isPending ? 'Creating...' : 'Create Member'}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
