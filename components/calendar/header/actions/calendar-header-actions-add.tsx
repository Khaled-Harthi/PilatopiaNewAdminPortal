import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCalendarContext } from '../../calendar-context'

export default function CalendarHeaderActionsAdd() {
  const { setNewEventDialogOpen } = useCalendarContext()
  return (
    <Button
      onClick={() => setNewEventDialogOpen(true)}
    >
      <Plus className="h-4 w-4" />
      Add Schedule
    </Button>
  )
}
