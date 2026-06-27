"use client";

import { useMemo } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  ClipboardCheck,
  CalendarIcon,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

function StudentAttendanceDashboardContent() {
  const { data: activeSession, isLoading: sessionLoading } = api.session.getActiveSession.useQuery();

  const { data: classesData, isLoading: classesLoading } = api.class.getClassesWithStudentCount.useQuery(
    { sessionId: activeSession?.sessionId ?? "" },
    { enabled: !!activeSession?.sessionId }
  );

  const stats = useMemo(() => {
    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;

    if (classesData) {
      classesData.forEach((c) => {
        totalStudents += c.studentCount;
        totalPresent += c.presentCount;
        totalAbsent += c.absentCount;
        totalLeave += c.leaveCount;
      });
    }

    return { totalStudents, totalPresent, totalAbsent, totalLeave };
  }, [classesData]);

  if (sessionLoading || (activeSession?.sessionId && classesLoading)) {
    return (
      <div className="w-full space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-emerald-900/20" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
          ))}
        </div>
        <div className="h-96 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center dark:border-border dark:bg-card">
        <div className="mb-4 rounded-full border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-muted">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-foreground">
          No Active Academic Session
        </h3>
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          Please set an active session in Session Management before viewing student attendance.
        </p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/admin/sessions">Manage Sessions</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
              Student Attendance
            </h1>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300"
            >
              Session: {activeSession.sessionName}
            </Badge>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Track, mark, and manage student attendance registers across classes.
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Today: {dayjs().format("dddd, MMMM D, YYYY")}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          theme="blue"
        />
        <GradientStatCard
          title="Present Today"
          value={stats.totalPresent}
          icon={UserCheck}
          theme="emerald"
        />
        <GradientStatCard
          title="Absent Today"
          value={stats.totalAbsent}
          icon={UserX}
          theme="pink"
        />
        <GradientStatCard
          title="On Leave"
          value={stats.totalLeave}
          icon={UserMinus}
          theme="amber"
        />
      </div>

      {/* Classes List */}
      <Card className="border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-white/5">
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Class Registers
          </CardTitle>
          <CardDescription className="text-xs">
            Manage attendance registers for classes in the current session.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!classesData || classesData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No classes defined in this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-muted-foreground dark:border-border dark:bg-black/20">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Class / Grade</th>
                    <th className="px-6 py-3 font-semibold">Section</th>
                    <th className="px-6 py-3 font-semibold">Category</th>
                    <th className="px-6 py-3 text-center font-semibold">Enrolled Students</th>
                    <th className="px-6 py-3 text-center font-semibold">Today's Register</th>
                    <th className="px-6 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border">
                  {classesData.map((c) => {
                    const hasAttendanceMarked = c.presentCount > 0 || c.absentCount > 0 || c.leaveCount > 0;
                    return (
                      <tr key={c.classId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-foreground">
                          {c.grade}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                            {c.section}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {c.category}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-medium">
                          {c.studentCount}
                        </td>
                        <td className="px-6 py-4">
                          {hasAttendanceMarked ? (
                            <div className="flex items-center justify-center gap-2 text-xs font-semibold">
                              <span className="text-emerald-600 dark:text-emerald-400">{c.presentCount} P</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-red-500">{c.absentCount} A</span>
                              <span className="text-slate-400">/</span>
                              <span className="text-amber-500">{c.leaveCount} L</span>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground italic">
                              Not Marked
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/20 gap-1.5" asChild>
                            <Link href={`/admin/sessions/class/?classId=${c.classId}&sessionId=${activeSession.sessionId}&tab=attendance`}>
                              Manage Register
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AttendancePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/attendance", label: "Attendance", current: true },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />
      <StudentAttendanceDashboardContent />
    </div>
  );
}
