"use client";

import { Bell, BellOff, Calendar, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  // Real upcoming events from the DB serve as notifications
  const { data, isLoading } = api.event.getAll.useQuery(
    { limit: 5 },
    { enabled: open }
  );
  const notifications = data?.events ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors rounded-full"
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-emerald-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 shadow-2xl rounded-2xl border-slate-200 dark:border-border">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Upcoming Events</h3>
          {notifications.length > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 py-0.5 px-2 rounded-full font-medium">
              {notifications.length} events
            </span>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((event) => (
              <div
                key={event.id}
                className="p-4 flex gap-3 border-b border-slate-50 dark:border-border/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="mt-0.5 rounded-full p-2 h-fit bg-emerald-100/80 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 block font-medium">
                    {format(new Date(event.startDateTime), "MMM d, yyyy · h:mm a")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <BellOff className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm">No upcoming events.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
