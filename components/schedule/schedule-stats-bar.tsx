'use client';

import { useMemo } from 'react';
import type { PilatesClass } from '@/lib/schedule/types';

interface ScheduleStatsBarProps {
  classes: PilatesClass[];
  locale: string;
}

export function ScheduleStatsBar({ classes, locale }: ScheduleStatsBarProps) {
  const stats = useMemo(() => {
    if (classes.length === 0) {
      return {
        totalBookings: 0,
        totalCapacity: 0,
        fillRate: 0,
        totalClasses: 0,
        classTypeBreakdown: [],
        instructorBreakdown: [],
      };
    }

    let totalBookings = 0;
    let totalCapacity = 0;
    const classTypeMap = new Map<string, { bookings: number; capacity: number; count: number }>();
    const instructorMap = new Map<string, { count: number; name: string }>();

    classes.forEach((cls) => {
      const bookings = Number(cls.booked_seats) || 0;
      const capacity = Number(cls.capacity) || 0;
      totalBookings += bookings;
      totalCapacity += capacity;

      // Class type stats
      const classType = cls.name || cls.class_type || 'Unknown';
      const existing = classTypeMap.get(classType) || { bookings: 0, capacity: 0, count: 0 };
      classTypeMap.set(classType, {
        bookings: existing.bookings + bookings,
        capacity: existing.capacity + capacity,
        count: existing.count + 1,
      });

      // Instructor stats
      const instructor = cls.instructor || 'Unknown';
      const existingInstructor = instructorMap.get(instructor) || { count: 0, name: instructor };
      instructorMap.set(instructor, {
        count: existingInstructor.count + 1,
        name: instructor,
      });
    });

    // Calculate fill rate for each class type
    const classTypeBreakdown = Array.from(classTypeMap.entries())
      .map(([name, data]) => ({
        name,
        fillRate: data.capacity > 0 ? Math.round((data.bookings / data.capacity) * 100) : 0,
        count: data.count,
        bookings: data.bookings,
        capacity: data.capacity,
      }))
      .sort((a, b) => b.count - a.count);

    // Top instructors by class count
    const instructorBreakdown = Array.from(instructorMap.values())
      .sort((a, b) => b.count - a.count);

    return {
      totalBookings,
      totalCapacity,
      fillRate: totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0,
      totalClasses: classes.length,
      classTypeBreakdown,
      instructorBreakdown,
    };
  }, [classes]);

  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
          {/* Overview Stats */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {locale === 'ar' ? 'نظرة عامة' : 'Overview'}
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-2xl font-semibold">{stats.totalClasses}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {locale === 'ar' ? 'حصة' : 'classes'}
                </span>
              </div>
              <div className="text-muted-foreground">·</div>
              <div>
                <span className="text-2xl font-semibold">{stats.fillRate}%</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {locale === 'ar' ? 'امتلاء' : 'fill rate'}
                </span>
              </div>
              <div className="text-muted-foreground">·</div>
              <div>
                <span className="text-lg font-medium">{stats.totalBookings}</span>
                <span className="text-sm text-muted-foreground">/{stats.totalCapacity}</span>
                <span className="text-sm text-muted-foreground ml-1">
                  {locale === 'ar' ? 'حجوزات' : 'bookings'}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-12 w-px bg-border" />

          {/* Class Types */}
          <div className="space-y-1 flex-1 min-w-[200px]">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {locale === 'ar' ? 'أنواع الحصص' : 'Class Types'}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {stats.classTypeBreakdown.map((type) => (
                <div key={type.name} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{type.name}</span>
                  <span className="text-muted-foreground">
                    {type.count} ({type.fillRate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          {stats.instructorBreakdown.length > 0 && (
            <div className="hidden lg:block h-12 w-px bg-border" />
          )}

          {/* Instructors */}
          {stats.instructorBreakdown.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {locale === 'ar' ? 'المدربين' : 'Instructors'}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {stats.instructorBreakdown.map((instructor) => (
                  <div key={instructor.name} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{instructor.name}</span>
                    <span className="text-muted-foreground">
                      {instructor.count} {locale === 'ar' ? 'حصص' : 'classes'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
