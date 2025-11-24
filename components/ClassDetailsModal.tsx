'use client';

import { useState, useEffect } from 'react';
import { X, Users, Clock, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/axios';

interface Booking {
  booking_id: number;
  user_id: number;
  user_name: string;
  phone_number: string;
  attendance_id: number | null;
  check_in_time: string | null;
  notes: string | null;
}

interface ClassDetails {
  class: {
    id: number;
    name: string;
    type: string;
    instructor_name: string;
    capacity: number;
    schedule_time: string;
    duration_minutes: number;
    booked_seats: number;
  };
  total_bookings: number;
  bookings: Booking[];
}

interface ClassDetailsModalProps {
  classId: number;
  onClose: () => void;
  onUpdate: () => void;
}

export function ClassDetailsModal({ classId, onClose, onUpdate }: ClassDetailsModalProps) {
  const [data, setData] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState<Record<number, boolean>>({});

  const loadClassDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ClassDetails>(`/admin/attendance/classes/${classId}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load class details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClassDetails();
  }, [classId]);

  const handleCheckIn = async (userId: number) => {
    setCheckingIn((prev) => ({ ...prev, [userId]: true }));
    try {
      await apiClient.post(`/admin/attendance/classes/${classId}/users/${userId}`);
      await loadClassDetails();
      onUpdate();
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckingIn((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatCheckInTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (!data) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="py-8 text-center text-muted-foreground">
            Loading...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { class: classInfo, bookings } = data;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{classInfo.name}</DialogTitle>
          <DialogDescription>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(classInfo.schedule_time)} ({classInfo.duration_minutes} min)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>Instructor: {classInfo.instructor_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">
                  {classInfo.booked_seats} / {classInfo.capacity} seats
                </Badge>
                <Badge variant="secondary">{classInfo.type}</Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <h3 className="font-semibold mb-4">Bookings ({bookings.length})</h3>

          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bookings for this class
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{booking.user_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.phone_number}
                    </div>
                    {booking.check_in_time && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Checked in at {formatCheckInTime(booking.check_in_time)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.attendance_id ? (
                      <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Attended
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(booking.user_id)}
                        disabled={checkingIn[booking.user_id]}
                      >
                        {checkingIn[booking.user_id] ? 'Checking in...' : 'Check-in'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
