'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';
import { useCreateMember } from '@/lib/members/hooks';

interface AddMemberWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (memberId: string) => void;
  locale: string;
}

export function AddMemberWizard({ open, onOpenChange, onSuccess, locale }: AddMemberWizardProps) {
  const isAr = locale === 'ar';

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [createdMemberId, setCreatedMemberId] = useState<string | null>(null);

  const createMember = useCreateMember();

  const resetWizard = () => {
    setStep(1);
    setName('');
    setPhoneNumber('');
    setBirthDate('');
    setCreatedMemberId(null);
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleCreateMember = async () => {
    try {
      const result = await createMember.mutateAsync({
        name,
        phoneNumber,
        birthDate: birthDate || undefined,
      });
      setCreatedMemberId(result.member.id);
      setStep(2);
    } catch (error) {
      console.error('Failed to create member:', error);
    }
  };

  const handleDone = () => {
    if (createdMemberId) {
      onSuccess(createdMemberId);
    }
    handleClose();
  };

  const handleAddMembership = () => {
    if (createdMemberId) {
      onSuccess(createdMemberId);
    }
    handleClose();
  };

  const isStep1Valid = name.trim() && phoneNumber.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAr ? 'إضافة عضو جديد' : 'Add New Member'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && (isAr ? 'الخطوة 1 من 2: المعلومات الأساسية' : 'Step 1 of 2: Basic Information')}
            {step === 2 && (isAr ? 'الخطوة 2 من 2: تم الإنشاء' : 'Step 2 of 2: Created Successfully')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {isAr ? 'الاسم' : 'Name'} *
              </Label>
              <Input
                id="name"
                placeholder={isAr ? 'أدخل اسم العضو' : 'Enter member name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {isAr ? 'رقم الجوال' : 'Phone Number'} *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={isAr ? 'مثال: 0501234567' : 'e.g., 0501234567'}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">
                {isAr ? 'تاريخ الميلاد' : 'Birth Date'} ({isAr ? 'اختياري' : 'optional'})
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Success */}
        {step === 2 && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {isAr ? 'تم إنشاء العضو بنجاح' : 'Member Created Successfully'}
              </h3>
              <p className="text-muted-foreground mt-2">
                {isAr
                  ? 'يمكنك الآن إضافة عضوية أو حجز حصة للعضو'
                  : 'You can now add a membership or book a class for this member'}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleCreateMember}
                disabled={!isStep1Valid || createMember.isPending}
              >
                {createMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {createMember.isPending
                  ? (isAr ? 'جاري الإنشاء...' : 'Creating...')
                  : (isAr ? 'إنشاء العضو' : 'Create Member')}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="outline" onClick={handleDone}>
                {isAr ? 'تم' : 'Done'}
              </Button>
              <Button onClick={handleAddMembership}>
                {isAr ? 'إضافة عضوية' : 'Add Membership'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
