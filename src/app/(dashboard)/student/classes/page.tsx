"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Calendar, Clock } from "lucide-react";
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
import Link from "next/link";

const STUDENT_CLASSES = [
  {
    id: "CLS-001",
    name: "Class 5 - Section A",
    level: "Class 5",
    section: "ROSE",
    totalStudents: 32,
    subjects: ["Mathematics", "English", "Science", "Social Studies"],
    classTeacher: "Mrs. Fatima Khan",
    schedule: "Monday - Friday, 8:00 AM - 2:00 PM",
  },
];

const SUBJECTS = [
  {
    id: "SUB-001",
    name: "Mathematics",
    teacher: "Mr. Ahmed Hassan",
    code: "MTH-101",
    sessions: 48,
    attended: 42,
    schedule: "Mon, Wed, Fri - 8:00 AM",
  },
  {
    id: "SUB-002",
    name: "English",
    teacher: "Ms. Ayesha Ali",
    code: "ENG-101",
    sessions: 48,
    attended: 45,
    schedule: "Tue, Thu, Sat - 9:00 AM",
  },
  {
    id: "SUB-003",
    name: "Science",
    teacher: "Dr. Muhammad Raza",
    code: "SCI-101",
    sessions: 36,
    attended: 34,
    schedule: "Mon, Wed - 10:30 AM",
  },
  {
    id: "SUB-004",
    name: "Social Studies",
    teacher: "Mr. Hassan Malik",
    code: "SOC-101",
    sessions: 36,
    attended: 33,
    schedule: "Tue, Thu - 11:30 AM",
  },
];

export default function StudentClassesPage() {
  const breadcrumbs = [
    { href: "/student", label: "Dashboard", current: false },
    { href: "/student/classes", label: "Classes", current: true },
  ];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Current Class Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader>
            <CardTitle>Current Class</CardTitle>
            <CardDescription>
              Your enrolled class and section information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {STUDENT_CLASSES.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-lg border border-border bg-black/20 p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {cls.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Class Teacher: {cls.classTeacher}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Level</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {cls.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Section</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {cls.section}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Students
                      </p>
                      <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                        <Users className="h-4 w-4" />
                        {cls.totalStudents}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Class Hours
                      </p>
                      <p className="mt-1 flex items-center gap-2 font-semibold text-foreground">
                        <Clock className="h-4 w-4" />
                        6 hours
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <p className="mt-1 font-medium text-foreground">
                      {cls.schedule}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Subjects ({cls.subjects.length})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {cls.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subjects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="all"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <BookOpen className="h-4 w-4" /> All Subjects
            </TabsTrigger>
            <TabsTrigger
              value="teachers"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Users className="h-4 w-4" /> Teachers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-6 md:grid-cols-2">
              {SUBJECTS.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {subject.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {subject.teacher}
                          </CardDescription>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {subject.code}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Class Attendance
                        </p>
                        <div className="mt-2 space-y-2">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                              style={{
                                width: `${(subject.attended / subject.sessions) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-emerald-400">
                            {subject.attended} / {subject.sessions} sessions
                            ({Math.round((subject.attended / subject.sessions) * 100)}%)
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">
                          Class Schedule
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                          <Calendar className="h-4 w-4" />
                          {subject.schedule}
                        </p>
                      </div>

                      <Link href={`/student/classes/${subject.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="teachers">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Class Teachers</CardTitle>
                <CardDescription>
                  Contact information and subjects taught
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SUBJECTS.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-black/20 p-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground">
                          {subject.teacher}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {subject.name}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Contact
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
