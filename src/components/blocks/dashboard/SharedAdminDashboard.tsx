"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { BarChart3, Settings, Calendar, Plus } from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { StatsCards } from "~/components/cards/StatCard";
import { RevenueAnalyticsChart } from "~/components/blocks/dashboard/AnalyticsCharts";
import { ActivityFeed } from "~/components/blocks/dashboard/ActivityFeed";
import { BroadcastBoard } from "~/components/blocks/dashboard/BroadcastBoard";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

function Fade({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type Props = {
  role: "admin" | "head" | "principal" | "clerk";
  ManagementSection: React.ComponentType;
};

export function SharedAdminDashboard({ role, ManagementSection }: Props) {
  const base = `/${role}`;
  const breadcrumbs = [{ href: base, label: "Dashboard", current: true }];

  return (
    <div className="w-full mx-auto max-w-[1600px] space-y-4">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Welcome – compact on lg */}
      <Fade delay={0}>
        <WelcomeSection />
      </Fade>

      {/* Management / Events / Analytics tabs */}
      <Fade delay={0.07}>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white/50 shadow-sm backdrop-blur-xl dark:border-border dark:bg-card">
          <Tabs defaultValue="management" className="w-full">
            <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60 px-4 py-3 dark:border-border dark:bg-black/20 sm:flex-row sm:px-5">
              <h2 className="text-base font-bold tracking-tight text-slate-800 dark:text-foreground">
                System Overview
              </h2>
              <TabsList className="border border-slate-200 bg-white/70 p-1 shadow-sm dark:border-border dark:bg-card">
                <TabsTrigger
                  value="management"
                  className="gap-1.5 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:text-foreground"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Management</span>
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="gap-1.5 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:text-foreground"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="gap-1.5 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:text-foreground"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-5">
              <TabsContent value="management" className="mt-0 focus-visible:outline-none">
                <ManagementSection />
              </TabsContent>

              <TabsContent value="events" className="mt-0 focus-visible:outline-none">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                      Upcoming Events
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Institutional calendar and schedule
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2 self-start bg-emerald-600 text-white hover:bg-emerald-700 sm:self-auto"
                  >
                    <Plus className="h-4 w-4" /> Create Event
                  </Button>
                </div>
                <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-black/20">
                    <EventsTable />
                  </div>
                </Suspense>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 focus-visible:outline-none">
                <RevenueAnalyticsChart />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </Fade>

      {/* Stats – 4 cols on xl, 2 on sm */}
      <Fade delay={0.14}>
        <StatsCards />
      </Fade>

      {/* Chart, Activity, and Broadcasts layered grid */}
      <Fade delay={0.21} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Revenue chart takes full width on tablet, half on ultra-wide */}
        <div className="md:col-span-2 xl:col-span-2">
          <RevenueAnalyticsChart />
        </div>
        {/* Activity and Broadcasts fill the remaining spaces side-by-side on tablet, or single row on 4k */}
        <div className="md:col-span-1 xl:col-span-1">
          <ActivityFeed />
        </div>
        <div className="md:col-span-1 xl:col-span-1">
          <BroadcastBoard />
        </div>
      </Fade>
    </div>
  );
}
