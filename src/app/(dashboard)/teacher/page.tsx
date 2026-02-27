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
  ClipboardList,
  Zap,
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

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

// --- Teacher Specific Analytics ---
const TEACHER_ANALYTICS = [
  {
    title: "Classes Today",
    value: "4",
    description: "2 Lectures, 2 Labs",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "Pending Grades",
    value: "12",
    description: "Assignments to review",
    icon: CheckCircle2,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    title: "Next Class",
    value: "10:30 AM",
    description: "Computer Science - Lab 2",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

// Quick action items for teacher
const QUICK_ACTIONS = [
  { label: "Mark Attendance", href: "/teacher/attendance", icon: CheckCircle2 },
  { label: "Enter Marks", href: "/teacher/exams/marks", icon: BarChart3 },
  { label: "Manage Diaries", href: "/teacher/diaries", icon: ClipboardList },
  { label: "View Timetable", href: "/teacher/timetable", icon: Calendar },
];

export default function TeacherDashboard() {
  const breadcrumbs = [{ href: "/teacher", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-8"
        >
          <WelcomeSection />

          {/* Quick Actions Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Zap className="h-4 w-4 text-emerald-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Link key={idx} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full flex-col gap-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs text-emerald-200 hover:bg-emerald-500/20"
                      >
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <div className="h-full w-full">
            <ProfileSection />
          </div>
        </motion.div>
      </div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid w-full grid-cols-1 gap-6 md:grid-cols-3"
      >
        {TEACHER_ANALYTICS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`border ${stat.border} bg-card backdrop-blur-sm`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="classes" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-4 py-4 sm:px-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Academic Overview
              </h2>
            </div>
            <TabsList className="border border-border bg-card p-1">
              <TabsTrigger
                value="classes"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">My Classes</span>
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Attendance</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full p-4 sm:p-6">
            <TabsContent
              value="classes"
              className="mt-0 w-full space-y-6 focus-visible:outline-none"
            >
              <TeacherSection />
            </TabsContent>

            <TabsContent
              value="attendance"
              className="mt-0 w-full focus-visible:outline-none"
            >
              <Card className="w-full border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle>Mark Attendance</CardTitle>
                  <CardDescription>
                    Record student and employee attendance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <div className="rounded-full bg-muted p-4 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="font-medium text-foreground">
                      Attendance features coming soon
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Use the quick actions above to access attendance marking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="events"
              className="mt-0 w-full focus-visible:outline-none"
            >
              <Card className="w-full border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle>School Calendar & Schedule</CardTitle>
                  <CardDescription>
                    Upcoming events and holidays
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                    }
                  >
                    <div className="w-full overflow-hidden rounded-xl border border-border bg-black/20">
                      <EventsTable />
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
