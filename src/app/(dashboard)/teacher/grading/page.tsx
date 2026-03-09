"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock, AlertCircle, Save } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

const PENDING_SUBMISSIONS = [
  {
    id: "SUB-001",
    assignmentId: "ASG-001",
    assignmentTitle: "Chapter 5 - Linear Equations",
    studentName: "Ali Khan",
    admissionNo: "ADM-001",
    submittedDate: "2025-01-20",
    totalMarks: 20,
    marks: null,
    feedback: null,
  },
  {
    id: "SUB-002",
    assignmentId: "ASG-001",
    assignmentTitle: "Chapter 5 - Linear Equations",
    studentName: "Sara Ahmed",
    admissionNo: "ADM-025",
    submittedDate: "2025-01-19",
    totalMarks: 20,
    marks: 18,
    feedback: "Good work! A few minor calculations could be improved.",
  },
  {
    id: "SUB-003",
    assignmentId: "ASG-003",
    assignmentTitle: "Quiz: Fractions and Decimals",
    studentName: "Bilal Raza",
    admissionNo: "ADM-042",
    submittedDate: "2025-01-21",
    totalMarks: 10,
    marks: null,
    feedback: null,
  },
];

const GRADED_SUBMISSIONS = [
  {
    id: "SUB-004",
    assignmentTitle: "Essay: My Summer Vacation",
    studentName: "Fatima Hassan",
    marks: 22,
    totalMarks: 25,
    gradedDate: "2025-01-15",
    feedback: "Excellent essay! Well-structured and engaging.",
  },
];

export default function TeacherGradingPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<typeof PENDING_SUBMISSIONS[0] | null>(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  const breadcrumbs = [
    { href: "/teacher", label: "Dashboard", current: false },
    { href: "/teacher/grading", label: "Grading", current: true },
  ];

  const pendingCount = PENDING_SUBMISSIONS.filter((s) => !s.marks).length;
  const gradedCount = GRADED_SUBMISSIONS.length;

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
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {PENDING_SUBMISSIONS.length + GRADED_SUBMISSIONS.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All submitted assignments
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pendingCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting evaluation
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Graded
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {gradedCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Completed evaluations
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
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="pending"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Clock className="h-4 w-4" /> Pending
            </TabsTrigger>
            <TabsTrigger
              value="graded"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <CheckCircle className="h-4 w-4" /> Graded
            </TabsTrigger>
          </TabsList>

          {/* Pending Submissions */}
          <TabsContent value="pending">
            {pendingCount > 0 && (
              <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-200">
                    {pendingCount} submission{pendingCount !== 1 ? 's' : ''} awaiting grading
                  </p>
                  <p className="text-sm text-amber-100/70">
                    Complete grading to provide feedback to students
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {PENDING_SUBMISSIONS.map((submission, index) => (
                <motion.div
                  key={submission.id}
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
                            <h3 className="font-semibold text-foreground">
                              {submission.studentName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {submission.admissionNo} · {submission.assignmentTitle}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              submission.marks
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {submission.marks ? "Graded" : "Pending"}
                          </span>
                        </div>

                        {/* Submission Info */}
                        <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                          Submitted: {submission.submittedDate}
                        </div>

                        {/* Marks and Feedback (if graded) */}
                        {submission.marks && (
                          <div className="space-y-2 border-t border-border pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Marks
                              </span>
                              <span className="font-semibold text-emerald-400">
                                {submission.marks}/{submission.totalMarks}
                              </span>
                            </div>
                            {submission.feedback && (
                              <div className="rounded-lg bg-black/20 p-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Feedback
                                </p>
                                <p className="mt-1 text-sm text-foreground">
                                  {submission.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        {!submission.marks && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-full gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setMarks("");
                                  setFeedback("");
                                }}
                              >
                                <FileText className="h-4 w-4" /> Grade Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-slate-200 dark:border-border">
                              <DialogHeader>
                                <DialogTitle>
                                  Grade Submission - {submission.studentName}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedSubmission?.id === submission.id && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Marks Obtained (out of{" "}
                                      {submission.totalMarks})
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={submission.totalMarks}
                                      value={marks}
                                      onChange={(e) => setMarks(e.target.value)}
                                      placeholder="0"
                                      className="border-slate-200 dark:border-border"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Feedback
                                    </label>
                                    <Textarea
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      placeholder="Provide constructive feedback..."
                                      className="border-slate-200 dark:border-border"
                                    />
                                  </div>

                                  <Button className="w-full gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                                    <Save className="h-4 w-4" /> Save Grades
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Graded Submissions */}
          <TabsContent value="graded">
            <div className="space-y-4">
              {GRADED_SUBMISSIONS.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">
                              {submission.studentName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {submission.assignmentTitle}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                            Graded
                          </span>
                        </div>

                        <div className="space-y-2 border-t border-border pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Marks
                            </span>
                            <span className="font-semibold text-emerald-400">
                              {submission.marks}/{submission.totalMarks}
                            </span>
                          </div>
                          <div className="rounded-lg bg-black/20 p-3">
                            <p className="text-xs font-medium text-muted-foreground">
                              Feedback
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {submission.feedback}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Graded: {submission.gradedDate}
                          </p>
                        </div>

                        <Button variant="outline" className="w-full">
                          View Submission
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
