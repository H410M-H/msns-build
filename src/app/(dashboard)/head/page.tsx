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
  GraduationCap
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile"; // Kept Head specific
import { ClerkSection } from "~/components/blocks/dashboard/clerk";     // Kept Head specific
import { StatsCards } from "~/components/cards/StatCard";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

// --- Lazy Load ---
const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

// --- Analytics Configuration (Head Specific) ---
const HEAD_ANALYTICS_CARDS = [
  {
    title: "Student Performance",
    description: "Average grade across departments",
    value: "B+",
    trend: "up",
    icon: GraduationCap,
    color: "blue",
    gradient: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-400"
  },
  {
    title: "Course Enrollment",
    description: "Total active enrollments",
    value: "1,240",
    trend: "up",
    icon: BookOpen,
    color: "amber",
    gradient: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-400"
  },
  {
    title: "Staff Activity",
    description: "Daily active staff members",
    value: "92%",
    trend: "neutral",
    icon: Users,
    color: "pink",
    gradient: "from-pink-500/10 to-pink-500/5",
    border: "border-pink-500/20",
    text: "text-pink-400"
  }
];

export default function HeadDashboard() {
  const breadcrumbs = [{ href: "/head", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8">
      
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Top Section: Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Welcome Section (Main Focus) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8"
        >
           <WelcomeSection />
        </motion.div>

        {/* Profile/Quick Info (Side Panel) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          {/* Wrapping ProfileSection to match the card aesthetic if it isn't already styled */}
          <div className="h-full">
            <ProfileSection /> 
          </div>
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

      {/* Main Content Tabs */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-4xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
         <Tabs defaultValue="management" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 px-6 py-4 bg-black/20">
              <h2 className="text-xl font-semibold text-white tracking-tight">Institutional Overview</h2>
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

            <div className="p-4 sm:p-6">
              
              {/* Tab 1: Clerk/Management */}
              <TabsContent value="management" className="mt-0 focus-visible:outline-hidden">
                <ClerkSection />
              </TabsContent>

              {/* Tab 2: Events */}
              <TabsContent value="events" className="mt-0 focus-visible:outline-hidden">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">Academic Calendar</h3>
                      <p className="text-sm text-slate-400">Manage upcoming departmental events</p>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                      <Plus className="h-4 w-4" /> Add Event
                    </Button>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-slate-800/50" />}>
                      <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
                        <EventsTable />
                      </div>
                  </Suspense>
                </Card>
              </TabsContent>

              {/* Tab 3: Analytics */}
              <TabsContent value="analytics" className="mt-0 focus-visible:outline-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {HEAD_ANALYTICS_CARDS.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <Card key={idx} className={`group bg-linear-to-br ${card.gradient} ${card.border} border bg-opacity-50 hover:bg-opacity-100 transition-all duration-300 hover:-translate-y-1`}>
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
