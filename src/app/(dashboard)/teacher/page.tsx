// File: src/app/(dashboard)/teacher/page.tsx
"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BookOpen,
  BarChart3,
  NotebookPen,
  ListVideo,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { TeacherSection } from "~/components/blocks/dashboard/teacher";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { TodayAtAGlance } from "~/components/dashboard/TodayAtAGlance";
import { PinnedNotices } from "~/components/dashboard/PinnedNotices";
import { ActionRequired } from "~/components/dashboard/ActionRequired";

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function TeacherStatsBar() {
  const { data: timetable, isLoading: ttLoading } =
    api.timetable.getTimetable.useQuery();
  const { data: exams, isLoading: exLoading } =
    api.exam.getAllExams.useQuery();
  const { data: profile } = api.employee.getProfileByUserId.useQuery();

  const todayName = DAYS[new Date().getDay()] ?? "Monday";
  const todayClasses = profile
    ? (timetable?.filter(
        (t) => t.employeeId === profile.employeeId && t.dayOfWeek === todayName,
      ).length ?? 0)
    : 0;

  const totalPeriods = profile
    ? (timetable?.filter((t) => t.employeeId === profile.employeeId).length ?? 0)
    : 0;

  const ongoingExams = exams?.filter((e) => e.status === "ONGOING").length ?? 0;

  const nextClass = profile
    ? timetable
        ?.filter(
          (t) => t.employeeId === profile.employeeId && t.dayOfWeek === todayName,
        )
        ?.sort((a, b) => a.startTime.localeCompare(b.startTime))?.[0]
    : null;

  const stats = [
    {
      title: "Classes Today",
      value: ttLoading ? "—" : todayClasses.toString(),
      description: `${totalPeriods} total periods/wk`,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Pending Marks",
      value: exLoading ? "—" : ongoingExams.toString(),
      description: "Exams requiring marks entry",
      icon: CheckCircle2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Next Class",
      value: nextClass?.startTime ?? "—",
      description: nextClass
        ? `${nextClass.Subject?.subjectName ?? "—"} · ${nextClass.Grades?.grade}`
        : "No more classes today",
      icon: Clock,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid w-full grid-cols-1 gap-6 md:grid-cols-3"
    >
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className={`border ${stat.border} bg-card backdrop-blur-sm`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
}

function MarksStatusPanel() {
  const { data: exams } = api.exam.getAllExams.useQuery();

  const ongoingExams = exams?.filter((e) => e.status === "ONGOING") ?? [];
  const scheduledExams = exams?.filter((e) => e.status === "SCHEDULED") ?? [];

  if (ongoingExams.length === 0 && scheduledExams.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No active or scheduled exams
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {[...ongoingExams.slice(0, 3), ...scheduledExams.slice(0, 2)].map((exam) => (
        <div
          key={exam.examId}
          className="flex items-center justify-between rounded-lg border border-border bg-black/10 px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {exam.ExamType?.name ?? exam.examTypeEnum} — {exam.Grades?.grade}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(exam.startDate).toLocaleDateString("en-PK")}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              exam.status === "ONGOING"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-blue-500/30 bg-blue-500/10 text-blue-400"
            }
          >
            {exam.status}
          </Badge>
        </div>
      ))}
      <Link href="/teacher/exams/marks">
        <Button variant="outline" size="sm" className="w-full gap-2 mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
          <Sparkles className="h-3.5 w-3.5" />
          Enter Marks
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}

function TeacherQuickActions() {
  const actions = [
    {
      label: "Enter Marks",
      href: "/teacher/exams/marks",
      icon: Sparkles,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
    },
    {
      label: "Subject Diary",
      href: "/teacher",
      icon: NotebookPen,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
    },
    {
      label: "My Timetable",
      href: "/teacher",
      icon: ListVideo,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link key={a.label} href={a.href}>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1.5 border text-xs font-medium ${a.color}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {a.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

export default function TeacherDashboard() {
  const breadcrumbs = [{ href: "/teacher", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 px-4 sm:px-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:col-span-8"
        >
          <WelcomeSection />
          <PinnedNotices />

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </p>
            <TeacherQuickActions />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-4"
        >
          <div className="h-full w-full">
            <ProfileSection />
          </div>
          <TodayAtAGlance />
        </motion.div>
      </div>

      {/* Live Analytics Cards */}
      <TeacherStatsBar />

      {/* Main Content Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="classes" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Academic Overview
              </h2>
            </div>
            <TabsList className="border border-border bg-card p-1">
              <TabsTrigger value="classes" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">My Classes</span>
              </TabsTrigger>
              <TabsTrigger value="marks" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Marks Status</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full p-4 sm:p-6">
            <TabsContent value="classes" className="mt-0 w-full space-y-6 focus-visible:outline-none">
              <ActionRequired role="TEACHER" />
              <TeacherSection />
            </TabsContent>

            <TabsContent value="marks" className="mt-0 w-full focus-visible:outline-none">
              <Card className="border-border bg-black/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    Marks Entry Status
                  </CardTitle>
                  <CardDescription>Active and scheduled exam mark sheets</CardDescription>
                </CardHeader>
                <CardContent>
                  <MarksStatusPanel />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="mt-0 w-full focus-visible:outline-none">
              <Card className="w-full border-0 bg-transparent shadow-none">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Upcoming Events</h3>
                    <p className="text-sm text-muted-foreground">School calendar and holidays</p>
                  </div>
                </div>
                <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-muted" />}>
                  <div className="w-full overflow-hidden rounded-xl border border-border bg-black/20">
                    <EventsTable />
                  </div>
                </Suspense>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
