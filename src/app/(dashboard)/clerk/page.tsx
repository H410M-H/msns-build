// File: src/app/(dashboard)/clerk/page.tsx
"use client";

import { motion } from "framer-motion";
import { ClipboardList, Star } from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { StatsCards } from "~/components/cards/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Settings, BarChart3 } from "lucide-react";

// Shared dashboard widgets
import { TodayAtAGlance } from "~/components/dashboard/TodayAtAGlance";
import { ActionRequired } from "~/components/dashboard/ActionRequired";
import { ActivityFeed } from "~/components/dashboard/ActivityFeed";
import { QuickActionToolbar } from "~/components/dashboard/QuickActionToolbar";
import { PinnedNotices } from "~/components/dashboard/PinnedNotices";
import AdminCards from "~/components/cards/AdminCard";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DollarSign, Users, Receipt, CheckSquare } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

function ClerkTaskPanel() {
  const { data: students, isLoading: stLoading } =
    api.student.getStudents.useQuery();
  const { data: employees, isLoading: empLoading } =
    api.employee.getEmployees.useQuery();
  const { data: exams } = api.exam.getAllExams.useQuery();

  const unassigned = students?.filter((s) => !s.isAssign).length ?? 0;
  const ongoingExams = exams?.filter((e) => e.status === "ONGOING").length ?? 0;

  const tasks = [
    {
      label: "Unassigned Students",
      value: unassigned,
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Exams Needs Marks",
      value: ongoingExams,
      icon: CheckSquare,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Employees",
      value: employees?.length ?? 0,
      icon: Receipt,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Fee Structures",
      value: "—",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="rounded-lg bg-blue-500/10 p-1.5">
            <ClipboardList className="h-4 w-4 text-blue-400" />
          </div>
          Today&apos;s Task Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {stLoading || empLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-muted" />
          ))
        ) : (
          tasks.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.label}
                className={`flex flex-col items-start gap-1.5 rounded-lg border border-border p-3 ${task.bg}`}
              >
                <Icon className={`h-4 w-4 ${task.color}`} />
                <span className="text-xs text-muted-foreground">{task.label}</span>
                <Badge
                  variant="outline"
                  className={`border-border bg-transparent text-sm font-bold ${task.color}`}
                >
                  {task.value}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default function ClerkDashboard() {
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6 p-6">
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
          <ClerkTaskPanel />
          <TodayAtAGlance />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card px-4 py-3"
      >
        <QuickActionToolbar basePrefix="/clerk" />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatsCards />
      </motion.div>

      {/* Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="management" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 shadow-lg shadow-blue-500/20">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Clerk Control Center</h2>
                <p className="text-xs text-muted-foreground">Full admin-equivalent access</p>
              </div>
            </div>
            <TabsList className="border border-border bg-card p-1">
              <TabsTrigger value="management" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Management</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="management" className="mt-0 focus-visible:outline-none">
              <AdminCards basePrefix="/clerk" />
            </TabsContent>
            <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
              <ActivityFeed basePrefix="/clerk" />
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
