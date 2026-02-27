"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  BookOpen,
  Clock,
  FileText,
  Zap,
  CheckCircle2
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Link from "next/link";

// Mock data - replace with TRPC call later
const ACADEMIC_PROGRESS = [
  { subject: "Mathematics", progress: 85, grade: "A" },
  { subject: "Physics", progress: 78, grade: "B+" },
  { subject: "Computer Science", progress: 92, grade: "A+" },
  { subject: "English", progress: 88, grade: "A" },
];

const UPCOMING_TASKS = [
  { title: "Midterm Exam: Physics", date: "Tomorrow, 9:00 AM", type: "exam" },
  { title: "Assignment: Calculus", date: "Due in 2 days", type: "assignment" },
  { title: "Science Fair Registration", date: "Due on Friday", type: "event" },
];

const QUICK_ACTIONS = [
  { label: "View Fees", href: "/student/fees", icon: FileText },
  { label: "Assignments", href: "/student/assignments", icon: BookOpen },
  { label: "Report Card", href: "/student/report-card", icon: CheckCircle2 },
  { label: "Timetable", href: "/student/timetable", icon: Calendar },
];

export default function StudentDashboard() {
  const breadcrumbs = [{ href: "/student", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section: Welcome & Profile */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-8"
        >
          <WelcomeSection />

          {/* Fee Alert */}
          <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Outstanding Fees</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>You have a pending tuition fee balance for February.</span>
              <Link href="/student/fees">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                >
                  View Details
                </Button>
              </Link>
            </AlertDescription>
          </Alert>

          {/* Quick Actions Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Zap className="h-4 w-4 text-emerald-500" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Link key={idx} href={action.href}>
                      <Button
                        variant="outline"
                        className="w-full flex-col gap-2 border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-xs text-emerald-200 hover:bg-emerald-500/20"
                      >
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Academic Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Academic Progress</CardTitle>
                    <CardDescription>Current term performance</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {ACADEMIC_PROGRESS.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{item.subject}</span>
                    <span className="font-mono text-emerald-400">
                      {item.grade} ({item.progress}%)
                    </span>
                  </div>
                  <Progress
                    value={item.progress}
                    className="h-2 bg-muted text-emerald-500"
                  />
                </div>
              ))}
              <Link href="/student/report-card">
                <Button
                  variant="outline"
                  className="w-full text-emerald-400 hover:bg-emerald-500/10"
                >
                  View Full Report Card
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Upcoming</CardTitle>
                  <CardDescription>Exams, assignments, and events</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {UPCOMING_TASKS.map((task, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-lg border border-border bg-black/20 p-3 transition-colors hover:bg-black/30"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      task.type === "exam"
                        ? "bg-red-400"
                        : task.type === "assignment"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {task.title}
                    </h4>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.date}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/student/calendar">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-white/5"
                >
                  View Full Calendar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <Tabs defaultValue="attendance" className="w-full">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-border dark:bg-black/20">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                More Information
              </h2>
              <TabsList className="border border-border bg-card p-1">
                <TabsTrigger
                  value="attendance"
                  className="gap-2 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground sm:text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Attendance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="subjects"
                  className="gap-2 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground sm:text-sm"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Subjects</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">
              <TabsContent value="attendance" className="mt-0 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">92%</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">5</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">3</p>
                    <p className="text-xs text-muted-foreground">Leave</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="subjects" className="mt-0">
                <div className="space-y-3">
                  {ACADEMIC_PROGRESS.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border bg-black/20 p-4"
                    >
                      <span className="font-medium text-foreground">
                        {item.subject}
                      </span>
                      <span className="text-sm text-emerald-400">
                        {item.grade}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
