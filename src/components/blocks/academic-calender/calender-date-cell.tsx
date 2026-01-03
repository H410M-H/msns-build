import React from "react";
import { cn } from "~/lib/utils";
import { type EventDetails } from "./event-details-modal";

export interface CalendarDateCellProps {
  day: number;
  date: Date;
  isSelected?: boolean;
  isToday?: boolean; // FIXED: Added missing property
  events: EventDetails[];
  onClick: () => void;
  onDateClick: (date: Date) => void;
}

const CalendarDateCell: React.FC<CalendarDateCellProps> = ({
  day,
  date,
  isSelected,
  isToday,
  events,
  onClick,
  onDateClick,
}) => {
  // Take the first 3 events to avoid overcrowding
  const displayEvents = events.slice(0, 3);
  const remainingCount = events.length - 3;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        onDateClick(date);
      }}
      className={cn(
        "group relative flex min-h-[80px] sm:min-h-[120px] cursor-pointer flex-col border-r border-b border-gray-100 p-2 transition-all hover:bg-blue-50/50",
        isSelected && !isToday && "bg-blue-50 ring-1 ring-inset ring-blue-500", // Distinguish selection from today
        isToday && "bg-blue-50/30" // Subtle background for today
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
            isToday
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-700 group-hover:bg-white group-hover:shadow-xs",
             isSelected && !isToday && "bg-blue-100 text-blue-700"
          )}
        >
          {day}
        </span>
      </div>

      <div className="mt-2 flex-1 space-y-1">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              "hidden sm:block truncate rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity",
              getEventColor(event.type)
            )}
            title={event.title}
          >
            {event.title}
          </div>
        ))}

        {/* Mobile Dot Indicators */}
        <div className="flex sm:hidden gap-1 mt-1 flex-wrap">
             {displayEvents.map((event) => (
                 <div 
                    key={event.id} 
                    className={cn("w-1.5 h-1.5 rounded-full", getEventDotColor(event.type))} 
                 />
             ))}
        </div>

        {remainingCount > 0 && (
          <div className="text-[10px] text-gray-400 pl-1 font-medium">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};

// Simple color helper based on event type
function getEventColor(type: string) {
  switch (type.toLowerCase()) {
    case "exam": return "bg-red-100 text-red-700";
    case "assignment": return "bg-orange-100 text-orange-700";
    case "holiday": return "bg-green-100 text-green-700";
    case "class": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function getEventDotColor(type: string) {
    switch (type.toLowerCase()) {
      case "exam": return "bg-red-500";
      case "assignment": return "bg-orange-500";
      case "holiday": return "bg-green-500";
      case "class": return "bg-blue-500";
      default: return "bg-gray-400";
    }
  }

export default CalendarDateCell;