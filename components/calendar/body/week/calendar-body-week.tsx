import { useCalendarContext } from '../../calendar-context'
import { startOfWeek, addDays } from 'date-fns'
import CalendarBodyMarginDayMargin from '../day/calendar-body-margin-day-margin'
import CalendarBodyDayContent from '../day/calendar-body-day-content'
import { useEffect, useRef } from 'react'

export default function CalendarBodyWeek() {
  const { date } = useCalendarContext()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

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
            <div className="relative flex flex-1 divide-x flex-col md:flex-row min-h-full">
              <CalendarBodyMarginDayMargin className="hidden md:block" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className="flex flex-1 divide-x md:divide-x-0"
                >
                  <CalendarBodyMarginDayMargin className="block md:hidden" />
                  <CalendarBodyDayContent date={day} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom border line */}
          <div className="absolute bottom-0 left-0 right-0 border-t pointer-events-none z-20" />
        </div>
      </div>
    </div>
  )
}
