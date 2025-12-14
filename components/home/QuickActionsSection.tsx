'use client';

import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddMemberDialog } from './AddMemberDialog';
import { AddBookingDialog } from './AddBookingDialog';

export function QuickActionsSection() {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addBookingOpen, setAddBookingOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setAddBookingOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Booking
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setAddMemberOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          New Member
        </Button>
      </div>

      <AddBookingDialog
        open={addBookingOpen}
        onOpenChange={setAddBookingOpen}
      />
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />
    </>
  );
}
