// File: src/app/(dashboard)/head/page.tsx
"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Settings,
  ListChecks,
  BookOpen,
  GraduationCap,
  Users,
  Target,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { StatsCards } from "~/components/cards/StatCard";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";

// Shared dashboard widgets
import { TodayAtAGlance } from "~/components/dashboard/TodayAtAGlance";
import { ActionRequired } from "~/components/dashboard/ActionRequired";
import { ActivityFeed } from "~/components/dashboard/ActivityFeed";
import { QuickActionToolbar } from "~/components/dashboard/QuickActionToolbar";
import { PinnedNotices } from "~/components/dashboard/PinnedNotices";
import AdminCards from "~/components/cards/AdminCard";
import { api } from "~/trpc/react";

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

function DepartmentOverview() {
  const { data: classes, isLoading: clsLoading } =
    api.class.getClasses.useQuery();
  const { data: employees, isLoading: empLoading } =
    api.employee.getEmployees.useQuery();
  const { data: exams } = api.exam.getAllExams.useQuery();

  const teachers =
    employees?.filter(
      (e) => e.designation === "TEACHER" || e.designation === "FACULTY",
    ) ?? [];

  const ongoingExams = exams?.filter((e) => e.status === "ONGOING").length ?? 0;
  const scheduledExams = exams?.filter((e) => e.status === "SCHEDULED").length ?? 0;

  const overview = [
    {
      label: "Classes",
      value: classes?.length ?? 0,
      icon: GraduationCap,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      loading: clsLoading,
    },
    {
      label: "Teachers",
      value: teachers.length,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      loading: empLoading,
    },
    {
      label: "Ongoing Exams",
      value: ongoingExams,
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      loading: false,
    },
    {
      label: "Scheduled Exams",
      value: scheduledExams,
      icon: ListChecks,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      loading: false,
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="rounded-lg bg-amber-500/10 p-1.5">
            <BookOpen className="h-4 w-4 text-amber-400" />
          </div>
          Department Overview
        </CardTitle>
        <CardDescription>
          Grade and section oversight metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {overview.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-lg border border-border p-3 ${item.bg}`}
            >
              <Icon className={`h-5 w-5 ${item.color}`} />
              <div>
                {item.loading ? (
                  <Skeleton className="h-5 w-12 bg-muted" />
                ) : (
                  <p className={`text-lg font-bold ${item.color}`}>
                    {item.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TeacherWorkloadSummary() {
  const { data: employees } = api.employee.getEmployees.useQuery();
  const { data: timetable } = api.timetable.getTimetable.useQuery();

  const teachers =
    employees?.filter(
      (e) => e.designation === "TEACHER" || e.designation === "FACULTY",
    ) ?? [];

  // Calculate weekly periods per teacher from timetable
  const teacherLoad = teachers.slice(0, 5).map((teacher) => {
    const entries =
      timetable?.filter((t) => t.employeeId === teacher.employeeId) ?? [];
    const weeklyPeriods = entries.length;
    return {
      name: teacher.employeeName,
      designation: teacher.designation,
      periods: weeklyPeriods,
      classes: new Set(entries.map((e) => e.classId)).size,
    };
  });

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="rounded-lg bg-blue-500/10 p-1.5">
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          Teacher Workload
        </CardTitle>
        <CardDescription>Weekly periods and class assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {teacherLoad.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No teacher assignments recorded
          </p>
        ) : (
          teacherLoad.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border bg-black/10 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.classes} classes</p>
              </div>
              <Badge
                variant="outline"
                className={`border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs`}
              >
                {t.periods} periods/wk
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function HeadDashboard() {
  const breadcrumbs = [{ href: "/head", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:col-span-8"
        >
          <WelcomeSection />
          <PinnedNotices />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-4"
        >
          <TodayAtAGlance />
          <ActionRequired role="HEAD" basePrefix="/head" />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card px-4 py-3"
      >
        <QuickActionToolbar basePrefix="/head" />
      </motion.div>

      {/* Department Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <DepartmentOverview />
        <TeacherWorkloadSummary />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <StatsCards />
      </motion.div>

      {/* Main Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="management" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 shadow-lg shadow-amber-500/20">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Head Control Center</h2>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px]">
                  Head Access
                </Badge>
              </div>
            </div>
            <TabsList className="border border-border bg-card p-1">
              <TabsTrigger value="management" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Management</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="management" className="mt-0 focus-visible:outline-none">
              <AdminCards basePrefix="/head" />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-foreground">Academic Calendar</h3>
                <p className="text-sm text-muted-foreground">Manage departmental events</p>
              </div>
              <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-muted" />}>
                <div className="overflow-hidden rounded-xl border border-border bg-black/20">
                  <EventsTable />
                </div>
              </Suspense>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityFeed basePrefix="/head" />
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
