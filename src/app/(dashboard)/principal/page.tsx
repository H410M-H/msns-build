// File: src/app/(dashboard)/principal/page.tsx
"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Crown,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { StatsCards } from "~/components/cards/StatCard";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardTitle,
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

function ExecutiveMetrics() {
  const { data: students, isLoading: stuLoading } =
    api.student.getStudents.useQuery();
  const { data: employees, isLoading: empLoading } =
    api.employee.getEmployees.useQuery();
  const { data: classes, isLoading: clsLoading } =
    api.class.getClasses.useQuery();
  const { data: exams } = api.exam.getAllExams.useQuery();

  const completedExams = exams?.filter((e) => e.status === "COMPLETED").length ?? 0;
  const totalExams = exams?.length ?? 0;
  const examCompletionRate = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;

  const metrics = [
    {
      title: "Total Students",
      value: students?.length ?? 0,
      desc: "Active enrollments",
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      loading: stuLoading,
      trend: "up",
    },
    {
      title: "Total Staff",
      value: employees?.length ?? 0,
      desc: "Teaching & admin",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      loading: empLoading,
      trend: "neutral",
    },
    {
      title: "Active Classes",
      value: classes?.length ?? 0,
      desc: "Running this session",
      icon: Wallet,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      loading: clsLoading,
      trend: "up",
    },
    {
      title: "Exam Completion",
      value: `${examCompletionRate}%`,
      desc: `${completedExams}/${totalExams} exams done`,
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      loading: false,
      trend: examCompletionRate > 70 ? "up" : "down",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <Card
            key={idx}
            className="border-border bg-card"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${m.bg}`}>
                <Icon className={`h-4 w-4 ${m.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {m.loading ? (
                <Skeleton className="h-7 w-20 bg-muted" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{m.value}</div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    {m.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : m.trend === "down" ? (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    ) : null}
                    {m.desc}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function PrincipalDashboard() {
  const breadcrumbs = [
    { href: "/principal", label: "Dashboard", current: true },
  ];

  return (
    <div className="w-full space-y-6 p-6">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-4"
        >
          <TodayAtAGlance />
          <ActionRequired role="PRINCIPAL" basePrefix="/principal" />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card px-4 py-3"
      >
        <QuickActionToolbar basePrefix="/principal" />
      </motion.div>

      {/* Executive Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ExecutiveMetrics />
      </motion.div>

      {/* Standard Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <StatsCards />
      </motion.div>

      {/* Main Content Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="management" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 shadow-lg shadow-purple-500/20">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Executive Dashboard</h2>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px]">
                    Principal Access
                  </Badge>
                </div>
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

          <div className="p-6">
            <TabsContent value="management" className="mt-0 space-y-6">
              <AdminCards basePrefix="/principal" />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-foreground">Institutional Calendar</h3>
                <p className="text-sm text-muted-foreground">Manage school-wide events and holidays</p>
              </div>
              <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-muted" />}>
                <div className="w-full overflow-hidden rounded-xl border border-border bg-black/20">
                  <EventsTable />
                </div>
              </Suspense>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityFeed basePrefix="/principal" />
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
