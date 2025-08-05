"use client"

import { useCallback, useMemo } from "react"
import EventIndicator from "./event-indicator"
import { getEventCountForDate, getEventTypesForDate } from "./event-utils"
import { type EventDetails } from "./event-details-modal"

interface CalendarDateCellProps {
  day: number
  date: Date
  isSelected: boolean
  events: EventDetails[]
  onClick: () => void
  onDateClick: (date: Date) => void
}

export default function CalendarDateCell({
  day,
  date,
  isSelected,
  events,
  onClick,
  onDateClick,
}: CalendarDateCellProps) {
  const eventTypes = useMemo((): string[] => getEventTypesForDate(events, date), [events, date])
  const eventCount = useMemo((): number => getEventCountForDate(events, date), [events, date])
  const hasEvents = eventCount > 0

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    onClick()
    if (hasEvents) onDateClick(date)
  }, [onClick, onDateClick, hasEvents, date])

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
          isSelected
            ? "bg-blue-600 text-white shadow-lg"
            : hasEvents
              ? "text-gray-200 hover:text-white hover:bg-gray-700 hover:scale-105"
              : "text-gray-300 hover:text-white hover:bg-gray-700"
        } ${hasEvents ? "cursor-pointer" : ""}`}
        title={hasEvents ? `${eventCount} event${eventCount !== 1 ? "s" : ""} on this date` : undefined}
      >
        {day}
      </button>
      {hasEvents && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
          {eventTypes.slice(0, 3).map((eventType, index) => (
            <EventIndicator key={`${eventType}-${index}`} eventType={eventType} size="sm" />
          ))}
          {eventTypes.length > 3 && (
            <div className="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">+</span>
            </div>
          )}
        </div>
      )}
      {eventCount > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
          {eventCount > 9 ? "9+" : eventCount}
        </div>
      )}
    </div>
  )
}