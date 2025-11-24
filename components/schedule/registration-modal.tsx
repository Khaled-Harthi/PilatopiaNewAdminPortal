'use client';

import { useClassDetails } from '@/lib/schedule/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';
import { useLocale } from 'next-intl';
import { formatTime, toLocalDate } from '@/lib/schedule/time-utils';

interface RegistrationModalProps {
  classId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegistrationModal({ classId, open, onOpenChange }: RegistrationModalProps) {
  const locale = useLocale();
  // Only fetch class details when the modal is actually open
  const { data, isLoading, error } = useClassDetails(open ? classId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading
              ? (locale === 'ar' ? 'جاري التحميل...' : 'Loading...')
              : error
              ? (locale === 'ar' ? 'خطأ' : 'Error')
              : data
              ? `${new Date(data.class.schedule_time).toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-US',
                  { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
                )} • ${data.class.name}`
              : (locale === 'ar' ? 'تفاصيل الحصة' : 'Class Details')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">
              {locale === 'ar' ? 'فشل تحميل تفاصيل الحصة' : 'Failed to load class details'}
            </p>
          </div>
        ) : data ? (
          <>

            <div className="space-y-6">
              {/* Class Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'المدرب:' : 'Instructor:'}
                  </span>{' '}
                  <span className="font-medium">{data.class.instructor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'المدة:' : 'Duration:'}
                  </span>{' '}
                  <span className="font-medium">{data.class.duration_minutes} {locale === 'ar' ? 'دقيقة' : 'minutes'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'النوع:' : 'Type:'}
                  </span>{' '}
                  <span className="font-medium">{data.class.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'الوقت:' : 'Time:'}
                  </span>{' '}
                  <span className="font-medium">
                    {formatTime(
                      toLocalDate(data.class.schedule_time).toTimeString().substring(0, 5),
                      locale
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'الغرفة:' : 'Room:'}
                  </span>{' '}
                  <span className="font-medium">{data.class.class_room_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {locale === 'ar' ? 'التسجيلات:' : 'Registrations:'}
                  </span>{' '}
                  <span className="font-medium">
                    {data.bookings?.length || 0}/{data.class.capacity}
                  </span>
                </div>
              </div>

              {/* Registrations */}
              <div>
                <h3 className="font-semibold mb-3">
                  {locale === 'ar' ? 'التسجيلات' : 'Registrations'}
                </h3>

                {!data.bookings || data.bookings.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground text-sm">
                      👥
                      <br />
                      {locale === 'ar' ? 'لا توجد تسجيلات بعد' : 'No registrations yet'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {data.class.capacity} {locale === 'ar' ? 'مقاعد متاحة' : 'available spots remaining'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {data.bookings.map((booking) => (
                        <div
                          key={booking.booking_id}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{booking.user_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {locale === 'ar' ? 'حجزت:' : 'Booked:'}{' '}
                                {booking.check_in_time ? new Date(booking.check_in_time).toLocaleDateString(
                                  locale === 'ar' ? 'ar-SA' : 'en-US',
                                  { month: 'short', day: 'numeric', year: 'numeric' }
                                ) : 'N/A'}{' '}
                                {booking.check_in_time && (
                                  <>
                                    {locale === 'ar' ? 'في' : 'at'}{' '}
                                    {new Date(booking.check_in_time).toLocaleTimeString(
                                      locale === 'ar' ? 'ar-SA' : 'en-US',
                                      { hour: 'numeric', minute: '2-digit' }
                                    )}
                                  </>
                                )}
                              </p>
                              {booking.attendance_id && (
                                <p className="text-sm text-green-600 mt-1">
                                  ✓ {locale === 'ar' ? 'حضر' : 'Attended'}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/members/${booking.user_id}`, '_blank')}
                            >
                              {locale === 'ar' ? 'عرض الملف الشخصي' : 'View Member Profile'}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground mt-4">
                      {data.class.capacity - data.bookings.length} {locale === 'ar' ? 'مقاعد متاحة' : 'available spots remaining'}
                    </p>
                  </>
                )}
              </div>

              {/* Waitlist */}
              {data.waitlist && data.waitlist.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">
                    {locale === 'ar' ? 'قائمة الانتظار' : 'Waitlist'} ({data.waitlist.length})
                  </h3>

                  <div className="space-y-2">
                    {data.waitlist.map((entry) => (
                      <div
                        key={entry.member_id}
                        className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{entry.member_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {locale === 'ar' ? 'انضم:' : 'Joined:'}{' '}
                              {new Date(entry.joined_at).toLocaleDateString(
                                locale === 'ar' ? 'ar-SA' : 'en-US',
                                { month: 'short', day: 'numeric', year: 'numeric' }
                              )}{' '}
                              {locale === 'ar' ? 'في' : 'at'}{' '}
                              {new Date(entry.joined_at).toLocaleTimeString(
                                locale === 'ar' ? 'ar-SA' : 'en-US',
                                { hour: 'numeric', minute: '2-digit' }
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/members/${entry.member_id}`, '_blank')}
                          >
                            {locale === 'ar' ? 'عرض الملف الشخصي' : 'View Member Profile'}
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
