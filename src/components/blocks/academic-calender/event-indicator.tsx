"use client"

import { useMemo } from "react"
import { getEventTypeColor, type EventType } from "./event-colors"

interface EventIndicatorProps {
  eventType: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

export default function EventIndicator({ eventType, size = "sm", showLabel = false }: EventIndicatorProps) {
  const eventColor = useMemo((): EventType => getEventTypeColor(eventType), [eventType])

  const sizeClasses = useMemo(() => ({
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }), [])

  if (showLabel) {
    return (
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md ${eventColor.bgColor} ${eventColor.borderColor} border`}>
        <div className={`${sizeClasses[size]} rounded-full bg-current ${eventColor.color}`} />
        <span className={`text-xs font-medium ${eventColor.color}`}>{eventColor.label}</span>
      </div>
    )
  }

  return <div className={`${sizeClasses[size]} rounded-full bg-current ${eventColor.color}`} />
}