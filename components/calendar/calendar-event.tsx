import { CalendarEvent as CalendarEventType } from '@/components/calendar/calendar-types'
import { useCalendarContext } from '@/components/calendar/calendar-context'
import { format, isSameDay, isSameMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { motion, MotionConfig, AnimatePresence } from 'framer-motion'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Edit, Trash2 } from 'lucide-react'
import type { PilatesClass } from '@/lib/schedule/types'

interface EventPosition {
  left: string
  width: string
  top: string
  height: string
}

function getOverlappingEvents(
  currentEvent: CalendarEventType,
  events: CalendarEventType[]
): CalendarEventType[] {
  return events.filter((event) => {
    if (event.id === currentEvent.id) return false
    return (
      currentEvent.start < event.end &&
      currentEvent.end > event.start &&
      isSameDay(currentEvent.start, event.start)
    )
  })
}

function calculateEventPosition(
  event: CalendarEventType,
  allEvents: CalendarEventType[]
): EventPosition {
  const overlappingEvents = getOverlappingEvents(event, allEvents)
  const group = [event, ...overlappingEvents].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
  const position = group.indexOf(event)
  const width = `${100 / (overlappingEvents.length + 1)}%`
  const left = `${(position * 100) / (overlappingEvents.length + 1)}%`

  const startHour = event.start.getHours()
  const startMinutes = event.start.getMinutes()

  let endHour = event.end.getHours()
  let endMinutes = event.end.getMinutes()

  if (!isSameDay(event.start, event.end)) {
    endHour = 23
    endMinutes = 59
  }

  // Calendar now starts at 8 AM (hour 8), so we need to offset the position
  const calendarStartHour = 8
  const topPosition = (startHour - calendarStartHour) * 128 + (startMinutes / 60) * 128
  const duration = endHour * 60 + endMinutes - (startHour * 60 + startMinutes)
  const height = (duration / 60) * 128

  return {
    left,
    width,
    top: `${topPosition}px`,
    height: `${height}px`,
  }
}

export default function CalendarEvent({
  event,
  month = false,
  className,
}: {
  event: CalendarEventType
  month?: boolean
  className?: string
}) {
  const { events, setSelectedEvent, setManageEventDialogOpen, date, onEditClass, onDeleteClass } =
    useCalendarContext()
  const style = month ? {} : calculateEventPosition(event, events)

  // Check if this is a Pilates class event with data
  const eventWithData = event as any;
  const hasContextMenu = eventWithData.data && (onEditClass || onDeleteClass);

  // Generate a unique key that includes the current month to prevent animation conflicts
  const isEventInCurrentMonth = isSameMonth(event.start, date)
  const animationKey = `${event.id}-${
    isEventInCurrentMonth ? 'current' : 'adjacent'
  }`

  const eventContent = (
    <motion.div
      className={cn(
        'px-3 py-1.5 rounded-md truncate cursor-pointer transition-colors bg-accent/50 hover:bg-accent',
        !month && 'absolute',
        className
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        // Check if event has custom data (Pilates class)
        const eventWithData = event as any;
        if (eventWithData.data) {
          // For Pilates classes, don't open default dialog
          // The parent component will handle this via onClassClick
          setSelectedEvent(event)
          // Don't open the manage dialog for Pilates events
        } else {
          // For regular calendar events, use default behavior
          setSelectedEvent(event)
          setManageEventDialogOpen(true)
        }
      }}
      initial={{
        opacity: 0,
        y: -3,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.98,
        transition: {
          duration: 0.15,
          ease: 'easeOut',
        },
      }}
      transition={{
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: {
          duration: 0.2,
          ease: 'linear',
        },
        layout: {
          duration: 0.2,
          ease: 'easeOut',
        },
      }}
      layoutId={`event-${animationKey}-${month ? 'month' : 'day'}`}
    >
      <motion.div
        className={cn(
          'flex flex-col w-full text-foreground',
          month && 'flex-row items-center justify-between'
        )}
        layout="position"
      >
        <p className={cn('font-semibold truncate', month && 'text-xs')}>
          {event.title}
        </p>
        <p className={cn('text-sm text-muted-foreground', month && 'text-xs')}>
          <span>{format(event.start, 'h:mm a')}</span>
          <span className={cn('mx-1', month && 'hidden')}>-</span>
          <span className={cn(month && 'hidden')}>
            {format(event.end, 'h:mm a')}
          </span>
        </p>
      </motion.div>
    </motion.div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {hasContextMenu ? (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {eventContent}
            </ContextMenuTrigger>
            <ContextMenuContent>
              {onEditClass && (
                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClass(eventWithData.data);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Class
                </ContextMenuItem>
              )}
              {onDeleteClass && (
                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClass(eventWithData.data);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel Class
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          eventContent
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
