"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, BarChart3, Plus } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import Link from "next/link";

const TEACHER_CLASSES = [
  {
    id: "CLS-001",
    name: "Class 5 - Section A",
    level: "Class 5",
    totalStudents: 32,
    presentToday: 28,
    presentThisMonth: "87%",
    subjects: ["Mathematics"],
    schedule: "Mon, Wed, Fri - 8:00 AM",
    status: "active",
  },
  {
    id: "CLS-002",
    name: "Class 4 - Section B",
    level: "Class 4",
    totalStudents: 28,
    presentToday: 24,
    presentThisMonth: "82%",
    subjects: ["Mathematics"],
    schedule: "Tue, Thu, Sat - 9:00 AM",
    status: "active",
  },
];

const ATTENDANCE_DATA = [
  { date: "Monday", present: 28, absent: 4, onLeave: 0 },
  { date: "Tuesday", present: 30, absent: 2, onLeave: 0 },
  { date: "Wednesday", present: 29, absent: 3, onLeave: 0 },
  { date: "Thursday", present: 31, absent: 1, onLeave: 0 },
  { date: "Friday", present: 27, absent: 3, onLeave: 2 },
];

export default function TeacherClassesPage() {
  const breadcrumbs = [
    { href: "/teacher", label: "Dashboard", current: false },
    { href: "/teacher/classes", label: "My Classes", current: true },
  ];

  const totalEnrolled = TEACHER_CLASSES.reduce((sum, cls) => sum + cls.totalStudents, 0);

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {TEACHER_CLASSES.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Classes assigned to you
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalEnrolled}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Attendance
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">85%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              This month average
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="classes"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <BookOpen className="h-4 w-4" /> My Classes
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Users className="h-4 w-4" /> Attendance
            </TabsTrigger>
          </TabsList>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <div className="grid gap-6 md:grid-cols-2">
              {TEACHER_CLASSES.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{cls.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {cls.level}
                          </CardDescription>
                        </div>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                          Active
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Students Present Today
                          </p>
                          <span className="text-sm font-medium text-emerald-400">
                            {cls.presentToday}/{cls.totalStudents}
                          </span>
                        </div>
                        <Progress
                          value={(cls.presentToday / cls.totalStudents) * 100}
                          className="h-2 bg-muted"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total Students
                          </p>
                          <p className="mt-1 text-lg font-bold text-foreground">
                            {cls.totalStudents}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Monthly Attendance
                          </p>
                          <p className="mt-1 text-lg font-bold text-emerald-400">
                            {cls.presentThisMonth}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="text-xs text-muted-foreground">
                          Schedule
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {cls.schedule}
                        </p>
                      </div>

                      <div className="flex gap-2 border-t border-border pt-4">
                        <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Button className="flex-1 gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                          <Plus className="h-4 w-4" /> Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Weekly Attendance Overview</CardTitle>
                <CardDescription>
                  Attendance record for the current week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ATTENDANCE_DATA.map((day, index) => {
                    const total = day.present + day.absent + day.onLeave;
                    const percentage = (day.present / total) * 100;

                    return (
                      <div
                        key={index}
                        className="rounded-lg border border-border bg-black/20 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {day.date}
                          </h4>
                          <span className="text-sm font-medium text-emerald-400">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="mt-3 flex gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Present:{" "}
                            </span>
                            <span className="font-medium text-emerald-400">
                              {day.present}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Absent:{" "}
                            </span>
                            <span className="font-medium text-red-400">
                              {day.absent}
                            </span>
                          </div>
                          {day.onLeave > 0 && (
                            <div>
                              <span className="text-muted-foreground">
                                Leave:{" "}
                              </span>
                              <span className="font-medium text-amber-400">
                                {day.onLeave}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" className="mt-6 w-full">
                  View Detailed Attendance Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
