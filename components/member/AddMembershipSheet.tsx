'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Loader2, Check, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import apiClient from '@/lib/axios';

interface MembershipPlan {
  id: string;
  name: string;
  classCount: number;
  price: number;
  validityDays: number;
}

interface PromoCodeValidation {
  valid: boolean;
  discountType?: string;
  discountValue?: number;
  discountPercentage?: number;
  finalPrice?: number;
  message?: string;
  error?: string;
}

interface AddMembershipSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  onSuccess: () => void;
}

export function AddMembershipSheet({
  open,
  onOpenChange,
  memberId,
  onSuccess,
}: AddMembershipSheetProps) {
  const t = useTranslations('MemberProfile.AddMembership');
  const tCommon = useTranslations('Common');

  // State
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mada');
  const [startDateOption, setStartDateOption] = useState('tomorrow');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;

  useEffect(() => {
    if (open) {
      loadPlans();
      resetForm();
    }
  }, [open]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/admin/membership-plans');
      setPlans(response.data.membershipPlans || []);
    } catch (error) {
      console.error('Failed to load plans', error);
      toast.error('Failed to load membership plans');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPlanId('');
    setPromoCode('');
    setPromoValidation(null);
    setPaymentMethod('cash');
    setStartDateOption('tomorrow');
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      const response = await apiClient.get('/admin/promo-codes/validate', {
        params: { code: promoCode, userId: memberId },
      });
      if (response.data.success) {
        setPromoValidation(response.data.data);
      } else {
        setPromoValidation(response.data.data);
      }
    } catch (error) {
      console.error('Failed to validate promo', error);
      setPromoValidation({
        valid: false,
        error: 'NETWORK_ERROR',
        message: 'Failed to validate promo code',
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const getStartDate = (): Date => {
    switch (startDateOption) {
      case 'today':
        return new Date();
      case 'tomorrow':
        return addDays(new Date(), 1);
      default:
        return addDays(new Date(), 1);
    }
  };

  const getFinalPrice = (): number => {
    if (!selectedPlan) return 0;
    const price = Number(selectedPlan.price) || 0;
    if (promoValidation?.valid && promoValidation.discountPercentage) {
      return price * (1 - promoValidation.discountPercentage / 100);
    }
    return price;
  };

  const handleSubmit = async () => {
    if (!selectedPlan) return;

    setIsSubmitting(true);
    try {
      const startDate = getStartDate();
      const description = `${selectedPlan.name} purchased in-store`;

      await apiClient.post(`/admin/members/${memberId}/purchase`, {
        planId: selectedPlan.id,
        startDate: startDate.toISOString(),
        description,
        promoCode: promoCode || undefined,
        paymentMethod,
      });

      toast.success('Membership added successfully');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add membership');
      console.error('Failed to add membership', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add Membership</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-2">
          {/* Plan Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Select Plan
            </Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No plans available</p>
            ) : (
              <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <div className="border rounded-lg divide-y">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={cn(
                        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                        selectedPlanId === plan.id && 'bg-accent'
                      )}
                    >
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {plan.classCount} classes · {plan.validityDays} days
                        </p>
                      </div>
                      <span className="text-sm font-semibold shrink-0">
                        SAR {Number(plan.price).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Promo Code */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Promo Code
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoValidation(null);
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={validatePromoCode}
                disabled={!promoCode.trim() || isValidatingPromo}
              >
                {isValidatingPromo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
            {promoValidation && (
              <div
                className={cn(
                  'flex items-center gap-2 text-xs',
                  promoValidation.valid ? 'text-green-600' : 'text-red-600'
                )}
              >
                {promoValidation.valid ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span>
                  {promoValidation.valid
                    ? `${promoValidation.discountPercentage}% off applied`
                    : promoValidation.message || 'Invalid code'}
                </span>
              </div>
            )}
          </div>

          {/* Start Date & Payment - Side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start Date
              </Label>
              <Select value={startDateOption} onValueChange={setStartDateOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today, {format(new Date(), 'MMM d')}</SelectItem>
                  <SelectItem value="tomorrow">
                    Tomorrow, {format(addDays(new Date(), 1), 'MMM d')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Payment
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mada">Mada</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total & Submit */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <div className="text-right">
                {promoValidation?.valid && selectedPlan && (
                  <span className="text-sm text-muted-foreground line-through mr-2">
                    SAR {Number(selectedPlan.price).toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-semibold">
                  SAR {getFinalPrice().toFixed(0)}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedPlan || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                'Add Membership'
              )}
            </Button>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
