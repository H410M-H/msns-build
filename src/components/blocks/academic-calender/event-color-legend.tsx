"use client"

import React, { useMemo } from "react"
import { EVENT_TYPES, type EventType } from "./event-colors"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Palette } from "lucide-react"

interface EventColorLegendProps {
  showTitle?: boolean
  compact?: boolean
}

export default function EventColorLegend({ showTitle = true, compact = false }: EventColorLegendProps) {
  const renderedItems = useMemo(() => {
    return EVENT_TYPES.map((eventType: EventType) => (
      <div
        key={eventType.id}
        className={`flex items-center gap-3 p-3 rounded-lg ${eventType.bgColor} ${eventType.borderColor} border transition-all hover:scale-[1.02]`}
      >
        <div className={`w-4 h-4 rounded-full bg-current ${eventType.color} shrink-0`} />
        <div className="flex-1">
          <div className={`font-medium ${eventType.color}`}>{eventType.label}</div>
          <div className="text-xs text-gray-400 mt-1">{eventType.description}</div>
        </div>
      </div>
    ))
  }, [])

  const compactItems = useMemo(()=> {
    return EVENT_TYPES.map((eventType: EventType) => (
      <div
        key={eventType.id}
        className={`flex items-center gap-2 px-2 py-1 rounded-md ${eventType.bgColor} ${eventType.borderColor} border transition-all hover:scale-[1.02]`}
      >
        <div className={`w-2 h-2 rounded-full bg-current ${eventType.color}`} />
        <span className={`text-xs font-medium ${eventType.color}`}>{eventType.label}</span>
      </div>
    ))
  }, [])

  return (
    <Card className="bg-gray-800 border-gray-700">
      {showTitle ? (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            Event Categories
          </CardTitle>
        </CardHeader>
      ):null}
      <CardContent className="space-y-3">
        {compact ? <div className="flex flex-wrap gap-2">{compactItems}</div> : renderedItems}
      </CardContent>
    </Card>
  )
}