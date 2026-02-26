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
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { TeacherSection } from "~/components/blocks/dashboard/teacher";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
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

export default function TeacherDashboard() {
  const breadcrumbs = [{ href: "/teacher", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8"
        >
          <WelcomeSection />
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
              <TabsTrigger
                value="classes"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <GraduationCap className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">My Classes</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <Calendar className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full p-4 sm:p-6">
            <TabsContent
              value="classes"
              className="mt-0 w-full space-y-6 focus-visible:outline-none"
            >
              <div className="flex justify-end">
                <Link href="/teacher/exams/marks">
                  <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                    <Sparkles className="h-4 w-4" />
                    Enter Exam Marks
                  </Button>
                </Link>
              </div>
              <TeacherSection />
            </TabsContent>

            <TabsContent
              value="events"
              className="mt-0 w-full focus-visible:outline-none"
            >
              <Card className="w-full border-0 bg-transparent shadow-none">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      Upcoming Events
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      School calendar and holidays
                    </p>
                  </div>
                </div>
                <Suspense
                  fallback={
                    <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                  }
                >
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
