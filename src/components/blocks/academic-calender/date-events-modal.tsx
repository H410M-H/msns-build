"use client"

import { useCallback, useMemo } from "react"
import { Calendar, Clock, MapPin, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import EventIndicator from "./event-indicator"
import type { EventDetails } from "./event-details-modal"
import { getEventTypeColor } from "./event-colors"

interface DateEventsModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  events: EventDetails[]
  onEventClick: (event: EventDetails) => void
}

export default function DateEventsModal({ isOpen, onClose, date, events, onEventClick }: DateEventsModalProps) {
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  const formatTime = useCallback((time: string): string => {
    const [hours = "0", minutes = "0"] = time.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }, [])

  const sortedEvents = useMemo((): EventDetails[] => {
    return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [events])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Events for {formatDate(date)}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No events scheduled for this date</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-400 mb-4">
                {sortedEvents.length} event{sortedEvents.length !== 1 ? "s" : ""} scheduled
              </div>
              {sortedEvents.map((event) => {
                const eventColor = getEventTypeColor(event.type)
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`p-4 rounded-lg ${eventColor.bgColor} ${eventColor.borderColor} border transition-all hover:scale-[1.02] cursor-pointer group`}
                  >
                    <div className="flex items-start gap-3">
                      <EventIndicator eventType={event.type} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${eventColor.color} mb-1 group-hover:underline`}>
                          {event.title}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
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
                      <div className="flex flex-col gap-1">
                        <EventIndicator eventType={event.type} showLabel />
                        {event.priority === "urgent" && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500 border text-xs">Urgent</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}