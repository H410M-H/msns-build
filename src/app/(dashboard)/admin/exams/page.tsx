"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Filter,
  Loader2,
  Plus,
  Trash2,
  ArrowUpRight,
  CalendarDays,
  BookOpen,
  LayoutGrid,
  ListChecks,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

// --- Interfaces ---
interface Session {
  sessionId: string;
  sessionName: string;
}

interface Class {
  classId: string;
  grade: string;
  section: string;
}

interface Exam {
  examId: string;
  examTypeEnum: string;
  startDate: string | Date;
  endDate: string | Date;
  totalMarks: number;
  passingMarks: number;
  status: string;
  classId: string;
  Grades: {
    grade: string;
    section: string;
  };
}

interface DatesheetEntry {
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
}

const EXAM_TYPES = [
  { value: "MIDTERM", label: "Mid-Term" },
  { value: "FINAL", label: "Final" },
  { value: "PHASE_1", label: "Phase 1" },
  { value: "PHASE_2", label: "Phase 2" },
  { value: "PHASE_3", label: "Phase 3" },
  { value: "PHASE_4", label: "Phase 4" },
  { value: "PHASE_5", label: "Phase 5" },
  { value: "PHASE_6", label: "Phase 6" },
];

export default function ExamManagementPage() {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form states for new exam
  const [newExamData, setNewExamData] = useState({
    examType: "MIDTERM",
    totalMarks: 100,
    passingMarks: 40,
    startDate: "",
    endDate: "",
  });

  const [datesheet, setDatesheet] = useState<DatesheetEntry[]>([]);

  // API queries
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: examsForSession, refetch: refetchExams } =
    api.exam.getExamsForSession.useQuery(
      { sessionId: selectedSession },
      { enabled: !!selectedSession },
    );

  const { data: classes } = api.class.getClasses.useQuery();

  const { data: classSubjects, isLoading: subjectsLoading } =
    api.subject.getSubjectsByClass.useQuery(
      { classId: selectedClass, sessionId: selectedSession },
      { enabled: !!selectedClass && !!selectedSession },
    );

  React.useEffect(() => {
    if (classSubjects && classSubjects.length > 0) {
      setDatesheet(
        classSubjects.map((cs) => ({
          subjectId: cs.Subject.subjectId,
          subjectName: cs.Subject.subjectName,
          date: "",
          startTime: "09:00",
          endTime: "12:00",
        })),
      );
    } else {
      setDatesheet([]);
    }
  }, [classSubjects, selectedClass, selectedSession]);

  // API mutations
  const createExamMutation = api.exam.createExam.useMutation();
  const deleteExamMutation = api.exam.deleteExam.useMutation();
  const utils = api.useUtils();

  const handleCreateExam = async () => {
    if (!selectedSession || !selectedClass) {
      alert("Please select session and class");
      return;
    }
    if (!newExamData.startDate || !newExamData.endDate) {
      alert("Please select exam start and end dates");
      return;
    }

    try {
      await createExamMutation.mutateAsync({
        sessionId: selectedSession,
        classId: selectedClass,
        examTypeEnum: newExamData.examType as
          | "MIDTERM"
          | "FINAL"
          | "PHASE_1"
          | "PHASE_2"
          | "PHASE_3"
          | "PHASE_4"
          | "PHASE_5"
          | "PHASE_6",
        startDate: new Date(newExamData.startDate),
        endDate: new Date(newExamData.endDate),
        totalMarks: newExamData.totalMarks,
        passingMarks: newExamData.passingMarks,
        datesheet: datesheet
          .filter((ds) => ds.date !== "")
          .map((ds) => ({
            subjectId: ds.subjectId,
            date: new Date(ds.date),
            startTime: ds.startTime,
            endTime: ds.endTime,
          })),
      });

      await refetchExams();
      setShowCreateDialog(false);
      setNewExamData({
        examType: "MIDTERM",
        totalMarks: 100,
        passingMarks: 40,
        startDate: "",
        endDate: "",
      });

    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExamMutation.mutateAsync({ examId });
        await refetchExams();
      } catch (error) {
        console.error(error);
        alert("Failed to delete exam");
      }
    }
  };

  const handlePromotionCheck = async (classId: string, examId: string) => {
    try {
      const result = await utils.promotion.canPromoteClass.fetch({
        fromClassId: classId,
        fromSessionId: selectedSession,
        examIdForCheck: examId,
      });

      alert(
        `Total: ${result.totalStudents}, Passed: ${result.passedStudents}, Failed: ${result.failedStudents}`,
      );
    } catch (error) {
      console.error(error);
      alert("Failed to check promotion status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400";
      case "ONGOING":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400";
      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-muted-foreground";
    }
  };

  const selectedClassName = classes?.find((c: Class) => c.classId === selectedClass);
  const selectedSessionName = sessions?.find((s: Session) => s.sessionId === selectedSession);

  return (
    <div className="w-full space-y-5">
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/exams", label: "Exam Management" },
        ]}
      />

      {/* --- Header Section --- */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
              Exam{" "}
              <span className="text-emerald-600 dark:text-emerald-500">
                Management
              </span>
            </h1>
          </div>
          <p className="pl-1 text-sm text-muted-foreground">
            Create, manage and monitor all exams across sessions and classes.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
          asChild
        >
          <Link href="/admin/exams/promotion">
            <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
            Student Promotion
          </Link>
        </Button>
      </div>

      {/* --- Filter Section --- */}
      <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card dark:shadow-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-foreground">
                Filter &amp; Context
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Select session and class to view or create exams
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Session
              </Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="border-slate-200 bg-white text-sm transition-all focus:border-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map((session: Session) => (
                    <SelectItem key={session.sessionId} value={session.sessionId}>
                      {session.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Class
              </Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border-slate-200 bg-white text-sm transition-all focus:border-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls: Class) => (
                    <SelectItem key={cls.classId} value={cls.classId}>
                      {cls.grade} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
                    disabled={!selectedSession || !selectedClass}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white dark:border-border dark:bg-card sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-foreground">
                      <ClipboardList className="h-5 w-5 text-emerald-500" />
                      Create New Exam
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      {selectedClassName &&
                        `Class ${selectedClassName.grade} ${selectedClassName.section}`}{" "}
                      ·{" "}
                      {selectedSessionName?.sessionName}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 pt-2">
                    {/* Exam Basics */}
                    <div className="rounded-xl border border-slate-100 p-4 dark:border-border">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-foreground">
                        <ListChecks className="h-4 w-4 text-emerald-500" />
                        Exam Details
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Exam Type
                          </Label>
                          <Select
                            value={newExamData.examType}
                            onValueChange={(value: string) =>
                              setNewExamData({ ...newExamData, examType: value })
                            }
                          >
                            <SelectTrigger className="border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EXAM_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Total Marks
                            </Label>
                            <Input
                              type="number"
                              value={newExamData.totalMarks}
                              onChange={(e) =>
                                setNewExamData({
                                  ...newExamData,
                                  totalMarks: parseInt(e.target.value),
                                })
                              }
                              className="border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Passing Marks
                            </Label>
                            <Input
                              type="number"
                              value={newExamData.passingMarks}
                              onChange={(e) =>
                                setNewExamData({
                                  ...newExamData,
                                  passingMarks: parseInt(e.target.value),
                                })
                              }
                              className="border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Start Date
                            </Label>
                            <Input
                              type="date"
                              value={newExamData.startDate}
                              onChange={(e) =>
                                setNewExamData({
                                  ...newExamData,
                                  startDate: e.target.value,
                                })
                              }
                              className="border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              End Date
                            </Label>
                            <Input
                              type="date"
                              value={newExamData.endDate}
                              onChange={(e) =>
                                setNewExamData({
                                  ...newExamData,
                                  endDate: e.target.value,
                                })
                              }
                              className="border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Datesheet Section */}
                    <div className="rounded-xl border border-slate-100 p-4 dark:border-border">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-foreground">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                        Datesheet
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          Subjects assigned to this class
                        </span>
                      </h3>

                      {subjectsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading subjects…
                        </div>
                      ) : datesheet.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 dark:border-border bg-slate-50 dark:bg-black/10 p-6 text-center">
                          <BookOpen className="mx-auto mb-2 h-6 w-6 text-muted-foreground opacity-40" />
                          <p className="text-sm text-muted-foreground">
                            No subjects assigned to this class yet. Assign subjects first.
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                          {datesheet.map((ds, index) => (
                            <div
                              key={ds.subjectId}
                              className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-border dark:bg-white/5 sm:flex-row sm:items-center"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-foreground">
                                  {ds.subjectName}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-2 sm:w-auto">
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">
                                    Date
                                  </Label>
                                  <Input
                                    type="date"
                                    value={ds.date}
                                    onChange={(e) => {
                                      const newDs = [...datesheet];
                                      newDs[index]!.date = e.target.value;
                                      setDatesheet(newDs);
                                    }}
                                    className="h-7 border-slate-200 bg-white text-xs dark:border-border dark:bg-card dark:text-foreground"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">
                                    Start
                                  </Label>
                                  <Input
                                    type="time"
                                    value={ds.startTime}
                                    onChange={(e) => {
                                      const newDs = [...datesheet];
                                      newDs[index]!.startTime = e.target.value;
                                      setDatesheet(newDs);
                                    }}
                                    className="h-7 border-slate-200 bg-white text-xs dark:border-border dark:bg-card dark:text-foreground"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground">
                                    End
                                  </Label>
                                  <Input
                                    type="time"
                                    value={ds.endTime}
                                    onChange={(e) => {
                                      const newDs = [...datesheet];
                                      newDs[index]!.endTime = e.target.value;
                                      setDatesheet(newDs);
                                    }}
                                    className="h-7 border-slate-200 bg-white text-xs dark:border-border dark:bg-card dark:text-foreground"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleCreateExam}
                      disabled={createExamMutation.isPending || !newExamData.startDate || !newExamData.endDate}
                      className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
                    >
                      {createExamMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Exam
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Class + Subject overview when both are selected --- */}
      {selectedClass && selectedSession && classSubjects && classSubjects.length > 0 && (
        <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
              <BookOpen className="h-4 w-4 text-teal-500" />
              Subjects in{" "}
              {selectedClassName &&
                `${selectedClassName.grade} ${selectedClassName.section}`}
              <Badge variant="outline" className="ml-auto border-teal-500/20 bg-teal-500/10 text-teal-500 text-xs">
                {classSubjects.length} subject{classSubjects.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {classSubjects.map((cs) => (
                <Badge
                  key={cs.Subject.subjectId}
                  variant="outline"
                  className="border-slate-200 bg-slate-50 text-slate-700 dark:border-border dark:bg-white/5 dark:text-foreground"
                >
                  {cs.Subject.subjectName}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- Exams Table --- */}
      {examsForSession && examsForSession.length > 0 && (
        <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card dark:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-foreground">
                    Exam Registry
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    All exams for the selected session
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
                {examsForSession.length} exam{examsForSession.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Exam Type
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Class
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Start Date
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      End Date
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Marks
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examsForSession.map((exam: Exam) => (
                    <TableRow
                      key={exam.examId}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-border dark:hover:bg-white/5"
                    >
                      <TableCell className="font-semibold text-slate-900 dark:text-foreground">
                        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-xs">
                          {EXAM_TYPES.find(t => t.value === exam.examTypeEnum)?.label ?? exam.examTypeEnum}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-foreground">
                        {exam.Grades.grade} {exam.Grades.section}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-foreground">
                        {new Date(exam.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-foreground">
                        {new Date(exam.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-slate-700 dark:text-foreground">
                          {exam.passingMarks}
                          <span className="text-muted-foreground">/</span>
                          {exam.totalMarks ?? 100}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border font-semibold text-xs ${getStatusBadge(exam.status)}`}
                        >
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handlePromotionCheck(exam.classId, exam.examId)
                            }
                            className="h-7 border-slate-200 bg-white text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-border dark:bg-white/5 dark:text-foreground dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                          >
                            <CheckCircle2 className="mr-1.5 h-3 w-3" />
                            Check
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteExam(exam.examId)}
                            className="h-7 border-red-200 bg-white text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/20 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- Empty State --- */}
      {selectedSession && examsForSession?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center animate-in fade-in-50 dark:border-border dark:bg-card">
          <div className="mb-4 rounded-full border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-muted">
            <AlertCircle className="h-7 w-7 text-muted-foreground dark:text-slate-600" />
          </div>
          <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-foreground">
            No exams found
          </h3>
          <p className="mb-5 max-w-xs text-sm text-muted-foreground">
            No exams found for the selected session. Select a class and create one to get started.
          </p>
        </div>
      )}

      {!selectedSession && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center dark:border-border dark:bg-card/50">
          <div className="mb-4 rounded-full border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-muted">
            <LayoutGrid className="h-7 w-7 text-muted-foreground opacity-50" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a session above to view or create exams.
          </p>
        </div>
      )}
    </div>
  );
}
