"use client";

import { motion } from "framer-motion";
import {
  Activity,
  UserPlus,
  GraduationCap,
  DollarSign,
  Calendar,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: string;
  type: "student" | "employee" | "exam" | "event" | "fee" | "session";
  label: string;
  sub: string;
  time: Date;
  href: string;
  icon: React.ElementType;
  color: string;
}

interface ActivityFeedProps {
  basePrefix?: string;
}

export function ActivityFeed({ basePrefix = "/admin" }: ActivityFeedProps) {
  const { data: students, isLoading: stLoading } =
    api.student.getStudents.useQuery();
  const { data: employees, isLoading: empLoading } =
    api.employee.getEmployees.useQuery();
  const { data: exams, isLoading: exLoading } =
    api.exam.getAllExams.useQuery();
  const { data: eventsData, isLoading: evLoading } =
    api.event.getAll.useQuery({ limit: 5, offset: 0 });

  const isLoading = stLoading || empLoading || exLoading || evLoading;

  // Build feed from real data — most recently created items
  const feedItems: FeedItem[] = [];

  students?.slice(0, 3).forEach((s) => {
    feedItems.push({
      id: `s-${s.studentId}`,
      type: "student",
      label: `${s.studentName} enrolled`,
      sub: `Registration: ${s.registrationNumber}`,
      time: new Date(s.createdAt),
      href: `${basePrefix}/users`,
      icon: UserPlus,
      color: "text-emerald-400 bg-emerald-500/10",
    });
  });

  employees?.slice(0, 2).forEach((e) => {
    feedItems.push({
      id: `e-${e.employeeId}`,
      type: "employee",
      label: `${e.employeeName} added`,
      sub: `${e.designation}`,
      time: new Date(),
      href: `${basePrefix}/users`,
      icon: UserPlus,
      color: "text-blue-400 bg-blue-500/10",
    });
  });

  exams?.slice(0, 2).forEach((ex) => {
    feedItems.push({
      id: `ex-${ex.examId}`,
      type: "exam",
      label: `${ex.ExamType?.name ?? ex.examTypeEnum} — ${ex.Grades?.grade}`,
      sub: `Status: ${ex.status}`,
      time: new Date(ex.createdAt),
      href: `${basePrefix}/exams`,
      icon: GraduationCap,
      color: "text-purple-400 bg-purple-500/10",
    });
  });

  eventsData?.events?.slice(0, 2).forEach((ev) => {
    feedItems.push({
      id: `ev-${ev.id}`,
      type: "event",
      label: ev.title,
      sub: ev.type,
      time: new Date(ev.createdAt),
      href: `${basePrefix}/sessions`,
      icon: Calendar,
      color: "text-amber-400 bg-amber-500/10",
    });
  });

  // Sort by time descending and take the 10 most recent
  const sorted = feedItems
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 10);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-base font-semibold text-foreground">
            <div className="rounded-lg bg-blue-500/10 p-1.5">
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            Live Activity Feed
          </span>
          <Link href={`${basePrefix}/users`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">
            No recent activity
          </p>
        ) : (
          <div className="space-y-2">
            {sorted.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link href={item.href}>
                    <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5">
                      <div className={`rounded-full p-1.5 ${item.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.sub}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(item.time, { addSuffix: true })}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
