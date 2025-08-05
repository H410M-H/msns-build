"use client"

import { useState, useCallback, useMemo } from "react"
import { EVENT_TYPES } from "./event-colors"
import EventIndicator from "./event-indicator"
import EventDetailsModal, { type EventDetails } from "./event-details-modal"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

const SAMPLE_EVENTS: EventDetails[] = [
  // ... (same as original)
]

export default function SampleEvents() {
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleEventClick = useCallback((event: EventDetails): void => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }, [])

  const handleEdit = useCallback((event: EventDetails): void => {
    console.log("Edit event:", event)
    setIsDetailsOpen(false)
  }, [])

  const handleDelete = useCallback((eventId: number): void => {
    console.log("Delete event:", eventId)
  }, [])

  const handleDuplicate = useCallback((event: EventDetails): void => {
    console.log("Duplicate event:", event)
    setIsDetailsOpen(false)
  }, [])

  const renderedEvents = useMemo(() => {
    return SAMPLE_EVENTS.map((event) => {
      const eventColor = EVENT_TYPES.find((type) => type.id === event.type)!
      return (
        <div
          key={event.id}
          onClick={() => handleEventClick(event)}
          className={`p-4 rounded-lg ${eventColor.bgColor} ${eventColor.borderColor} border transition-all hover:scale-[1.01] cursor-pointer group`}
        >
          <div className="flex items-start gap-3">
            <EventIndicator eventType={event.type} size="md" />
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${eventColor.color} mb-1 group-hover:underline`}>{event.title}</div>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.startTime} - {event.endTime}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{event.description}</p>
              )}
            </div>
            <EventIndicator eventType={event.type} showLabel />
          </div>
        </div>
      )
    })
  }, [handleEventClick])

  return (
    <>
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderedEvents}
        </CardContent>
      </Card>
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        event={selectedEvent}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </>
  )
}