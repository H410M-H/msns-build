// File: src/app/(dashboard)/admin/page.tsx
"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { BarChart3, Settings, Calendar, Shield, Trophy } from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { StatsCards } from "~/components/cards/StatCard";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Shared dashboard widgets
import { TodayAtAGlance } from "~/components/dashboard/TodayAtAGlance";
import { ActionRequired } from "~/components/dashboard/ActionRequired";
import { ActivityFeed } from "~/components/dashboard/ActivityFeed";
import { QuickActionToolbar } from "~/components/dashboard/QuickActionToolbar";
import { PinnedNotices } from "~/components/dashboard/PinnedNotices";
import AdminCards from "~/components/cards/AdminCard";

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

export default function DashboardPage() {
  const breadcrumbs = [{ href: "/admin", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 sm:space-y-8">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section: Welcome + Today at a Glance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:col-span-8"
        >
          <WelcomeSection />
          {/* Pinned Notices */}
          <PinnedNotices />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 lg:col-span-4"
        >
          <TodayAtAGlance />
          <ActionRequired role="ADMIN" basePrefix="/admin" />
        </motion.div>
      </div>

      {/* Quick Actions Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card px-4 py-3"
      >
        <QuickActionToolbar basePrefix="/admin" />
      </motion.div>

      {/* Full Width Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatsCards />
      </motion.div>

      {/* Main content tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/50 shadow-sm backdrop-blur-xl dark:border-border dark:bg-card dark:shadow-2xl"
      >
        <Tabs defaultValue="management" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-black/20 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg shadow-emerald-500/20">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-foreground">
                  System Overview
                </h2>
                <p className="text-xs text-muted-foreground">Full administrative control</p>
              </div>
            </div>
            <TabsList className="border border-slate-200/50 bg-slate-200/50 p-1 dark:border-border dark:bg-card">
              <TabsTrigger
                value="management"
                className="gap-2 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Management</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="gap-2 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="management" className="mt-0 focus-visible:outline-none">
              <div className="mb-6 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-muted-foreground">
                  Admin Access — Full System Control
                </span>
              </div>
              <AdminCards basePrefix="/admin" />
            </TabsContent>

            <TabsContent value="events" className="mt-0 focus-visible:outline-none">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
                    Upcoming Events
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Institutional calendar and event management
                  </p>
                </div>
              </div>
              <Suspense
                fallback={
                  <Skeleton className="h-[300px] w-full rounded-xl bg-slate-200 dark:bg-muted" />
                }
              >
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-black/20">
                  <EventsTable />
                </div>
              </Suspense>
            </TabsContent>

            <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
              <ActivityFeed basePrefix="/admin" />
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
