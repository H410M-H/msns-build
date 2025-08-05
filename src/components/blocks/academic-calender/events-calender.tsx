"use client"

import { useState, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Input } from "~/components/ui/input"
import EventModal, { type EventFormData } from "./event-modal"
import EventColorLegend from "./event-color-legend"
import EventDetailsModal, { type EventDetails } from "./event-details-modal"
import CalendarDateCell from "./calender-date-cell"
import { getEventsForDate } from "./event-utils"
import DateEventsModal from "./date-events-modal"
import { api } from "~/trpc/react"
import { type CreateEventInput } from "~/lib/event-schemas"
import { useSession } from "next-auth/react"



const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Define FrontendEventData based on tRPC response

export default function EventsCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 5)) // July 5, 2025
  const [selectedDate, setSelectedDate] = useState(5)
  const [courseFilter, setCourseFilter] = useState("all")
  const [timelineFilter, setTimelineFilter] = useState("next-7-days")
  const [sortBy, setSortBy] = useState("dates")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventDetails | null>(null)
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false)
  const [dateEventsModalOpen, setDateEventsModalOpen] = useState(false)
  const [selectedDateForEvents, setSelectedDateForEvents] = useState<Date | null>(null)
  const [events, setEvents] = useState<EventDetails[]>(SAMPLE_EVENTS_DATA)
  const session = useSession()

  // tRPC mutation for creating events
  const createEventMutation = api.event.create.useMutation({
    onSuccess: () => {

      setIsModalOpen(false)
    },
    onError: (error) => {
      console.error("Failed to create event:", error)
      alert(`Failed to create event: ${error.message}`)
    },
  })

  const getDaysInMonth = useCallback((date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }, [])

  const getFirstDayOfMonth = useCallback((date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }, [])

  const navigateMonth = useCallback((direction: "prev" | "next"): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }, [])

  const handleDateClick = useCallback((date: Date): void => {
    setSelectedDateForEvents(date)
    setDateEventsModalOpen(true)
  }, [])

  const handleEventClickFromDate = useCallback((event: EventDetails): void => {
    setSelectedEventDetails(event)
    setDateEventsModalOpen(false)
    setIsEventDetailsOpen(true)
  }, [])

  const handleEventEdit = useCallback((event: EventDetails): void => {
    console.log("Edit event:", event)
    setIsEventDetailsOpen(false)
  }, [])

  const handleEventDelete = useCallback((eventId: number): void => {
    console.log("Delete event:", eventId)
    setEvents((prev) => prev.filter((event) => event.id !== eventId))
  }, [])

  const handleEventDuplicate = useCallback((event: EventDetails): void => {
    console.log("Duplicate event:", event)
    setIsEventDetailsOpen(false)
  }, [])

  const handleCreateEvent = useCallback(
    (formData: EventFormData): void => {
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.title) {
        alert("Please fill in all required fields.")
        return
      }


      const startDateTime = `${formData.date}T${formData.startTime}:00Z`
      const endDateTime = `${formData.date}T${formData.endTime}:00Z`
      const eventData: CreateEventInput = {
        title: formData.title,
        description: formData.description ?? undefined,
        startDateTime,
        endDateTime,
        timezone: "UTC",
        location: formData.location ?? undefined,
        isOnline: formData.location.toLowerCase() === "online",
        type: formData.eventType.toUpperCase() as CreateEventInput["type"],
        priority: formData.priority.toUpperCase() as CreateEventInput["priority"],
        status: "CONFIRMED",
        recurring: formData.recurring.toUpperCase() as CreateEventInput["recurring"],
        maxAttendees: formData.attendees ? Number(formData.attendees) : undefined,
        isPublic: false,
        tagIds: [],
        reminders: [],
        attendees: [],
        creatorId: session.data?.user.accountId??"event01",}
         // Replace with actual user ID}
      createEventMutation.mutate(eventData)
    },
    [createEventMutation, session.data?.user.accountId]
  )
  

  const filteredEvents = useMemo((): EventDetails[] => {
    let filtered = events

    if (courseFilter !== "all") {
      filtered = filtered.filter((event) => event.type.toLowerCase() === courseFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (timelineFilter === "next-7-days") {
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= nextWeek
      })
    } else if (timelineFilter === "next-30-days") {
      const now = new Date()
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= nextMonth
      })
    } else if (timelineFilter === "this-month") {
      const now = new Date()
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        )
      })
    }

    if (sortBy === "dates") {
      filtered = filtered.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    } else if (sortBy === "name") {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === "type") {
      filtered = filtered.sort((a, b) => a.type.localeCompare(b.type))
    }

    return filtered
  }, [events, courseFilter, searchQuery, timelineFilter, sortBy])

  const currentMonth = useMemo(() => MONTHS[currentDate.getMonth()], [currentDate])
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate])
  const prevMonth = useMemo(() => MONTHS[currentDate.getMonth() - 1] ?? MONTHS[11], [currentDate])
  const nextMonth = useMemo(() => MONTHS[currentDate.getMonth() + 1] ?? MONTHS[0], [currentDate])

  const selectedDateEvents = useMemo(
    () => (selectedDateForEvents ? getEventsForDate(events, selectedDateForEvents) : []),
    [events, selectedDateForEvents]
  )

  const renderCalendarDays = useCallback((): JSX.Element[] => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days: JSX.Element[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

      days.push(
        <CalendarDateCell
          key={day}
          day={day}
          date={cellDate}
          isSelected={isSelected}
          events={events}
          onClick={() => setSelectedDate(day)}
          onDateClick={handleDateClick}
        />
      )
    }

    return days
  }, [currentDate, selectedDate, handleDateClick, getDaysInMonth, getFirstDayOfMonth, events])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Calendar</h1>
        </div>
        <div className="flex items-center justify-between mb-8">
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All courses</SelectItem>
              <SelectItem value="programming">Programming</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={createEventMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            New event
          </Button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth("prev")}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {prevMonth}
          </button>
          <h2 className="text-xl font-semibold">{currentMonth} {currentYear}</h2>
          <button
            onClick={() => navigateMonth("next")}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            {nextMonth}
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">{renderCalendarDays()}</div>
        </div>
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Calendar Legend:</div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Colored dots = Event types</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span>Number badge = Multiple events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full" />
              <span>Click dates with events to view details</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-8 text-sm text-gray-400">
          <button className="hover:text-white transition-colors">Full calendar</button>
          <span>•</span>
          <button className="hover:text-white transition-colors">Import or export calendars</button>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6">Timeline</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={timelineFilter} onValueChange={setTimelineFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="next-7-days">Next 7 days</SelectItem>
                <SelectItem value="next-30-days">Next 30 days</SelectItem>
                <SelectItem value="this-month">This month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="dates">Sort by dates</SelectItem>
                <SelectItem value="name">Sort by name</SelectItem>
                <SelectItem value="type">Sort by type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-8">
            <Input
              placeholder="Search by activity type or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 border-gray-600 placeholder-gray-400"
            />
          </div>
        </div>
        <div className="mt-8">
          <EventColorLegend />
        </div>
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)}
          onCreate={handleCreateEvent}
        />
        <DateEventsModal
          isOpen={dateEventsModalOpen}
          onClose={() => setDateEventsModalOpen(false)}
          date={selectedDateForEvents ?? new Date()}
          events={selectedDateEvents}
          onEventClick={handleEventClickFromDate}
        />
        <EventDetailsModal
          isOpen={isEventDetailsOpen}
          onClose={() => setIsEventDetailsOpen(false)}
          event={selectedEventDetails}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
          onDuplicate={handleEventDuplicate}
        />
      </div>
    </div>
  )
}

// Initial sample events data (can be empty if fetching from backend)
const SAMPLE_EVENTS_DATA: EventDetails[] = []
