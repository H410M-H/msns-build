"use client";

import { ArrowRight, MessageSquare, Pin, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import Link from "next/link";

export function BroadcastBoard() {
  // Use real Events from DB — filter to upcoming/SCHEDULED events as "broadcasts"
  const { data, isLoading } = api.event.getAll.useQuery({ limit: 5 });
  const announcements = data?.events ?? [];

  return (
    <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <CardTitle>Broadcasts</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No announcements yet.</div>
        ) : (
          announcements.map((event) => {
            const isUrgent = event.priority === "URGENT" || event.priority === "HIGH";
            return (
              <div
                key={event.id}
                className="group relative flex flex-col gap-2 rounded-xl border border-border bg-black/5 dark:bg-black/20 p-4 transition-all hover:bg-black/10 dark:hover:bg-black/40"
              >
                {isUrgent && (
                  <Pin className="absolute right-4 top-4 h-4 w-4 text-red-500 opacity-50 transition-opacity group-hover:opacity-100" />
                )}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {event.title}
                    {isUrgent && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] uppercase text-red-500">
                        Urgent
                      </span>
                    )}
                  </h4>
                  {event.description && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span className="capitalize">{event.type?.toLowerCase().replace("_", " ")}</span>
                  <span>{format(new Date(event.startDateTime), "MMM d, yyyy")}</span>
                </div>
              </div>
            );
          })
        )}
        <Link href="/admin/events">
          <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground">
            View All Events <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
