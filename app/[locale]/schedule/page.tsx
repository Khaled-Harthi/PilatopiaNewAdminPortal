'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ScheduleCalendar } from '@/components/schedule/schedule-calendar-new';
import { RegistrationModal } from '@/components/schedule/registration-modal';
import { CreateClassSheet } from '@/components/schedule/create-class-sheet';
import { BulkClassSheet } from '@/components/schedule/bulk-class-sheet';
import { EditClassSheet } from '@/components/schedule/edit-class-sheet';
import { DeleteClassDialog } from '@/components/schedule/delete-class-dialog';
import type { PilatesClass } from '@/lib/schedule/types';

export default function SchedulePage() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedClassData, setSelectedClassData] = useState<PilatesClass | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [createClassSheetOpen, setCreateClassSheetOpen] = useState(false);
  const [bulkClassSheetOpen, setBulkClassSheetOpen] = useState(false);
  const [editClassSheetOpen, setEditClassSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  const handleClassClick = (classData: PilatesClass) => {
    setSelectedClassId(classData.id);
    setSelectedClassData(classData);
    setRegistrationModalOpen(true);
  };

  const handleRegistrationModalChange = (open: boolean) => {
    setRegistrationModalOpen(open);
    if (!open) {
      // Clear selection when modal closes to prevent reopening
      setSelectedClassId(null);
      setSelectedClassData(null);
    }
  };

  const handleQuickAdd = (date: Date) => {
    setSelectedDate(date);
    // Extract time from date (in HH:mm format)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setSelectedTime(`${hours}:${minutes}`);
    setCreateClassSheetOpen(true);
  };

  const handleAddSchedule = () => {
    // Open bulk class sheet for creating multiple classes
    setBulkClassSheetOpen(true);
  };

  const handleEditClass = (classData: PilatesClass) => {
    setSelectedClassData(classData);
    setEditClassSheetOpen(true);
  };

  const handleDeleteClass = (classData: PilatesClass) => {
    setSelectedClassData(classData);
    setDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <ScheduleCalendar
          onClassClick={handleClassClick}
          onQuickAdd={handleQuickAdd}
          onAddSchedule={handleAddSchedule}
          onEditClass={handleEditClass}
          onDeleteClass={handleDeleteClass}
        />

        <RegistrationModal
          classId={selectedClassId}
          open={registrationModalOpen}
          onOpenChange={handleRegistrationModalChange}
        />

        <CreateClassSheet
          open={createClassSheetOpen}
          onOpenChange={setCreateClassSheetOpen}
          defaultDate={selectedDate}
          defaultTime={selectedTime}
        />

        <BulkClassSheet
          open={bulkClassSheetOpen}
          onOpenChange={setBulkClassSheetOpen}
        />

        <EditClassSheet
          open={editClassSheetOpen}
          onOpenChange={setEditClassSheetOpen}
          classData={selectedClassData}
        />

        <DeleteClassDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          classData={selectedClassData}
        />
      </div>
    </DashboardLayout>
  );
}
