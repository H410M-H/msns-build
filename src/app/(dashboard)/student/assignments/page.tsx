"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
} from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

const ACTIVE_ASSIGNMENTS = [
  {
    id: "ASG-001",
    subject: "Mathematics",
    title: "Chapter 5 - Linear Equations",
    description: "Solve 20 problems on linear equations and systems",
    issuedDate: "2025-01-15",
    dueDate: "2025-01-22",
    status: "pending",
    submittedDate: null,
    totalMarks: 20,
    obtainedMarks: null,
    feedback: null,
  },
  {
    id: "ASG-002",
    subject: "English",
    title: "Essay: My Summer Vacation",
    description: "Write a 2-page essay about your summer vacation experiences",
    issuedDate: "2025-01-10",
    dueDate: "2025-01-25",
    status: "submitted",
    submittedDate: "2025-01-20",
    totalMarks: 25,
    obtainedMarks: 22,
    feedback: "Excellent work! Good vocabulary and structure.",
  },
  {
    id: "ASG-003",
    subject: "Science",
    title: "Lab Report: Photosynthesis",
    description: "Complete the lab report on photosynthesis experiment",
    issuedDate: "2025-01-08",
    dueDate: "2025-01-20",
    status: "submitted",
    submittedDate: "2025-01-19",
    totalMarks: 30,
    obtainedMarks: 28,
    feedback: "Well-documented and accurate observations.",
  },
];

const COMPLETED_ASSIGNMENTS = [
  {
    id: "ASG-004",
    subject: "Social Studies",
    title: "Project: Historical Monuments",
    issuedDate: "2024-12-15",
    dueDate: "2024-12-31",
    submittedDate: "2024-12-29",
    totalMarks: 40,
    obtainedMarks: 35,
    status: "graded",
    feedback: "Good research! Add more details about the historical context.",
  },
  {
    id: "ASG-005",
    subject: "Mathematics",
    title: "Chapter 4 - Geometry Basics",
    issuedDate: "2024-12-10",
    dueDate: "2024-12-20",
    submittedDate: "2024-12-18",
    totalMarks: 20,
    obtainedMarks: 18,
    status: "graded",
    feedback: "Most answers are correct. Be careful with angle measurements.",
  },
];

export default function StudentAssignmentsPage() {
  const [openDialog, setOpenDialog] = useState(false);

  const breadcrumbs = [
    { href: "/student", label: "Dashboard", current: false },
    { href: "/student/assignments", label: "Assignments", current: true },
  ];

  const pendingCount = ACTIVE_ASSIGNMENTS.filter(
    (a) => a.status === "pending"
  ).length;
  const submittedCount = ACTIVE_ASSIGNMENTS.filter(
    (a) => a.status === "submitted"
  ).length;

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {ACTIVE_ASSIGNMENTS.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Assignments in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pendingCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting submission
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {submittedCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting grading
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
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="active"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Clock className="h-4 w-4" /> Active
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <CheckCircle className="h-4 w-4" /> Completed
            </TabsTrigger>
          </TabsList>

          {/* Active Assignments */}
          <TabsContent value="active">
            <div className="space-y-4">
              {ACTIVE_ASSIGNMENTS.map((assignment, index) => {
                const isOverdue = new Date(assignment.dueDate) < new Date();
                const daysLeft = Math.ceil(
                  (new Date(assignment.dueDate).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-foreground">
                                {assignment.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {assignment.subject}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                assignment.status === "pending"
                                  ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                                  : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              }`}
                            >
                              {assignment.status === "pending"
                                ? "Pending"
                                : "Submitted"}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground">
                            {assignment.description}
                          </p>

                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 md:grid-cols-3">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Issued
                              </p>
                              <p className="mt-1 font-medium text-foreground">
                                {assignment.issuedDate}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Due Date
                              </p>
                              <p
                                className={`mt-1 font-medium ${
                                  isOverdue
                                    ? "text-red-400"
                                    : "text-foreground"
                                }`}
                              >
                                {assignment.dueDate}
                              </p>
                            </div>
                            {assignment.submittedDate && (
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Submitted
                                </p>
                                <p className="mt-1 font-medium text-emerald-400">
                                  {assignment.submittedDate}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Status Alert */}
                          {isOverdue && assignment.status === "pending" && (
                            <Alert className="border-red-500/20 bg-red-500/10">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <AlertTitle className="text-red-200">
                                Overdue
                              </AlertTitle>
                              <AlertDescription className="text-red-100/70">
                                This assignment was due {Math.abs(daysLeft)}{" "}
                                days ago. Please submit as soon as possible.
                              </AlertDescription>
                            </Alert>
                          )}

                          {!isOverdue && assignment.status === "pending" && (
                            <Alert className="border-amber-500/20 bg-amber-500/10">
                              <Clock className="h-4 w-4 text-amber-500" />
                              <AlertTitle className="text-amber-200">
                                Due Soon
                              </AlertTitle>
                              <AlertDescription className="text-amber-100/70">
                                {daysLeft} days remaining to submit this
                                assignment.
                              </AlertDescription>
                            </Alert>
                          )}

                          {assignment.status === "submitted" &&
                            assignment.feedback && (
                              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                                <p className="text-xs font-medium text-emerald-200">
                                  Teacher Feedback
                                </p>
                                <p className="mt-1 text-sm text-emerald-100">
                                  {assignment.feedback}
                                </p>
                              </div>
                            )}

                          {assignment.obtainedMarks &&
                            assignment.status === "submitted" && (
                              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                                <p className="text-xs font-medium text-blue-200">
                                  Marks Obtained
                                </p>
                                <p className="mt-1 text-lg font-bold text-blue-400">
                                  {assignment.obtainedMarks} /{" "}
                                  {assignment.totalMarks}
                                </p>
                              </div>
                            )}

                          {/* Actions */}
                          <div className="flex gap-2 border-t border-border pt-4">
                            {assignment.status === "pending" && (
                              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                <DialogTrigger asChild>
                                  <Button className="flex-1 gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                                    <Upload className="h-4 w-4" /> Submit Now
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="border-slate-200 dark:border-border">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Submit Assignment
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="rounded-lg border-2 border-dashed border-emerald-500/30 p-6 text-center">
                                      <Upload className="mx-auto h-8 w-8 text-emerald-400" />
                                      <p className="mt-2 text-sm font-medium text-foreground">
                                        Drag and drop your file here
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        or click to select
                                      </p>
                                    </div>
                                    <Button className="w-full bg-emerald-600 text-foreground hover:bg-emerald-700">
                                      Submit Assignment
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="outline" className="flex-1 gap-2">
                              <Download className="h-4 w-4" /> Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Completed Assignments */}
          <TabsContent value="completed">
            <div className="space-y-4">
              {COMPLETED_ASSIGNMENTS.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-foreground">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {assignment.subject}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            Graded
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-y border-border py-4 md:grid-cols-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Submitted
                            </p>
                            <p className="mt-1 font-medium text-foreground">
                              {assignment.submittedDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Marks
                            </p>
                            <p className="mt-1 text-lg font-bold text-emerald-400">
                              {assignment.obtainedMarks}/
                              {assignment.totalMarks}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">
                              Feedback
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {assignment.feedback}
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full gap-2">
                          <Download className="h-4 w-4" /> Download Submission
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
