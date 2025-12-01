'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClassDetailsModal } from './ClassDetailsModal';
import apiClient from '@/lib/axios';

interface ClassData {
  class: {
    id: number;
    name: string;
    time: string;
    instructor: string;
    capacity: number;
    booking_count: number;
  };
  attendance: {
    stats: {
      total: number;
      present: number;
      absent: number;
      late: number;
      not_recorded: number;
    };
  };
}

interface DailyResponse {
  success: boolean;
  date: string;
  total_classes: number;
  classes: ClassData[];
}

export function DailyAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState<DailyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const loadClasses = async (date: Date) => {
    setIsLoading(true);
    try {
      // Format date in local timezone to avoid UTC offset issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const response = await apiClient.get<DailyResponse>(`/admin/attendance/daily`, {
        params: { date: dateStr }
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses(selectedDate);
  }, [selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Date Navigator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Daily Classes
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="px-4 py-2 text-sm font-medium border rounded-md min-w-[280px] text-center">
            {formatDisplayDate(selectedDate)}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading classes...</div>
      ) : data?.classes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No classes scheduled for this date</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.classes.map((classData) => {
            const { class: classInfo, attendance } = classData;
            const isFull = classInfo.booking_count >= classInfo.capacity;

            return (
              <Card key={classInfo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{classInfo.name}</span>
                    {isFull && <Badge variant="destructive">Full</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{formatTime(classInfo.time)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Instructor</span>
                      <span className="font-medium">{classInfo.instructor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Bookings
                      </span>
                      <span className="font-medium">
                        {classInfo.booking_count} / {classInfo.capacity}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Stats */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-medium">
                        {attendance.stats.present} / {attendance.stats.total}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        ✓ {attendance.stats.present} Present
                      </Badge>
                      {attendance.stats.not_recorded > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {attendance.stats.not_recorded} Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={() => setSelectedClassId(classInfo.id)}
                  >
                    Manage Attendance
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClassId && (
        <ClassDetailsModal
          classId={selectedClassId}
          onClose={() => setSelectedClassId(null)}
          onUpdate={() => loadClasses(selectedDate)}
        />
      )}
    </div>
  );
}
