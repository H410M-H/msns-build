"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Calendar } from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile"; // Reusing profile section for consistency
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

export default function StudentDashboard() {
  const breadcrumbs = [{ href: "/student", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 px-4 sm:px-6">
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
            <AlertDescription className="flex items-center justify-between">
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

      {/* Performance Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
      >
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Overall GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">3.85</div>
            <p className="text-xs text-muted-foreground mt-1">Excellent Performance</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">94%</div>
            <p className="text-xs text-muted-foreground mt-1">Perfect Record</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">12/12</div>
            <p className="text-xs text-muted-foreground mt-1">All Submitted</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">8/8</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Academic Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardTitle>Academic Progress</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  View Report
                </Button>
              </div>
              <CardDescription>Current term performance</CardDescription>
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
                <CardTitle>Upcoming</CardTitle>
              </div>
              <CardDescription>Exams, assignments, and events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {UPCOMING_TASKS.map((task, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-lg border border-border bg-black/20 p-3 transition-colors hover:bg-black/30"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${
                      task.type === "exam"
                        ? "bg-red-400"
                        : task.type === "assignment"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                    }`}
                  />
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      {task.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.date}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="mt-2 w-full border-border text-foreground hover:bg-white/5"
              >
                View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
