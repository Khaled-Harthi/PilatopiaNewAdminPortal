'use client';

import { useState, useMemo } from 'react';
import { startOfWeek, previousSunday } from 'date-fns';
import { ScheduleWeekTable } from './schedule-week-table';
import { StatCard } from './stat-card';
import { MultiSelectFilter } from './multi-select-filter';
import { ClassLegend } from './class-legend';
import type { PilatesClass } from '@/lib/schedule/types';
import { Calendar, TrendingUp, User, Award } from 'lucide-react';

interface ScheduleOverviewProps {
  classes: PilatesClass[];
  onQuickAdd?: (date: Date, hour: number) => void;
  onEditClass?: (classData: PilatesClass) => void;
  onDeleteClass?: (classData: PilatesClass) => void;
  locale: string;
}

export function ScheduleOverview({
  classes,
  onQuickAdd,
  onEditClass,
  onDeleteClass,
  locale,
}: ScheduleOverviewProps) {
  // Initialize to last/previous Sunday
  const getInitialWeek = () => {
    const today = new Date();
    if (today.getDay() === 0) return today; // If today is Sunday
    return previousSunday(today);
  };

  const [currentWeek, setCurrentWeek] = useState<Date>(getInitialWeek());
  const [filters, setFilters] = useState<{
    instructors: string[];
    classTypes: string[];
    status: string[];
  }>({
    instructors: [],
    classTypes: [],
    status: [],
  });

  // Extract filter options
  const filterOptions = useMemo(() => {
    const instructors = [...new Set(classes.map(c => c.instructor).filter(Boolean))].sort();
    const classTypes = [...new Set(classes.map(c => c.name || c.class_type || 'Unknown').filter((x): x is string => !!x))].sort();
    return { instructors, classTypes };
  }, [classes]);

  // Apply filters
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      // Instructor filter
      if (filters.instructors.length > 0 && !filters.instructors.includes(cls.instructor)) {
        return false;
      }

      // Class type filter
      const classType = cls.name || cls.class_type || 'Unknown';
      if (filters.classTypes.length > 0 && !filters.classTypes.includes(classType)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        const fillPercentage = (cls.booked_seats / cls.capacity) * 100;
        let status = '';
        if (fillPercentage === 0) status = 'empty';
        else if (fillPercentage < 50) status = 'low';
        else if (fillPercentage < 75) status = 'medium';
        else if (fillPercentage < 100) status = 'high';
        else status = 'full';

        if (!filters.status.includes(status)) return false;
      }

      return true;
    });
  }, [classes, filters]);

  // Statistics for top stat cards
  const stats = useMemo(() => {
    const instructorMap = new Map<string, { count: number; bookings: number; capacity: number }>();
    const classTypeMap = new Map<string, { count: number; bookings: number; capacity: number }>();

    let totalBookings = 0;
    let totalCapacity = 0;

    filteredClasses.forEach(cls => {
      totalBookings += Number(cls.booked_seats) || 0;
      totalCapacity += Number(cls.capacity) || 0;

      // Instructors
      const existing = instructorMap.get(cls.instructor) || { count: 0, bookings: 0, capacity: 0 };
      instructorMap.set(cls.instructor, {
        count: existing.count + 1,
        bookings: existing.bookings + (Number(cls.booked_seats) || 0),
        capacity: existing.capacity + (Number(cls.capacity) || 0),
      });

      // Class types
      const classType = cls.name || cls.class_type || 'Unknown';
      const existingType = classTypeMap.get(classType) || { count: 0, bookings: 0, capacity: 0 };
      classTypeMap.set(classType, {
        count: existingType.count + 1,
        bookings: existingType.bookings + (Number(cls.booked_seats) || 0),
        capacity: existingType.capacity + (Number(cls.capacity) || 0),
      });
    });

    // Top instructor by class count
    const topInstructor = Array.from(instructorMap.entries())
      .map(([name, data]) => ({ name, count: data.count }))
      .sort((a, b) => b.count - a.count)[0];

    // Most popular class type by utilization
    const topClass = Array.from(classTypeMap.entries())
      .map(([name, data]) => ({
        name,
        utilization: data.capacity > 0 ? Math.round((data.bookings / data.capacity) * 100) : 0,
      }))
      .sort((a, b) => b.utilization - a.utilization)[0];

    // Average capacity percentage
    const avgCapacity = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

    return {
      totalClasses: filteredClasses.length,
      avgCapacity,
      topInstructor,
      topClass,
    };
  }, [filteredClasses]);

  const handleFilterChange = (category: 'instructors' | 'classTypes' | 'status', selected: string[]) => {
    setFilters(prev => ({ ...prev, [category]: selected }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={locale === 'ar' ? 'الحصص هذا الأسبوع' : 'This Week'}
          value={stats.totalClasses}
          subtitle={locale === 'ar' ? 'حصص مجدولة' : 'scheduled classes'}
          icon={Calendar}
        />
        <StatCard
          label={locale === 'ar' ? 'متوسط الحجز' : 'Avg. Capacity'}
          value={`${stats.avgCapacity}%`}
          subtitle={locale === 'ar' ? 'معدل الامتلاء' : 'fill rate'}
          icon={TrendingUp}
        />
        <StatCard
          label={locale === 'ar' ? 'أفضل مدرب' : 'Top Instructor'}
          value={stats.topInstructor?.name || '-'}
          subtitle={stats.topInstructor ? `${stats.topInstructor.count} ${locale === 'ar' ? 'حصص' : 'classes'}` : undefined}
          icon={User}
        />
        <StatCard
          label={locale === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
          value={stats.topClass?.name || '-'}
          subtitle={stats.topClass ? `${stats.topClass.utilization}% ${locale === 'ar' ? 'امتلاء' : 'filled'}` : undefined}
          icon={Award}
        />
      </div>

      {/* Filters Bar and Legend */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <MultiSelectFilter
            label={locale === 'ar' ? 'المدربين' : 'Instructors'}
            options={filterOptions.instructors}
            selected={filters.instructors}
            onChange={(selected) => handleFilterChange('instructors', selected)}
            placeholder={locale === 'ar' ? 'الكل' : 'All'}
          />
          <MultiSelectFilter
            label={locale === 'ar' ? 'أنواع الحصص' : 'Class Types'}
            options={filterOptions.classTypes}
            selected={filters.classTypes}
            onChange={(selected) => handleFilterChange('classTypes', selected)}
            placeholder={locale === 'ar' ? 'الكل' : 'All'}
          />
          <MultiSelectFilter
            label={locale === 'ar' ? 'الحالة' : 'Status'}
            options={['empty', 'low', 'medium', 'high', 'full']}
            selected={filters.status}
            onChange={(selected) => handleFilterChange('status', selected)}
            placeholder={locale === 'ar' ? 'الكل' : 'All'}
          />
        </div>
        <div className="ml-auto">
          <ClassLegend classes={filteredClasses} locale={locale} />
        </div>
      </div>

      {/* Full Width Table */}
      <ScheduleWeekTable
        classes={filteredClasses}
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        onQuickAdd={onQuickAdd}
        onEditClass={onEditClass}
        onDeleteClass={onDeleteClass}
        locale={locale}
      />
    </div>
  );
}
