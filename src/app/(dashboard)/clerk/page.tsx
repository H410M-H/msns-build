"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Settings, 
  Calendar, 
  Users, 
  BookOpen, 
  Plus,
  ArrowUpRight,
  Sparkles
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

// --- Lazy Load Heavy Tables ---
const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

// --- Analytics Configuration ---
const ANALYTICS_CARDS = [
  {
    title: "User Engagement",
    description: "Active users vs Total users",
    value: "+12.5%",
    trend: "up",
    icon: Users,
    color: "emerald",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    text: "text-emerald-400"
  },
  {
    title: "Course Velocity",
    description: "Completion rate this term",
    value: "+8.2%",
    trend: "up",
    icon: BookOpen,
    color: "cyan",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
    text: "text-cyan-400"
  },
  {
    title: "Event Attendance",
    description: "Average turnout per event",
    value: "84%",
    trend: "neutral",
    icon: Calendar,
    color: "purple",
    gradient: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    text: "text-purple-400"
  }
];

export default function DashboardPage() {
  const breadcrumbs = [{ href: "/admin", label: "Dashboard", current: true }];

  return (
    // Ensure the container is w-full to fill the parent <main>
    <div className="w-full space-y-8">
      
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Top Section: Grid Layout - Uses full width of container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8"
        >
           <WelcomeSection />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 flex flex-col h-full"
        >
          <Card className="flex-1 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 border-emerald-500/20 backdrop-blur-md relative overflow-hidden shadow-xl min-h-[200px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <Sparkles className="h-12 w-12 text-emerald-400" />
            </div>
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-emerald-100/60">Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button size="sm" variant="secondary" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-500/20 transition-colors w-full">
                <Plus className="mr-2 h-4 w-4" /> New User
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors w-full">
                <BarChart3 className="mr-2 h-4 w-4" /> Reports
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
        className="w-full"
      >
        <StatsCards />
      </motion.div>

      {/* Institutional Overview Tabs - Full Width Container */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
         <Tabs defaultValue="management" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 px-6 py-4 bg-black/20">
              <h2 className="text-xl font-semibold text-white tracking-tight">System Overview</h2>
              <TabsList className="bg-slate-950/50 border border-white/5 p-1">
                <TabsTrigger value="management" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Management</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <Calendar className="h-4 w-4" /> <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6 w-full">
              <TabsContent value="management" className="mt-0 focus-visible:outline-none w-full">
                <AdminSection />
              </TabsContent>

              <TabsContent value="events" className="mt-0 focus-visible:outline-none w-full">
                <Card className="border-0 bg-transparent shadow-none w-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">Upcoming Events</h3>
                      <p className="text-sm text-slate-400">Schedule and manage institutional calendar</p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                      <Plus className="h-4 w-4" /> Create Event
                    </Button>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-slate-800/50" />}>
                      <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden w-full">
                        <EventsTable />
                      </div>
                  </Suspense>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="mt-0 focus-visible:outline-none w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {ANALYTICS_CARDS.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <Card key={idx} className={`group bg-gradient-to-br ${card.gradient} ${card.border} border bg-opacity-50 hover:bg-opacity-100 transition-all duration-300 hover:-translate-y-1`}>
                        <CardHeader className="pb-2">
                          <CardTitle className={`flex items-center gap-2 text-base font-medium ${card.text}`}>
                            <Icon className="h-5 w-5" />
                            {card.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-bold text-white">{card.value}</span>
                            <div className={`flex items-center text-xs font-medium ${card.text} bg-white/5 px-2 py-1 rounded-full border border-white/5`}>
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              {card.trend === "up" ? "Trending Up" : "Stable"}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-slate-400">{card.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </div>
         </Tabs>
      </motion.section>
    </div>
  );
}