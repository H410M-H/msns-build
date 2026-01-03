// src/app/(dashboard)/student/page.tsx
"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Calendar, 
  Trophy, 
  Target,
  Clock
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { StudentSection } from "~/components/blocks/dashboard/student";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

// --- Student Specific Analytics ---
const STUDENT_ANALYTICS = [
  {
    title: "Attendance",
    value: "94%",
    description: "Present this month",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    title: "CGPA",
    value: "3.8",
    description: "Last semester: 3.6",
    icon: Trophy,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    title: "Assignments",
    value: "3",
    description: "Due this week",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  }
];

export default function StudentDashboard() {
  const breadcrumbs = [{ href: "/student", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8">
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
          <div className="h-full">
            <ProfileSection /> 
          </div>
        </motion.div>
      </div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {STUDENT_ANALYTICS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border ${stat.border} bg-slate-900/40 backdrop-blur-xs`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
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
        className="rounded-4xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
         <Tabs defaultValue="courses" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 px-6 py-4 bg-black/20">
              <h2 className="text-xl font-semibold text-white tracking-tight">Student Portal</h2>
              <TabsList className="bg-slate-950/50 border border-white/5 p-1">
                <TabsTrigger value="courses" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">My Courses</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <Calendar className="h-4 w-4" /> <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6">
              <TabsContent value="courses" className="mt-0 focus-visible:outline-hidden">
                <StudentSection />
              </TabsContent>

              <TabsContent value="events" className="mt-0 focus-visible:outline-hidden">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">Events Calendar</h3>
                      <p className="text-sm text-slate-400">Stay updated with institution events</p>
                    </div>
                  </div>
                  <Suspense fallback={<Skeleton className="h-75 w-full rounded-xl bg-slate-800/50" />}>
                      <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
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