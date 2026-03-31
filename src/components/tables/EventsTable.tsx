"use client";

import { useState, useMemo, type SetStateAction } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import EventIndicator from "../blocks/academic-calender/event-indicator";
import type { CreateEventSchema } from "~/lib/event-schemas";
import { type z } from "zod";
import dayjs from "dayjs";
import { api } from "~/trpc/react";
import type { FrontendEventData } from "~/lib/event-helpers";

type SortField =
  | "TITLE"
  | "DATE"
  | "TYPE"
  | "PRIORITY"
  | "STATUS"
  | "ORGANIZER"
  | "ATTENDEES";
type SortDirection = "asc" | "desc";

interface EventsTableProps {
  onEventView?: (event: FrontendEventData) => void;
  onEventEdit?: (event: FrontendEventData) => void;
}

export default function EventsTable({
  onEventView,
  onEventEdit,
}: EventsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("DATE");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [offset, setOffset] = useState(0);
  const limit = 10;

  // Fetch events using tRPC
  const { data, isLoading, refetch } = api.event.getAll.useQuery({
    search: searchQuery || undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "CONFIRMED" | "TENTATIVE" | "CANCELLED")
        : undefined,
    offset,
    limit,
  });

  const events = useMemo(() => data?.events ?? [], [data]);
  const totalEvents = data?.total ?? 0;

  // tRPC mutations
  const deleteEvent = api.event.delete.useMutation({
    onSuccess: () => refetch(),
  });
  const createEvent = api.event.create.useMutation({
    onSuccess: () => refetch(),
  });

  // Get unique values for filters
  const eventTypes = useMemo(() => {
    const types = [...new Set(events.map((event) => event.type))];
    return types.sort();
  }, [events]);

  const priorities = useMemo(() => {
    const priorities = [...new Set(events.map((event) => event.priority))];
    return priorities.sort();
  }, [events]);

  const statuses = useMemo(() => {
    const statuses = [...new Set(events.map((event) => event.status))];
    return statuses.sort();
  }, [events]);

  // Helper function to extract date from startDateTime
  const getEventDate = (event: FrontendEventData): string => {
    return dayjs(event.startDateTime).format("YYYY-MM-DD");
  };

  // Helper function to extract time from startDateTime
  const getEventStartTime = (event: FrontendEventData): string => {
    return dayjs(event.startDateTime).format("HH:mm");
  };

  // Helper function to extract time from endDateTime
  const getEventEndTime = (event: FrontendEventData): string => {
    if (!event.endDateTime) return "N/A";
    return dayjs(event.endDateTime).format("HH:mm");
  };

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    const getSortValue = (event: FrontendEventData): string | number => {
      switch (sortField) {
        case "TITLE":
          return event.title?.toLowerCase() ?? "";
        case "DATE":
          const date = new Date(event.startDateTime);
          return isNaN(date.getTime())
            ? Number.NEGATIVE_INFINITY
            : date.getTime();
        case "TYPE":
          return event.type ?? "";
        case "PRIORITY":
          const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
          return (
            priorityOrder[event.priority as keyof typeof priorityOrder] || 0
          );
        case "STATUS":
          return event.status ?? "";
        case "ORGANIZER":
          return (event.organizer as unknown as string)?.toLowerCase() ?? "";
        case "ATTENDEES":
          return event.attendees?.length ?? 0;
        default:
          return "";
      }
    };

    const filtered = events.filter((event) => {
      const matchesType = typeFilter === "all" || event.type === typeFilter;
      const matchesPriority =
        priorityFilter === "all" || event.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "all" || event.status === statusFilter;
      return matchesType && matchesPriority && matchesStatus && event.title;
    });

    filtered.sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    events,
    typeFilter,
    priorityFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-400" />
    );
  };

  const formatDate = (dateString: string): string => {
    const parsed = dayjs(dateString);
    return parsed.isValid() ? parsed.format("MMM D, YYYY") : "Invalid date";
  };

  const formatTime = (time: string): string => {
    if (!time) return "N/A";
    const timeWithDate = time.includes("T") ? time : `1970-01-01T${time}`;
    const parsed = dayjs(timeWithDate);
    return parsed.isValid() ? parsed.format("h:mm A") : "Invalid time";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/20 text-red-400 border-red-500";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "LOW":
        return "bg-green-500/20 text-green-400 border-green-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/20 text-green-400 border-green-500";
      case "TENTATIVE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const handleDelete = (eventId: string) => {
    deleteEvent.mutate({ id: eventId });
  };

  const handleDuplicate = (event: FrontendEventData) => {
    const newEvent: z.infer<typeof CreateEventSchema> = {
      title: `${event.title} (Copy)`,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      type: event.type as
        | "MEETING"
        | "WORKSHOP"
        | "CONFERENCE"
        | "TRAINING"
        | "WEBINAR"
        | "SOCIAL"
        | "OTHER",
      priority: event.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      status: event.status as "CONFIRMED" | "TENTATIVE" | "CANCELLED",
      description: event.description,
      location: event.location,
      creatorId: event.creatorId,
      tagIds: event.tagIds ?? [],
      reminders:
        event.reminders?.map((rem) => ({
          type: rem.type as "EMAIL" | "PUSH" | "SMS",
          value: rem.value,
        })) ?? [],
      attendees:
        event.attendees?.map((att) => ({
          userId: att.userId,
          status: att.status as "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE",
        })) ?? [],
      timezone: event.timezone,
      isOnline: event.isOnline,
      isPublic: event.isPublic,
      notes: event.notes,
      maxAttendees: event.maxAttendees,
      recurrenceEnd: event.recurrenceEnd,
      recurring: "NONE",
    };
    createEvent.mutate(newEvent);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    typeFilter !== "all" ||
    priorityFilter !== "all" ||
    statusFilter !== "all";

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl font-semibold text-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            Events Table
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              {filteredAndSortedEvents.length} of {totalEvents}
            </Badge>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e: { target: { value: SetStateAction<string> } }) =>
                  setSearchQuery(e.target.value)
                }
                className="border-gray-600 bg-gray-700 pl-10 text-foreground placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 border-gray-600 bg-gray-700 text-foreground">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-700">
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <EventIndicator
                        eventType={
                          type as
                            | "MEETING"
                            | "WORKSHOP"
                            | "CONFERENCE"
                            | "TRAINING"
                            | "WEBINAR"
                            | "SOCIAL"
                            | "OTHER"
                        }
                        size="sm"
                      />
                      <span className="capitalize">{type.toLowerCase()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 border-gray-600 bg-gray-700 text-foreground">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-700">
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <Badge
                      className={`${getPriorityColor(priority)} border text-xs`}
                    >
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1).toLowerCase()}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 border-gray-600 bg-gray-700 text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-gray-600 bg-gray-700">
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge
                      className={`${getStatusColor(status)} border text-xs`}
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).toLowerCase()}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-700">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-700/50">
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("TITLE")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Event
                      {getSortIcon("TITLE")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("DATE")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Date & Time
                      {getSortIcon("DATE")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("TYPE")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Type
                      {getSortIcon("TYPE")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">Location</TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("PRIORITY")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Priority
                      {getSortIcon("PRIORITY")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("STATUS")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Status
                      {getSortIcon("STATUS")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("ORGANIZER")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Organizer
                      {getSortIcon("ORGANIZER")}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("ATTENDEES")}
                      className="h-auto p-0 font-medium text-gray-300 hover:text-foreground"
                    >
                      Attendees
                      {getSortIcon("ATTENDEES")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-12 text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-gray-400"
                    >
                      Loading events...
                    </TableCell>
                  </TableRow>
                ) : filteredAndSortedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-8 text-center text-gray-400"
                    >
                      {hasActiveFilters
                        ? "No events match your filters"
                        : "No events found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer border-gray-700 hover:bg-gray-700/30"
                      onClick={() => onEventView?.(event)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-3">
                          <EventIndicator
                            eventType={
                              event.type as
                                | "MEETING"
                                | "WORKSHOP"
                                | "CONFERENCE"
                                | "TRAINING"
                                | "WEBINAR"
                                | "SOCIAL"
                                | "OTHER"
                            }
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-foreground">
                              {event.title}
                            </div>
                            {event.description && (
                              <div className="mt-1 truncate text-sm text-gray-400">
                                {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <Calendar className="h-3 w-3" />
                            {formatDate(getEventDate(event))}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock className="h-3 w-3" />
                            {formatTime(getEventStartTime(event))} -{" "}
                            {formatTime(getEventEndTime(event))}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <EventIndicator
                          eventType={
                            event.type as
                              | "MEETING"
                              | "WORKSHOP"
                              | "CONFERENCE"
                              | "TRAINING"
                              | "WEBINAR"
                              | "SOCIAL"
                              | "OTHER"
                          }
                          showLabel
                        />
                      </TableCell>

                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-32 truncate">
                              {event.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`${getPriorityColor(event.priority)} border text-xs`}
                        >
                          {event.priority.charAt(0).toUpperCase() +
                            event.priority.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`${getStatusColor(event.status)} border text-xs`}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-32 truncate text-sm text-gray-300">
                          {typeof event.organizer === "string"
                            ? event.organizer
                            : "-"}
                        </div>
                      </TableCell>

                      <TableCell>
                        {event.attendees.length > 0 ? (
                          <div className="flex items-center gap-1 text-sm text-gray-300">
                            <Users className="h-3 w-3" />
                            {event.attendees.length}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-gray-600 bg-gray-700"
                          >
                            <DropdownMenuLabel className="text-gray-300">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-600" />

                            {onEventView && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventView(event);
                                }}
                                className="text-gray-300 hover:bg-gray-600 hover:text-foreground"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            )}

                            {onEventEdit && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventEdit(event);
                                }}
                                className="text-gray-300 hover:bg-gray-600 hover:text-foreground"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Event
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate(event);
                              }}
                              className="text-gray-300 hover:bg-gray-600 hover:text-foreground"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-600" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(event.id);
                              }}
                              className="text-red-400 hover:bg-red-600/20 hover:text-red-300"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalEvents > limit && (
          <div className="flex items-center justify-between pt-4 text-sm text-gray-400">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
              className="border-gray-600 text-gray-300"
            >
              Previous
            </Button>
            <span>
              Page {Math.floor(offset / limit) + 1} of{" "}
              {Math.ceil(totalEvents / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= totalEvents}
              onClick={() => setOffset((prev) => prev + limit)}
              className="border-gray-600 text-gray-300"
            >
              Next
            </Button>
          </div>
        )}

        {/* Summary */}
        {filteredAndSortedEvents.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-700 pt-4 text-sm text-gray-400">
            <div>
              Showing {filteredAndSortedEvents.length} of {totalEvents} events
            </div>
            <div className="flex items-center gap-4">
              <div>
                Confirmed:{" "}
                {
                  filteredAndSortedEvents.filter(
                    (e) => e.status === "CONFIRMED",
                  ).length
                }
              </div>
              <div>
                Tentative:{" "}
                {
                  filteredAndSortedEvents.filter(
                    (e) => e.status === "TENTATIVE",
                  ).length
                }
              </div>
              <div>
                Cancelled:{" "}
                {
                  filteredAndSortedEvents.filter(
                    (e) => e.status === "CANCELLED",
                  ).length
                }
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
