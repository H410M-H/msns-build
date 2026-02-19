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
  BookOpen
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { TeacherSection } from "~/components/blocks/dashboard/teacher";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
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
    border: "border-blue-500/20"
  },
  {
    title: "Pending Grades",
    value: "12",
    description: "Assignments to review",
    icon: CheckCircle2,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  {
    title: "Next Class",
    value: "10:30 AM",
    description: "Computer Science - Lab 2",
    icon: Clock,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  }
];

export default function TeacherDashboard() {
  const breadcrumbs = [{ href: "/teacher", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
      >
        {TEACHER_ANALYTICS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border ${stat.border} bg-slate-900/40 backdrop-blur-sm`}>
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
        className="w-full rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
         <Tabs defaultValue="classes" className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 px-6 py-4 bg-black/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                   <BookOpen className="h-5 w-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white tracking-tight">Academic Overview</h2>
              </div>
              <TabsList className="bg-slate-950/50 border border-white/5 p-1">
                <TabsTrigger value="classes" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <GraduationCap className="h-4 w-4" /> <span className="hidden sm:inline">My Classes</span>
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                    <Calendar className="h-4 w-4" /> <span className="hidden sm:inline">Schedule</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6 w-full">
              <TabsContent value="classes" className="mt-0 focus-visible:outline-none w-full space-y-6">
                <div className="flex justify-end">
                    <Link href="/teacher/exams/marks">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            Enter Exam Marks
                        </Button>
                    </Link>
                </div>
                <TeacherSection />
              </TabsContent>

              <TabsContent value="events" className="mt-0 focus-visible:outline-none w-full">
                <Card className="border-0 bg-transparent shadow-none w-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">Upcoming Events</h3>
                      <p className="text-sm text-slate-400">School calendar and holidays</p>
                    </div>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-slate-800/50" />}>
                      <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden w-full">
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