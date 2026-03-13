// File: src/app/(dashboard)/admin/page.tsx
"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Settings,
  Calendar,
  Users,
  Plus,
  ArrowUpRight,
  Sparkles,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { AdminSection } from "~/components/blocks/dashboard/admin";
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
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// --- Lazy Load Heavy Tables ---
const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

// --- Analytics Configuration ---
const ANALYTICS_CARDS = [
  {
    title: "Financial Health",
    description: "Revenue vs Expenses",
    value: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "emerald",
  },
  {
    title: "Student Enrollment",
    description: "Active students this session",
    value: "+8.2%",
    trend: "up",
    icon: Users,
    color: "cyan",
  },
  {
    title: "System Performance",
    description: "Uptime this month",
    value: "99.9%",
    trend: "neutral",
    icon: CheckCircle2,
    color: "purple",
  },
];

export default function DashboardPage() {
  const breadcrumbs = [{ href: "/admin", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 sm:space-y-8">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* System Alert Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <Alert className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Actions Required</AlertTitle>
          <AlertDescription>
            3 fee waivers pending approval, 2 promotion requests awaiting verification
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Top Section: Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Welcome Section (Spans full on mobile, 8 cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8"
        >
          <WelcomeSection />
        </motion.div>

        {/* Quick Actions (Spans full on mobile, 4 cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-3 lg:col-span-4"
        >
          <Card className="relative flex-1 overflow-hidden border-slate-200 bg-white shadow-lg transition-all dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-emerald-900/40 dark:to-slate-900/40 dark:shadow-xl dark:backdrop-blur-md">
            <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-10 dark:opacity-20">
              <Sparkles className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-foreground">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-emerald-100/60">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
              >
                <Plus className="mr-2 h-4 w-4" /> New User
              </Button>
              <Button
                variant="outline"
                className="border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-border dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10"
              >
                <FileText className="mr-2 h-4 w-4" /> Reports
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20"
              >
                <Users className="mr-2 h-4 w-4" /> Users
              </Button>
              <Button
                variant="outline"
                className="border-purple-200 bg-purple-50 text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200 dark:hover:bg-purple-500/20"
              >
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Full Width Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatsCards />
      </motion.div>

      {/* Institutional Overview Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/50 shadow-sm backdrop-blur-xl dark:border-border dark:bg-card dark:shadow-2xl"
      >
        <Tabs defaultValue="management" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-black/20 sm:flex-row">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-foreground">
              System Overview
            </h2>
            <TabsList className="border border-slate-200/50 bg-slate-200/50 p-1 dark:border-border dark:bg-card">
              <TabsTrigger
                value="management"
                className="gap-2 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
              >
                <Settings className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Management</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
              >
                <Calendar className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-2 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
              >
                <BarChart3 className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent
              value="management"
              className="mt-0 focus-visible:outline-none"
            >
              <AdminSection />
            </TabsContent>

            <TabsContent
              value="events"
              className="mt-0 focus-visible:outline-none"
            >
              <Card className="border-0 bg-transparent shadow-none">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
                      Upcoming Events
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      Schedule and manage institutional calendar
                    </p>
                  </div>
                  <Button className="gap-2 bg-emerald-600 text-foreground shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 active:scale-95 dark:shadow-emerald-900/20">
                    <Plus className="h-4 w-4" /> Create Event
                  </Button>
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
              </Card>
            </TabsContent>

            <TabsContent
              value="analytics"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {ANALYTICS_CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  // Dynamic Styles based on color prop for both Light/Dark modes
                  const colorStyles =
                    {
                      emerald:
                        "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                      cyan: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
                      purple:
                        "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-600 dark:text-purple-400",
                    }[card.color] ?? "bg-slate-50 dark:bg-muted";

                  return (
                    <Card
                      key={idx}
                      className={`group border ${colorStyles} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                          <Icon className="h-5 w-5 opacity-80" />
                          {card.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-bold text-slate-900 dark:text-foreground">
                            {card.value}
                          </span>
                          <div className="flex items-center rounded-full border border-black/5 bg-white/50 px-2 py-1 text-xs font-medium opacity-80 dark:border-border dark:bg-white/5">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            {card.trend === "up" ? "Trending Up" : "Stable"}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 opacity-90 dark:text-muted-foreground">
                          {card.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
