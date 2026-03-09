"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  Users,
  Edit,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const TEACHER_ASSIGNMENTS = [
  {
    id: "ASG-001",
    title: "Chapter 5 - Linear Equations",
    description: "Solve 20 problems on linear equations and systems",
    classId: "CLS-001",
    className: "Class 5 - Section A",
    subject: "Mathematics",
    issuedDate: "2025-01-15",
    dueDate: "2025-01-22",
    totalMarks: 20,
    totalStudents: 32,
    submitted: 28,
    graded: 15,
    status: "active",
  },
  {
    id: "ASG-002",
    title: "Chapter 4 - Geometry Basics",
    description: "Complete exercises on geometric shapes and properties",
    classId: "CLS-002",
    className: "Class 4 - Section B",
    subject: "Mathematics",
    issuedDate: "2025-01-08",
    dueDate: "2025-01-20",
    totalMarks: 25,
    totalStudents: 28,
    submitted: 26,
    graded: 26,
    status: "closed",
  },
  {
    id: "ASG-003",
    title: "Quiz: Fractions and Decimals",
    description: "Online quiz on fractions and decimal operations",
    classId: "CLS-001",
    className: "Class 5 - Section A",
    subject: "Mathematics",
    issuedDate: "2025-01-20",
    dueDate: "2025-01-23",
    totalMarks: 10,
    totalStudents: 32,
    submitted: 12,
    graded: 0,
    status: "active",
  },
];

const CLASSES = [
  { id: "CLS-001", name: "Class 5 - Section A" },
  { id: "CLS-002", name: "Class 4 - Section B" },
];

export default function TeacherAssignmentsPage() {
  const [openDialog, setOpenDialog] = useState(false);

  const breadcrumbs = [
    { href: "/teacher", label: "Dashboard", current: false },
    { href: "/teacher/assignments", label: "Assignments", current: true },
  ];

  const activeAssignments = TEACHER_ASSIGNMENTS.filter(
    (a) => a.status === "active"
  ).length;
  const closedAssignments = TEACHER_ASSIGNMENTS.filter(
    (a) => a.status === "closed"
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
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {TEACHER_ASSIGNMENTS.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Assignments created
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activeAssignments}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ongoing assignments
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Await grading
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
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="all"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <FileText className="h-4 w-4" /> All Assignments
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Clock className="h-4 w-4" /> Active
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <CheckCircle className="h-4 w-4" /> Closed
            </TabsTrigger>
          </TabsList>

          {/* All Assignments */}
          <TabsContent value="all">
            <div className="mb-6 flex justify-end">
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                    <Plus className="h-4 w-4" /> Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-slate-200 dark:border-border">
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select defaultValue="CLS-001">
                        <SelectTrigger className="border-slate-200 dark:border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CLASSES.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Chapter 5 - Linear Equations"
                        className="border-slate-200 dark:border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Provide detailed instructions for the assignment..."
                        className="border-slate-200 dark:border-border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duedate">Due Date</Label>
                        <Input
                          id="duedate"
                          type="date"
                          className="border-slate-200 dark:border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="marks">Total Marks</Label>
                        <Input
                          id="marks"
                          type="number"
                          placeholder="20"
                          className="border-slate-200 dark:border-border"
                        />
                      </div>
                    </div>

                    <Button className="w-full bg-emerald-600 text-foreground hover:bg-emerald-700">
                      Create Assignment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {TEACHER_ASSIGNMENTS.map((assignment, index) => (
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
                              {assignment.className}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              assignment.status === "active"
                                ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {assignment.status === "active"
                              ? "Active"
                              : "Closed"}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {assignment.description}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 md:grid-cols-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Due Date
                            </p>
                            <p className="mt-1 font-medium text-foreground">
                              {assignment.dueDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total Marks
                            </p>
                            <p className="mt-1 font-medium text-foreground">
                              {assignment.totalMarks}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Submitted
                            </p>
                            <p className="mt-1 font-medium text-emerald-400">
                              {assignment.submitted}/
                              {assignment.totalStudents}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Graded
                            </p>
                            <p className="mt-1 font-medium text-blue-400">
                              {assignment.graded}/
                              {assignment.submitted}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="space-y-3 border-t border-border pt-4">
                          <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Submission Rate
                              </span>
                              <span className="text-emerald-400">
                                {Math.round((assignment.submitted / assignment.totalStudents) * 100)}%
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                style={{
                                  width: `${(assignment.submitted / assignment.totalStudents) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          {assignment.submitted > 0 && (
                            <div>
                              <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  Grading Progress
                                </span>
                                <span className="text-blue-400">
                                  {Math.round((assignment.graded / assignment.submitted) * 100)}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                  style={{
                                    width: `${(assignment.graded / assignment.submitted) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-border pt-4">
                          <Button variant="outline" className="flex-1 gap-2">
                            <Users className="h-4 w-4" /> View Submissions
                          </Button>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Active Only */}
          <TabsContent value="active">
            <div className="space-y-4">
              {TEACHER_ASSIGNMENTS.filter((a) => a.status === "active").map(
                (assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-foreground">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {assignment.className}
                            </p>
                            <p className="text-xs text-emerald-400">
                              {assignment.submitted}/{assignment.totalStudents}{" "}
                              submissions
                            </p>
                          </div>
                          <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                            <Users className="h-4 w-4" /> View All
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </TabsContent>

          {/* Closed Only */}
          <TabsContent value="closed">
            <div className="space-y-4">
              {TEACHER_ASSIGNMENTS.filter((a) => a.status === "closed").map(
                (assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-foreground">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {assignment.className}
                            </p>
                            <p className="text-xs text-emerald-400">
                              All {assignment.submitted} submissions graded
                            </p>
                          </div>
                          <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" /> View Results
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
