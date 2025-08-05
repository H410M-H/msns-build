"use client"

import React, { useState, useCallback, useMemo } from "react"
import dayjs from "dayjs"
import { Calendar, Clock, MapPin, Users, Tag } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { EVENT_TYPES, getEventTypeColor } from "./event-colors"

export interface EventFormData {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  eventType: string
  attendees: string
  priority: string
  recurring: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onCreate: (formData: EventFormData) => void
}

export default function EventModal({
  isOpen,
  onClose,
  selectedDate,
  onCreate,
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: dayjs(selectedDate).format("YYYY-MM-DD"),
    startTime: "",
    endTime: "",
    location: "",
    eventType: "",
    attendees: "",
    priority: "medium",
    recurring: "none",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = useCallback((field: keyof EventFormData, value: string): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        onCreate(formData)
        setFormData({
          title: "",
          description: "",
          date: dayjs(selectedDate).format("YYYY-MM-DD"),
          startTime: "",
          endTime: "",
          location: "",
          eventType: "",
          attendees: "",
          priority: "medium",
          recurring: "none",
        })
        onClose()
      } catch (error) {
        console.error("Error creating event:", error)
        alert("Failed to create event. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, selectedDate, onCreate, onClose]
  )

  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  const eventPreview = useMemo(() => {
    if (!formData.eventType) return null
    const eventColor = getEventTypeColor(formData.eventType)
    return (
      <div className="space-y-2">
        <Label>Event Preview</Label>
        <div
          className={`p-4 rounded-lg ${eventColor.bgColor} ${eventColor.borderColor} border`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full bg-current ${eventColor.color}`}
            />
            <div>
              <div className={`font-medium ${eventColor.color}`}>
                {formData.title || "Event Title"}
              </div>
              <div className="text-xs text-gray-400">
                {formData.date} • {formData.startTime} - {formData.endTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }, [formData])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Create New Event
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter event title"
              className="bg-gray-700 border-gray-600 focus:border-blue-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter event description"
              className="bg-gray-700 border-gray-600 focus:border-blue-500 min-h-[100px]"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="bg-gray-700 border-gray-600 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-400">
                {formatDate(new Date(formData.date))}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="bg-gray-700 border-gray-600 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="bg-gray-700 border-gray-600 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Enter location or 'Online'"
              className="bg-gray-700 border-gray-600 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventType" className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Event Type *
            </Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => handleInputChange("eventType", value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendees" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Max Attendees
            </Label>
            <Input
              id="attendees"
              type="number"
              value={formData.attendees}
              onChange={(e) => handleInputChange("attendees", e.target.value)}
              placeholder="Enter max attendees"
              className="bg-gray-700 border-gray-600 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange("priority", value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurring">Recurring *</Label>
            <Select
              value={formData.recurring}
              onValueChange={(value) => handleInputChange("recurring", value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500">
                <SelectValue placeholder="Select recurrence" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {eventPreview}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
