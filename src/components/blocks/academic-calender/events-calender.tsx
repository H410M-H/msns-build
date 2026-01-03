"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

// Types and Schemas
import { type CreateEventInput } from "~/lib/event-schemas";
import EventModal, { type EventFormData } from "./event-modal";
import EventColorLegend from "./event-color-legend";
import EventDetailsModal, { type EventDetails } from "./event-details-modal";
import CalendarDateCell from "./calender-date-cell";
import { getEventsForDate } from "./event-utils";
import DateEventsModal from "./date-events-modal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Sample data to prevent crashes before data loads
const SAMPLE_EVENTS_DATA: EventDetails[] = [];

export default function EventsCalendar() {
  const session = useSession();
  
  // -- State --
  const [currentDate, setCurrentDate] = useState(new Date());
  // Default to today's date for selection
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  
  // Filters & Search
  const [courseFilter, setCourseFilter] = useState("all");
  const [timelineFilter, setTimelineFilter] = useState("this-month");
  const [sortBy, setSortBy] = useState("dates"); // Now used in the sort logic and UI
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [dateEventsModalOpen, setDateEventsModalOpen] = useState(false);
  
  // Selected Data
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventDetails | null>(null);
  const [selectedDateForEvents, setSelectedDateForEvents] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventDetails[]>(SAMPLE_EVENTS_DATA);

  // -- Mutations --
  const createEventMutation = api.event.create.useMutation({
    onSuccess: () => {
      setIsCreateModalOpen(false);
      // In a real app, you would invalidate queries here: ctx.event.getAll.invalidate()
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      alert(`Failed to create event: ${error.message}`);
    },
  });

  // -- Helpers --
  const getDaysInMonth = useCallback((date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Adjust for Monday start (0=Sun -> 6, 1=Mon -> 0)
    return firstDay === 0 ? 6 : firstDay - 1;
  }, []);

  const navigateMonth = useCallback((direction: "prev" | "next"): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  }, []);

  // -- Handlers --
  const handleDateClick = useCallback((date: Date): void => {
    setSelectedDateForEvents(date);
    setSelectedDate(date.getDate());
    setDateEventsModalOpen(true);
  }, []);

  const handleEventClickFromDate = useCallback((event: EventDetails): void => {
    setSelectedEventDetails(event);
    setDateEventsModalOpen(false);
    setIsEventDetailsOpen(true);
  }, []);

  const handleCreateEvent = useCallback(
    (formData: EventFormData): void => {
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.title) {
        alert("Please fill in all required fields.");
        return;
      }

      const eventData: CreateEventInput = {
        title: formData.title,
        description: formData.description ?? undefined,
        startDateTime: `${formData.date}T${formData.startTime}:00Z`,
        endDateTime: `${formData.date}T${formData.endTime}:00Z`,
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
        creatorId: session.data?.user.accountId ?? "default_user",
      };

      createEventMutation.mutate(eventData);
    },
    [createEventMutation, session.data?.user.accountId]
  );

  // -- Filtering Logic --
  const filteredEvents = useMemo((): EventDetails[] => {
    let filtered = events;

    // Filter by Type
    if (courseFilter !== "all") {
      filtered = filtered.filter((event) => event.type.toLowerCase() === courseFilter);
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(q) ||
          event.type.toLowerCase().includes(q)
      );
    }

    // Filter by Time
    const now = new Date();
    if (timelineFilter === "next-7-days") {
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((e) => new Date(e.date) >= now && new Date(e.date) <= nextWeek);
    } else if (timelineFilter === "next-30-days") {
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((e) => new Date(e.date) >= now && new Date(e.date) <= nextMonth);
    }

    // Sort
    return filtered.sort((a, b) => {
        if (sortBy === "name") return a.title.localeCompare(b.title);
        if (sortBy === "type") return a.type.localeCompare(b.type);
        // Default: Date ascending
        return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
    });
  }, [events, courseFilter, searchQuery, timelineFilter, sortBy]);

  // -- Render Helpers --
  const renderCalendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayIndex = getFirstDayOfMonth(currentDate);
    
    // Create empty cells for days before the 1st
    const emptyCells = Array.from({ length: firstDayIndex }).map((_, i) => (
      <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[120px] bg-gray-50/30 border-r border-b border-gray-100" />
    ));

    // Create cells for actual days
    const dayCells = Array.from({ length: daysInMonth }).map((_, i) => {
      const day = i + 1;
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      const isToday = new Date().toDateString() === cellDate.toDateString();
      
      const isSelected = day === selectedDate && 
        currentDate.getMonth() === selectedDateForEvents?.getMonth();

      // FIXED: Use getEventsForDate to pass only relevant events to the cell
      const daysEvents = getEventsForDate(filteredEvents, cellDate);

      return (
        <CalendarDateCell
          key={`day-${day}`}
          day={day}
          date={cellDate}
          isSelected={isSelected}
          isToday={isToday} 
          events={daysEvents}
          onClick={() => setSelectedDate(day)}
          onDateClick={handleDateClick}
        />
      );
    });

    return [...emptyCells, ...dayCells];
  }, [currentDate, selectedDate, filteredEvents, handleDateClick, getDaysInMonth, getFirstDayOfMonth, selectedDateForEvents]);

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-lg bg-gray-100 p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("prev")}
              className="h-8 w-8 hover:bg-white hover:shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 min-w-[140px] text-center font-semibold text-lg">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth("next")}
              className="h-8 w-8 hover:bg-white hover:shadow-xs"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentDate(new Date())}
            className="hidden sm:flex"
          >
            Today
          </Button>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Event</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* 2. Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Filter By Type */}
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white border-gray-200 h-9">
              <Filter className="w-3.5 h-3.5 mr-2 text-gray-500" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="class">Class</SelectItem>
              <SelectItem value="exam">Exam</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter By Period */}
          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white border-gray-200 h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="next-7-days">Next 7 Days</SelectItem>
              <SelectItem value="next-30-days">Next 30 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By - FIXED: Reconnected to state */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px] bg-white border-gray-200 h-9">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-gray-500" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dates">Date (Asc)</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="type">Type (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
           <span className="font-medium text-gray-700">{filteredEvents.length}</span> events
        </div>
      </div>

      {/* 3. Calendar Grid */}
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {DAYS.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>
        
        {/* Date Cells */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {renderCalendarGrid}
        </div>
      </div>

      {/* 4. Footer / Legend */}
      <div className="mt-6">
        <EventColorLegend />
      </div>

      {/* -- Dialogs -- */}
      <EventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedDate={new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)}
        onCreate={handleCreateEvent}
      />
      
      <DateEventsModal
        isOpen={dateEventsModalOpen}
        onClose={() => setDateEventsModalOpen(false)}
        date={selectedDateForEvents ?? new Date()}
        // Use utility here as well to be safe
        events={selectedDateForEvents ? getEventsForDate(events, selectedDateForEvents) : []}
        onEventClick={handleEventClickFromDate}
      />
      
      <EventDetailsModal
        isOpen={isEventDetailsOpen}
        onClose={() => setIsEventDetailsOpen(false)}
        event={selectedEventDetails}
        onEdit={(e) => console.log("Edit", e)}
        onDelete={(id) => setEvents(prev => prev.filter(e => e.id !== id))}
        onDuplicate={(e) => console.log("Duplicate", e)}
      />
    </div>
  );
}