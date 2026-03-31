"use client";

import { useCallback, useMemo } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import EventIndicator from "./event-indicator";
import type { EventDetails } from "./event-details-modal";
import { getEventTypeColor } from "./event-colors";

interface DateEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  events: EventDetails[];
  onEventClick: (event: EventDetails) => void;
}

export default function DateEventsModal({
  isOpen,
  onClose,
  date,
  events,
  onEventClick,
}: DateEventsModalProps) {
  const formatDate = useCallback((date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatTime = useCallback((time: string): string => {
    const [hours = "0", minutes = "0"] = time.split(":");
    const date = new Date();
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const sortedEvents = useMemo((): EventDetails[] => {
    return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto border-gray-700 bg-gray-800 text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Events for {formatDate(date)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-500" />
              <p className="text-gray-400">No events scheduled for this date</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-400">
                {sortedEvents.length} event
                {sortedEvents.length !== 1 ? "s" : ""} scheduled
              </div>
              {sortedEvents.map((event) => {
                const eventColor = getEventTypeColor(event.type);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`rounded-lg p-4 ${eventColor.bgColor} ${eventColor.borderColor} group cursor-pointer border transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-3">
                      <EventIndicator eventType={event.type} size="md" />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`font-medium ${eventColor.color} mb-1 group-hover:underline`}
                        >
                          {event.title}
                        </div>
                        <div className="mb-2 flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.startTime)} -{" "}
                            {formatTime(event.endTime)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <EventIndicator eventType={event.type} showLabel />
                        {event.priority === "urgent" && (
                          <Badge className="border border-red-500 bg-red-500/20 text-xs text-red-400">
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
