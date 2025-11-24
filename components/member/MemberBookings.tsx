'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/axios';

interface Booking {
  id: string;
  class_name: string;
  schedule_time: string;
  duration_minutes: number;
  instructor_name: string;
  class_type: string;
  booked_seats: number;
  capacity: number;
}

interface BookingsResponse {
  bookings: Booking[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

interface AvailableClass {
  id: number;
  name: string;
  schedule_time: string;
  instructor_name: string;
  available_seats: number;
}

export function MemberBookings({ memberId }: { memberId: string }) {
  const t = useTranslations('MemberProfile.Bookings');
  const tCommon = useTranslations('Common');

  const [data, setData] = useState<BookingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const loadBookings = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<BookingsResponse>(
        `/admin/members/${memberId}/bookings`,
        { params: { page, limit: 10 } }
      );
      setData(response.data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings(currentPage);
  }, [memberId, currentPage]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Check if today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return `Today, ${timeStr}`;
    }

    // Check if tomorrow
    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow, ${timeStr}`;
    }

    // Calculate days difference
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

    if (diffDays > 0) {
      return `${dateFormatted}, ${timeStr} (in ${diffDays} days)`;
    } else {
      return `${dateFormatted}, ${timeStr}`;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t('alerts.confirmCancel'))) {
      return;
    }

    try {
      await apiClient.delete(`/admin/members/${memberId}/bookings/${bookingId}`);
      loadBookings(currentPage);
    } catch (error: any) {
      alert(error.response?.data?.error || t('alerts.cancelFailed'));
      console.error(t('alerts.cancelFailed'), error);
    }
  };

  const loadAvailableClasses = async (date: Date) => {
    setIsLoadingClasses(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await apiClient.get('/admin/schedules/classes/by-date-range', {
        params: { startDate: dateStr, endDate: dateStr }
      });
      setAvailableClasses(response.data.classes || []);
    } catch (error) {
      console.error('Failed to load available classes:', error);
      setAvailableClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleCreateBooking = () => {
    setIsDialogOpen(true);
    loadAvailableClasses(selectedDate);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedClassId('');
      loadAvailableClasses(date);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedClassId) {
      alert(t('alerts.selectClass'));
      return;
    }

    setIsCreatingBooking(true);
    try {
      await apiClient.post(`/admin/members/${memberId}/bookings`, {
        classId: parseInt(selectedClassId)
      });
      setIsDialogOpen(false);
      setSelectedClassId('');
      loadBookings(currentPage);
    } catch (error: any) {
      alert(error.response?.data?.error || t('alerts.createFailed'));
      console.error(t('alerts.createFailed'), error);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <Button onClick={handleCreateBooking}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createBooking')}
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      ) : !data || data.bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {t('noBookingsFound')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tableHeaders.className')}</TableHead>
                    <TableHead>{t('tableHeaders.classType')}</TableHead>
                    <TableHead>{t('tableHeaders.dateTime')}</TableHead>
                    <TableHead>{t('tableHeaders.instructor')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bookings.map((booking, index) => (
                    <TableRow key={`${booking.id}-${index}`}>
                      <TableCell className="font-medium">{booking.class_name}</TableCell>
                      <TableCell>{booking.class_type}</TableCell>
                      <TableCell>{formatDateTime(booking.schedule_time)}</TableCell>
                      <TableCell>{booking.instructor_name}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              {t('actions.cancel')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {data.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('pagination.page')} {data.pagination.current_page} {t('pagination.of')} {data.pagination.total_pages} (
                {data.pagination.total_items} {t('pagination.totalBookings')})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('pagination.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(data.pagination.total_pages, p + 1))
                  }
                  disabled={currentPage === data.pagination.total_pages}
                >
                  {t('pagination.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('createDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('createDialog.dateLabel')}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>{t('createDialog.pickDate')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Class Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('createDialog.availableClassesLabel')}</label>
              {isLoadingClasses ? (
                <p className="text-sm text-muted-foreground">{t('createDialog.loadingClasses')}</p>
              ) : availableClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('createDialog.noClassesAvailable')}</p>
              ) : (
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('createDialog.selectClass')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cls.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(cls.schedule_time), 'p')} • {cls.instructor_name} • {cls.available_seats} {t('createDialog.seats')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={!selectedClassId || isCreatingBooking}
            >
              {isCreatingBooking ? t('createDialog.creating') : t('createDialog.createButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
