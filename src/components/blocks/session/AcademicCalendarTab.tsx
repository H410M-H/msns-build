"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Sparkles,
  PartyPopper,
  CalendarCheck2,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { cn } from "~/lib/utils";

interface AcademicCalendarTabProps {
  initialDate?: Date;
}

export function AcademicCalendarTab({ initialDate = new Date() }: AcademicCalendarTabProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<"ALL" | "SESSION" | "EVENT" | "EXAM">("ALL");

  const { data: sessions } = api.session.getAllSessions.useQuery();
  const { data: eventsData } = api.event.getAll.useQuery({
    limit: 100,
    offset: 0,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const events = eventsData?.events ?? [];

  // Helper to get all items on a specific date
  const getItemsOnDate = (date: Date) => {
    const items: Array<{
      id: string;
      title: string;
      type: "SESSION" | "EVENT" | "EXAM";
      description?: string;
      color: string;
    }> = [];

    // Session checks
    sessions?.forEach((s) => {
      const sStart = new Date(s.startDate);
      const sEnd = new Date(s.endDate);
      if (isSameDay(date, sStart)) {
        items.push({
          id: `session-start-${s.sessionId}`,
          title: `Session Starts: ${s.sessionName}`,
          type: "SESSION",
          description: `Academic Session ${s.sessionName} commences.`,
          color: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300",
        });
      }
      if (isSameDay(date, sEnd)) {
        items.push({
          id: `session-end-${s.sessionId}`,
          title: `Session Concludes: ${s.sessionName}`,
          type: "SESSION",
          description: `Academic Session ${s.sessionName} finishes.`,
          color: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300",
        });
      }
    });

    // Event checks
    events.forEach((e) => {
      const eStart = new Date(e.startDate);
      if (isSameDay(date, eStart)) {
        items.push({
          id: `event-${e.id}`,
          title: e.title,
          type: "EVENT",
          description: e.description ?? undefined,
          color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
        });
      }
    });

    return items.filter((item) => {
      if (filterType === "ALL") return true;
      return item.type === filterType;
    });
  };

  const selectedDateItems = getItemsOnDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Academic Calendar & Events
          </h2>
          <p className="text-xs text-muted-foreground">
            Scheduled terms, academic milestones, exams, and institutional activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-muted/40">
            {(["ALL", "SESSION", "EVENT"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={filterType === t ? "default" : "ghost"}
                onClick={() => setFilterType(t)}
                className={cn(
                  "h-7 text-xs font-semibold rounded-lg px-2.5",
                  filterType === t
                    ? "bg-white text-emerald-700 shadow-sm dark:bg-emerald-600 dark:text-white"
                    : "text-muted-foreground",
                )}
              >
                {t === "ALL" ? "All" : t === "SESSION" ? "Sessions" : "Events"}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
            className="rounded-xl text-xs"
          >
            Today
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Monthly Calendar Grid */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card lg:col-span-2">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-foreground">
                <CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="text-xs font-semibold text-muted-foreground uppercase py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);
                const dayItems = getItemsOnDate(day);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "group relative min-h-[85px] rounded-xl border p-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between",
                      !isCurrentMonth && "opacity-35 bg-slate-50/50 dark:bg-muted/10",
                      isCurrentMonth && "bg-white dark:bg-card hover:border-emerald-400 hover:shadow-sm",
                      isSelected && "border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-500 dark:border-emerald-500",
                      isCurrentDay && !isSelected && "border-blue-400 bg-blue-50/20",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          isCurrentDay
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-800 dark:text-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {dayItems.length > 0 && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    {/* Day Mini Badges */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayItems.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "truncate rounded-md px-1 py-0.5 text-[9px] font-semibold border",
                            item.color,
                          )}
                        >
                          {item.title}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <span className="text-[9px] font-bold text-muted-foreground block pl-1">
                          +{dayItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details & Upcoming Feed */}
        <div className="space-y-6">
          {/* Selected Date Agenda */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
                  {format(selectedDate, "EEEE, dd MMMM yyyy")}
                </CardTitle>
                {isToday(selectedDate) && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Today
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {selectedDateItems.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl border p-3 shadow-sm transition-all",
                        item.color,
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.title}</span>
                        <Badge variant="secondary" className="text-[9px]">
                          {item.type}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs opacity-90">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Clock className="mx-auto mb-1.5 h-6 w-6 opacity-30" />
                  No events or sessions scheduled for this day.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Milestones Summary */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="p-4 border-b border-slate-100 dark:border-border/60">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                Active Sessions Timeline
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-border/40">
                {sessions?.map((session) => (
                  <div
                    key={session.sessionId}
                    className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                        {session.sessionName}
                      </span>
                      <Badge
                        variant={session.status === "ACTIVE" ? "default" : "secondary"}
                        className={cn(
                          "text-[10px]",
                          session.status === "ACTIVE" && "bg-emerald-600 text-white",
                        )}
                      >
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {format(new Date(session.startDate), "MMM yyyy")} –{" "}
                      {format(new Date(session.endDate), "MMM yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
