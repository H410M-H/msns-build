"use client";

import { useMemo } from "react";
import { EVENT_TYPES, type EventType } from "./event-colors";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Palette } from "lucide-react";

interface EventColorLegendProps {
  showTitle?: boolean;
  compact?: boolean;
}

export default function EventColorLegend({
  showTitle = true,
  compact = false,
}: EventColorLegendProps) {
  const renderedItems = useMemo((): JSX.Element[] => {
    return EVENT_TYPES.map((eventType: EventType) => (
      <div
        key={eventType.id}
        className={`flex items-center gap-3 rounded-lg p-3 ${eventType.bgColor} ${eventType.borderColor} border transition-all hover:scale-[1.02]`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-current ${eventType.color} flex-shrink-0`}
        />
        <div className="flex-1">
          <div className={`font-medium ${eventType.color}`}>
            {eventType.label}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {eventType.description}
          </div>
        </div>
      </div>
    ));
  }, []);

  const compactItems = useMemo((): JSX.Element[] => {
    return EVENT_TYPES.map((eventType: EventType) => (
      <div
        key={eventType.id}
        className={`flex items-center gap-2 rounded-md px-2 py-1 ${eventType.bgColor} ${eventType.borderColor} border transition-all hover:scale-[1.02]`}
      >
        <div className={`h-2 w-2 rounded-full bg-current ${eventType.color}`} />
        <span className={`text-xs font-medium ${eventType.color}`}>
          {eventType.label}
        </span>
      </div>
    ));
  }, []);

  return (
    <Card className="border-gray-700 bg-gray-800">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Palette className="h-5 w-5 text-blue-400" />
            Event Categories
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {compact ? (
          <div className="flex flex-wrap gap-2">{compactItems}</div>
        ) : (
          renderedItems
        )}
      </CardContent>
    </Card>
  );
}
