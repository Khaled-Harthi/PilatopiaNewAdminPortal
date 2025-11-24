'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarIcon, Check, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
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
  finalPrice?: number;
  message?: string;
  error?: string;
}

interface AddMembershipWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  onSuccess: () => void;
}

export function AddMembershipWizard({
  open,
  onOpenChange,
  memberId,
  onSuccess,
}: AddMembershipWizardProps) {
  const t = useTranslations('MemberProfile.AddMembership');
  const tCommon = useTranslations('Common');

  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [startDate, setStartDate] = useState<Date>(addDays(new Date(), 1));
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (open) {
      loadPlans();
    }
  }, [open]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/admin/membership-plans');
      setPlans(response.data.membershipPlans || []);
    } catch (error) {
      console.error(t('errors.failedToLoad'), error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      const response = await apiClient.get('/admin/promo-codes/validate', {
        params: { code: promoCode, userId: memberId }
      });
      console.log('Promo validation response:', response.data);
      if (response.data.success) {
        setPromoValidation(response.data.data);
        console.log('Promo validation set to:', response.data.data);
      } else {
        setPromoValidation(response.data.data);
      }
    } catch (error) {
      console.error(t('errors.failedToValidate'), error);
      setPromoValidation({
        valid: false,
        error: 'NETWORK_ERROR',
        message: t('errors.failedToValidate')
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) return;

    setIsPurchasing(true);
    try {
      const description = `${selectedPlan.name} purchased in-store${notes ? `\n- ${notes}` : ''}`;

      await apiClient.post(`/admin/members/${memberId}/purchase`, {
        planId: selectedPlan.id,
        startDate: startDate.toISOString(),
        description,
        promoCode: promoCode || undefined,
        paymentMethod
      });

      setStep(5);
    } catch (error: any) {
      alert(error.response?.data?.error || t('errors.failedToCreate'));
      console.error(t('errors.failedToCreate'), error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedPlan(null);
    setPromoCode('');
    setPromoValidation(null);
    setPaymentMethod('cash');
    setStartDate(addDays(new Date(), 1));
    setNotes('');
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess();
  };

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    if (promoValidation?.valid && promoValidation.finalPrice !== undefined) {
      return promoValidation.finalPrice;
    }
    return selectedPlan.price;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('step', { current: step, total: 5 })}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-secondary h-2 rounded-full mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('step1.title')}</h3>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">{t('step1.loadingPlans')}</p>
            ) : plans.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t('step1.noPlansAvailable')}</p>
            ) : (
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedPlan?.id === plan.id && 'border-primary ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{plan.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {plan.classCount} {t('step1.classes')} • {t('step1.validFor')} {plan.validityDays} {t('step1.days')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${plan.price}</p>
                          {selectedPlan?.id === plan.id && (
                            <Check className="h-5 w-5 text-primary ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={() => setStep(2)} disabled={!selectedPlan}>
                {tCommon('next')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Promo Code */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('step2.title')}</h3>
            <div className="space-y-2">
              <Label htmlFor="promoCode">{t('step2.label')}</Label>
              <div className="flex gap-2">
                <Input
                  id="promoCode"
                  placeholder={t('step2.placeholder')}
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoValidation(null);
                  }}
                />
                <Button
                  onClick={validatePromoCode}
                  disabled={!promoCode.trim() || isValidatingPromo}
                >
                  {isValidatingPromo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isValidatingPromo ? t('step2.validating') : t('step2.validate')}
                </Button>
              </div>
              {promoValidation && (
                <div
                  className={cn(
                    'p-3 rounded-md text-sm',
                    promoValidation.valid
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  )}
                >
                  {promoValidation.message}
                </div>
              )}
              {promoValidation?.valid && selectedPlan && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-2">
                  <p className="text-sm text-green-900">
                    <span className="font-medium">{t('step2.originalPrice')}</span> ${Number(selectedPlan.price).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-900">
                    <span className="font-medium">{t('step2.discount')}</span> {promoValidation.discountPercentage}%
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {t('step2.finalPrice')} ${(Number(selectedPlan.price) * (1 - Number(promoValidation.discountPercentage) / 100)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                {tCommon('back')}
              </Button>
              <Button onClick={() => setStep(3)}>
                {tCommon('next')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Payment Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('step3.title')}</h3>

            <div className="space-y-2">
              <Label>{t('step3.paymentMethodLabel')}</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">{t('step3.paymentMethods.cash')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">{t('step3.paymentMethods.card')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer">{t('step3.paymentMethods.bankTransfer')}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>{t('step3.startDateLabel')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('step3.notesLabel')}</Label>
              <Textarea
                id="notes"
                placeholder={t('step3.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(2)}>
                {tCommon('back')}
              </Button>
              <Button onClick={() => setStep(4)}>
                {tCommon('next')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && selectedPlan && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('step4.title')}</h3>
            <div className="p-4 bg-secondary rounded-md space-y-2">
              <h4 className="font-medium">{t('step4.purchaseSummary')}</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">{t('step4.plan')}</span> {selectedPlan.name}
                </p>
                <p>
                  <span className="font-medium">{t('step4.startDate')}</span> {format(startDate, 'PPP')}
                </p>
                <p>
                  <span className="font-medium">{t('step4.validUntil')}</span>{' '}
                  {format(addDays(startDate, selectedPlan.validityDays), 'PPP')}
                </p>
                <p>
                  <span className="font-medium">{t('step4.originalPrice')}</span> ${selectedPlan.price}
                </p>
                {promoValidation?.valid && (
                  <>
                    <p className="text-green-600">
                      <span className="font-medium">{t('step4.discountApplied')}</span> {t('step4.percentOff', { percent: promoValidation.discountPercentage })}
                    </p>
                    <p className="text-lg font-bold">
                      {t('step4.finalAmount')} ${(Number(selectedPlan.price) * (1 - Number(promoValidation.discountPercentage) / 100)).toFixed(2)}
                    </p>
                  </>
                )}
                {!promoValidation?.valid && (
                  <p className="text-lg font-bold">{t('step4.total')} ${selectedPlan.price}</p>
                )}
                <p>
                  <span className="font-medium">{t('step4.paymentMethod')}</span> {t(`step3.paymentMethods.${paymentMethod === 'bank_transfer' ? 'bankTransfer' : paymentMethod}`)}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(3)}>
                {tCommon('back')}
              </Button>
              <Button onClick={handlePurchase} disabled={isPurchasing}>
                {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPurchasing ? t('step4.processing') : t('step4.confirmButton')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="space-y-4 text-center py-8">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">{t('step5.title')}</h3>
            <p className="text-muted-foreground">
              {t('step5.message')}
            </p>
            <DialogFooter className="justify-center">
              <Button onClick={handleSuccess}>
                {tCommon('done')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
