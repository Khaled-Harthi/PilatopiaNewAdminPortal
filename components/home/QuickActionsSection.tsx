'use client';

import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AddMemberDialog } from './AddMemberDialog';

export function QuickActionsSection() {
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href="/schedule">
            <Plus className="h-4 w-4 mr-1" />
            Add Booking
          </Link>
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

      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
      />
    </>
  );
}
