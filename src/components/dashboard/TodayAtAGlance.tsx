"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Bell,
  BookOpen,
  GraduationCap,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

// Day names for timetable lookup
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function TodayAtAGlance() {
  const now = new Date();
  const todayName = DAYS[now.getDay()] ?? "Monday";
  const dateStr = now.toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { data: sessions, isLoading: sessionsLoading } =
    api.session.getSessions.useQuery();
  const { data: timetable, isLoading: timetableLoading } =
    api.timetable.getTimetable.useQuery();
  const { data: exams, isLoading: examsLoading } =
    api.exam.getAllExams.useQuery();

  const activeSession = sessions?.find((s) => s.isActive);

  // Today's timetable entries
  const todayEntries =
    timetable
      ?.filter((t) => t.dayOfWeek === todayName)
      ?.sort((a, b) => a.lectureNumber - b.lectureNumber)
      ?.slice(0, 4) ?? [];

  // Upcoming exams in the next 14 days
  const upcomingExams =
    exams?.filter((e) => {
      const start = new Date(e.startDate);
      const diff = (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 14 && e.status === "SCHEDULED";
    }) ?? [];

  const isLoading = sessionsLoading || timetableLoading || examsLoading;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="rounded-lg bg-emerald-500/10 p-1.5">
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          Today at a Glance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date & Session */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{dateStr}</span>
          </div>
          {sessionsLoading ? (
            <Skeleton className="h-5 w-24 bg-muted" />
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
            >
              {activeSession?.sessionName ?? "No Active Session"}
            </Badge>
          )}
        </div>

        {/* Today's Lectures */}
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            Today&apos;s Schedule
          </h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full bg-muted" />
              ))}
            </div>
          ) : todayEntries.length === 0 ? (
            <p className="rounded-lg border border-border bg-black/10 px-3 py-2 text-xs text-muted-foreground">
              No classes scheduled for today
            </p>
          ) : (
            <div className="space-y-1.5">
              {todayEntries.map((entry, idx) => (
                <motion.div
                  key={entry.timetableId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-black/10 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-foreground">
                      {entry.Subject?.subjectName ?? "Subject"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {entry.Grades?.grade} {entry.Grades?.section}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {entry.startTime}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        {!examsLoading && upcomingExams.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GraduationCap className="h-3 w-3" />
              Upcoming Exams ({upcomingExams.length})
            </h4>
            <div className="space-y-1.5">
              {upcomingExams.slice(0, 3).map((exam) => {
                const daysLeft = Math.ceil(
                  (new Date(exam.startDate).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={exam.examId}
                    className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="h-3 w-3 text-amber-400" />
                      <span className="text-xs font-medium text-foreground">
                        {exam.ExamType?.name ?? exam.examTypeEnum}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {exam.Grades?.grade}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs"
                    >
                      {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
