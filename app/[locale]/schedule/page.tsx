'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { startOfWeek, addDays, previousSunday, format } from 'date-fns';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { GlobalSearch } from '@/components/GlobalSearch';
import { ScheduleHeader } from '@/components/schedule/schedule-header';
import { ScheduleToolbar, type HourRangeMode } from '@/components/schedule/schedule-toolbar';
import { ScheduleGrid } from '@/components/schedule/schedule-grid';
import { ScheduleMobileList } from '@/components/schedule/schedule-mobile-list';
import { DeleteClassDialog } from '@/components/schedule/delete-class-dialog';
import { useClasses } from '@/lib/schedule/hooks';
import type { PilatesClass } from '@/lib/schedule/types';

export default function SchedulePage() {
  const router = useRouter();
  const locale = useLocale();
  const sidebarSide = locale === 'ar' ? 'right' : 'left';

  // Initialize to current week (starting from last/previous Sunday)
  const getInitialWeek = () => {
    const today = new Date();
    if (today.getDay() === 0) return today; // If today is Sunday
    return previousSunday(today);
  };

  // State
  const [currentWeek, setCurrentWeek] = useState<Date>(getInitialWeek());
  const [hourRangeMode, setHourRangeMode] = useState<HourRangeMode>('auto');

  // Filters
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);

  // Dialogs
  const [selectedClassData, setSelectedClassData] = useState<PilatesClass | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Calculate date range for API
  // Use format() instead of toISOString() to preserve local timezone
  const { startDate, endDate } = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
    const weekEnd = addDays(weekStart, 6);
    return {
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
    };
  }, [currentWeek]);

  // Fetch classes
  const { data: classesData, isLoading } = useClasses(startDate, endDate);

  // Load hour range preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('schedule-hour-range');
    if (saved && ['auto', 'peak', 'all'].includes(saved)) {
      setHourRangeMode(saved as HourRangeMode);
    }
  }, []);

  // Save hour range preference
  useEffect(() => {
    localStorage.setItem('schedule-hour-range', hourRangeMode);
  }, [hourRangeMode]);

  // Extract filter options from classes
  const filterOptions = useMemo(() => {
    const classes = classesData?.classes || [];
    const instructors = [...new Set(classes.map((c) => c.instructor).filter((x): x is string => Boolean(x)))].sort();
    const classTypes = [...new Set(classes.map((c) => c.name || c.class_type).filter((x): x is string => Boolean(x)))].sort();
    return { instructors, classTypes };
  }, [classesData?.classes]);

  // Apply filters to classes
  const filteredClasses = useMemo(() => {
    const classes = classesData?.classes || [];
    return classes.filter((cls) => {
      if (selectedInstructors.length > 0 && !selectedInstructors.includes(cls.instructor)) {
        return false;
      }
      const classType = cls.name || cls.class_type || '';
      if (selectedClassTypes.length > 0 && !selectedClassTypes.includes(classType)) {
        return false;
      }
      return true;
    });
  }, [classesData?.classes, selectedInstructors, selectedClassTypes]);

  // Handlers
  const handleAddClick = () => {
    router.push(`/${locale}/schedule/bulk-create`);
  };

  const handleDeleteClass = (classData: PilatesClass) => {
    setSelectedClassData(classData);
    setDeleteDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <AppSidebar side={sidebarSide} />
          <SidebarInset>
            <div className="min-h-screen bg-background flex flex-col">
              <ScheduleHeader locale={locale} />
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {locale === 'ar' ? 'جاري التحميل...' : 'Loading schedule...'}
                </p>
              </div>
            </div>
          </SidebarInset>
          <GlobalSearch />
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar side={sidebarSide} />
        <SidebarInset>
          <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <ScheduleHeader locale={locale} />

            {/* Toolbar */}
            <ScheduleToolbar
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
              instructorOptions={filterOptions.instructors}
              classTypeOptions={filterOptions.classTypes}
              selectedInstructors={selectedInstructors}
              selectedClassTypes={selectedClassTypes}
              onInstructorsChange={setSelectedInstructors}
              onClassTypesChange={setSelectedClassTypes}
              hourRangeMode={hourRangeMode}
              onHourRangeModeChange={setHourRangeMode}
              onAddClick={handleAddClick}
              locale={locale}
            />

            {/* Desktop: Main Grid */}
            <main className="hidden md:flex flex-1 container mx-auto px-6 py-4 flex-col">
              <ScheduleGrid
                classes={filteredClasses}
                currentWeek={currentWeek}
                hourRangeMode={hourRangeMode}
                onClassClick={() => {}} // No longer used, popover handles this
                onDeleteClass={handleDeleteClass}
                onBulkCreate={handleAddClick}
                locale={locale}
              />
            </main>

            {/* Mobile: List View */}
            <main className="md:hidden flex-1 container mx-auto px-4 py-4 overflow-auto">
              <ScheduleMobileList
                classes={filteredClasses}
                weekStart={startOfWeek(currentWeek, { weekStartsOn: 0 })}
                onDeleteClass={handleDeleteClass}
                onAddClick={handleAddClick}
                locale={locale}
              />
            </main>

            {/* Delete Class Dialog */}
            <DeleteClassDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              classData={selectedClassData}
            />
          </div>
        </SidebarInset>
        <GlobalSearch />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
