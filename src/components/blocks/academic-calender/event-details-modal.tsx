"use client"

import { useState, useCallback, useMemo } from "react"
import { Calendar, Clock, MapPin, Users, Bell, User, FileText, X } from 'lucide-react'
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import EventIndicator from "./event-indicator"
import { getEventTypeColor, type EventType } from "./event-colors"

export interface EventDetails {
  id: number
  title: string
  description?: string
  type: string
  date: string
  startTime: string
  endTime: string
  location?: string
  attendees?: number
  priority: "low" | "medium" | "high" | "urgent"
  recurring: string
  organizer?: string
  status: "confirmed" | "tentative" | "cancelled"
  reminders?: string[]
  notes?: string
}

interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: EventDetails | null
  onEdit?: (event: EventDetails) => void
  onDelete?: (eventId: number) => void
  onDuplicate?: (event: EventDetails) => void
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  event,
}: EventDetailsModalProps) {
  const [] = useState(false)

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString)
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

  const getDuration = useCallback((): string => {
    if (!event) return ""
    const start = new Date(`2000-01-01T${event.startTime}`)
    const end = new Date(`2000-01-01T${event.endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours === 0) {
      return `${diffMinutes} minutes`
    } else if (diffMinutes === 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
    } else {
      return `${diffHours}h ${diffMinutes}m`
    }
  }, [event])

  const getPriorityColor = useCallback((priority: string): string => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }, [])

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500"
      case "tentative":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500"
    }
  }, [])

  const eventColor = useMemo((): EventType => {
    if (!event) {
      return {
        id: "other",
        label: "Other",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500",
        description: "Miscellaneous events and activities",
      }
    }
    return getEventTypeColor(event.type) ?? {
      id: "other",
      label: "Other",
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      borderColor: "border-gray-500",
      description: "Miscellaneous events and activities",
    }
  }, [event])

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <EventIndicator eventType={event.type} size="md" />
            <span className="flex-1">{event.title}</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className={`p-4 rounded-lg ${eventColor.bgColor} ${eventColor.borderColor} border`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <EventIndicator eventType={event.type} showLabel />
              </div>
              <div className="flex gap-2">
                <Badge className={`${getPriorityColor(event.priority)} border`}>
                  {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                </Badge>
                <Badge className={`${getStatusColor(event.status)} border`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </Badge>
              </div>
            </div>
            {event.description && <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Date & Time
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4" />
                  <span className="text-gray-400">Duration: {getDuration()}</span>
                </div>
                {event.recurring !== "none" && (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4" />
                    <span className="text-gray-400">
                      Repeats: {event.recurring.charAt(0).toUpperCase() + event.recurring.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Details
              </h3>
              <div className="space-y-3 text-sm">
                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{event.location}</span>
                  </div>
                )}
                {event.attendees && (
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{event.attendees} attendees expected</span>
                  </div>
                )}
                {event.organizer && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Organized by {event.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {(event.reminders?.length ?? event.notes) && (
            <>
              <Separator className="bg-gray-700" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Additional Information
                </h3>
                {event.reminders?.length && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Reminders:</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {event.reminders.map((reminder, index) => (
                        <div key={index} className="text-sm text-gray-400">
                          • {reminder}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {event.notes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">Notes:</span>
                    </div>
                    <div className="ml-6 text-sm text-gray-400 leading-relaxed">{event.notes}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}