import { useCalendarContext } from '../../calendar-context'
import { isSameDay, setHours } from 'date-fns'
import { hours } from './calendar-body-margin-day-margin'
import CalendarBodyHeader from '../calendar-body-header'
import CalendarEvent from '../../calendar-event'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CalendarBodyDayContent({ date }: { date: Date }) {
  const { events } = useCalendarContext()

  const dayEvents = events.filter((event) => isSameDay(event.start, date))

  const handleQuickAdd = (hour: number) => {
    // Create a new date with the selected day and hour
    // Use the date prop which represents the specific day in the calendar
    const quickAddDate = setHours(new Date(date), hour)

    // Dispatch a custom event that the parent can listen to
    const event = new CustomEvent('calendar-quick-add', {
      detail: { date: quickAddDate },
      bubbles: true,
      composed: true
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="flex flex-col flex-grow">
      <CalendarBodyHeader date={date} />

      <div className="flex-1 relative">
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-32 border-b border-border/50 group relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 z-10"
              onClick={() => handleQuickAdd(hour)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {dayEvents.map((event) => (
          <CalendarEvent key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
