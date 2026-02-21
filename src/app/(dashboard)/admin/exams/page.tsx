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
  TableIcon,
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

  const [datesheet, setDatesheet] = useState<Array<{
    subjectId: string;
    subjectName: string;
    date: string;
    startTime: string;
    endTime: string;
  }>>([]);

  // API queries
  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: examsForSession, refetch: refetchExams } =
    api.exam.getExamsForSession.useQuery(
      { sessionId: selectedSession },
      { enabled: !!selectedSession }
    );

  const { data: classes } = api.class.getClasses.useQuery();

  const { data: classSubjects } = api.subject.getSubjectsByClass.useQuery(
    { classId: selectedClass, sessionId: selectedSession },
    { enabled: !!selectedClass && !!selectedSession }
  );

  React.useEffect(() => {
    if (classSubjects && showCreateDialog) {
      setDatesheet(
        classSubjects.map((cs) => ({
          subjectId: cs.Subject.subjectId,
          subjectName: cs.Subject.subjectName,
          date: "",
          startTime: "09:00",
          endTime: "12:00",
        }))
      );
    }
  }, [classSubjects, showCreateDialog]);

  // API mutations
  const createExamMutation = api.exam.createExam.useMutation();
  const deleteExamMutation = api.exam.deleteExam.useMutation();
  const utils = api.useUtils();

  const handleCreateExam = async () => {
    if (!selectedSession || !selectedClass) {
      alert("Please select session and class");
      return;
    }

    try {
      await createExamMutation.mutateAsync({
        sessionId: selectedSession,
        classId: selectedClass,
        examTypeEnum: newExamData.examType as "MIDTERM" | "FINAL" | "PHASE_1" | "PHASE_2" | "PHASE_3" | "PHASE_4" | "PHASE_5" | "PHASE_6",
        startDate: new Date(newExamData.startDate),
        endDate: new Date(newExamData.endDate),
        totalMarks: newExamData.totalMarks,
        passingMarks: newExamData.passingMarks,
        datesheet: datesheet
          .filter(ds => ds.date !== "")
          .map(ds => ({
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
        // Suppress generic error alert if not critical
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
        `Total: ${result.totalStudents}, Passed: ${result.passedStudents}, Failed: ${result.failedStudents}`
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
        return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400";
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        breadcrumbs={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/exams", label: "Exam Management" },
        ]}
      />

      {/* --- Header Section --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Exam <span className="text-emerald-600 dark:text-emerald-500">Management</span>
            </h1>
          </div>
          <p className="max-w-xl pl-1 text-sm text-slate-500 dark:text-slate-400">
            Create, manage and monitor all exams across sessions and classes.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
          asChild
        >
          <Link href="/admin/exams/promotion">
            <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
            Student Promotion
          </Link>
        </Button>
      </div>

      {/* --- Filter Section --- */}
      <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all dark:border-white/5 dark:bg-slate-900/40 dark:shadow-xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-black/20">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Filter Exams
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Select session and class to view or create exams
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Session
              </Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
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

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Class
              </Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="border-slate-200 bg-white transition-all focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
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
                  <Button className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Exam
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">Create New Exam</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                      Add a new exam for the selected class and session
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Exam Type
                      </Label>
                      <Select
                        value={newExamData.examType}
                        onValueChange={(value: string) =>
                          setNewExamData({ ...newExamData, examType: value })
                        }
                      >
                        <SelectTrigger className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MIDTERM">Mid-Term</SelectItem>
                          <SelectItem value="FINAL">Final</SelectItem>
                          <SelectItem value="PHASE_1">Phase 1</SelectItem>
                          <SelectItem value="PHASE_2">Phase 2</SelectItem>
                          <SelectItem value="PHASE_3">Phase 3</SelectItem>
                          <SelectItem value="PHASE_4">Phase 4</SelectItem>
                          <SelectItem value="PHASE_5">Phase 5</SelectItem>
                          <SelectItem value="PHASE_6">Phase 6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                          className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                          className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                          className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                          className="border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                        />
                      </div>
                    </div>

                    {datesheet.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <Label className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                          Datesheet Configuration
                        </Label>
                        <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
                          {datesheet.map((ds, index) => (
                            <div key={ds.subjectId} className="flex flex-col gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/5">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {ds.subjectName}
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-slate-500">Date</Label>
                                  <Input
                                    type="date"
                                    value={ds.date}
                                    onChange={(e) => {
                                      const newDs = [...datesheet];
                                      newDs[index]!.date = e.target.value;
                                      setDatesheet(newDs);
                                    }}
                                    className="h-8 text-xs border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-slate-500">Start Time</Label>
                                  <Input
                                    type="time"
                                    value={ds.startTime}
                                    onChange={(e) => {
                                      const newDs = [...datesheet];
                                      newDs[index]!.startTime = e.target.value;
                                      setDatesheet(newDs);
                                    }}
                                    className="h-8 text-xs border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[10px] text-slate-500">End Time</Label>
                                  <Input
                                    type="time"
                                    value={ds.endTime}
                                    onChange={(e) => {
                                      const newDs = [...datesheet];
                                      newDs[index]!.endTime = e.target.value;
                                      setDatesheet(newDs);
                                    }}
                                    className="h-8 text-xs border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleCreateExam}
                      disabled={createExamMutation.isPending}
                      className="w-full bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
                    >
                      {createExamMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
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

      {/* --- Exams Table --- */}
      {examsForSession && examsForSession.length > 0 && (
        <Card className="overflow-hidden border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all dark:border-white/5 dark:bg-slate-900/40 dark:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-white/5 dark:bg-black/20">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <TableIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Exam Registry
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  All exams for the selected session
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-white/5 dark:bg-black/10">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Exam Type
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Class
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Start Date
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      End Date
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Marks
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examsForSession.map((exam: Exam) => (
                    <TableRow
                      key={exam.examId}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                    >
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {exam.examTypeEnum}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {exam.Grades.grade} {exam.Grades.section}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {new Date(exam.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {new Date(exam.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-slate-700 dark:text-slate-200">
                          {exam.passingMarks}
                          <span className="text-slate-400 dark:text-slate-500">/</span>
                          {exam.totalMarks ?? 100}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border font-semibold ${getStatusBadge(exam.status)}`}
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
                            className="h-8 border-slate-200 bg-white text-xs text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Check
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteExam(exam.examId)}
                            className="h-8 border-red-200 bg-white text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/20 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center animate-in fade-in-50 dark:border-white/10 dark:bg-slate-900/20">
          <div className="mb-4 rounded-full border border-slate-200 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-slate-800/50">
            <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-600" />
          </div>
          <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
            No exams found
          </h3>
          <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            No exams found for the selected session. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
}
