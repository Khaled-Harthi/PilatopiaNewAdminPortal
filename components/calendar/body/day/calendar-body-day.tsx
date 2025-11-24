import CalendarBodyDayCalendar from './calendar-body-day-calendar'
import CalendarBodyDayEvents from './calendar-body-day-events'
import { useCalendarContext } from '../../calendar-context'
import CalendarBodyDayContent from './calendar-body-day-content'
import CalendarBodyMarginDayMargin from './calendar-body-margin-day-margin'
import { useEffect, useRef } from 'react'

export default function CalendarBodyDay() {
  const { date } = useCalendarContext()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to 2 PM (14:00) on mount
  useEffect(() => {
    // Use setTimeout to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        // 2 PM is hour 14, which is index 6 in our 8-23 range (14 - 8 = 6)
        // Each hour cell is h-32 (128px in Tailwind)
        const hourHeight = 128 // h-32 in pixels
        const targetHourIndex = 6 // 2 PM (14:00)
        // Position 2 PM at the top of the viewport
        const scrollPosition = targetHourIndex * hourHeight
        scrollContainerRef.current.scrollTop = scrollPosition
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex divide-x flex-grow overflow-hidden h-full">
      <div className="flex flex-col flex-grow divide-y overflow-hidden h-full">
        <div className="relative flex-1 overflow-hidden">
          {/* Scrollable content */}
          <div ref={scrollContainerRef} className="h-full overflow-y-auto overflow-x-hidden relative">
            <div className="relative flex flex-1 divide-x">
              <CalendarBodyMarginDayMargin />
              <CalendarBodyDayContent date={date} />
            </div>
          </div>

          {/* Bottom border line */}
          <div className="absolute bottom-0 left-0 right-0 border-t pointer-events-none z-20" />
        </div>
      </div>
      <div className="lg:flex hidden flex-col flex-grow divide-y max-w-[276px]">
        <CalendarBodyDayCalendar />
        <CalendarBodyDayEvents />
      </div>
    </div>
  )
}
