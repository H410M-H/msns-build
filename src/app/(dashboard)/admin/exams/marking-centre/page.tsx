"use client";

import React, { useState, useCallback } from "react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Progress } from "~/components/ui/progress";
import {
  ClipboardList, Save, Loader2, CheckCircle2, Clock,
  AlertCircle, Search, Filter, LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";

type CompletionStatus = "Pending" | "Partial" | "Complete";

const STATUS_STYLE: Record<CompletionStatus, string> = {
  Pending: "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400",
  Partial: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  Complete: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const STATUS_ICON: Record<CompletionStatus, React.ReactNode> = {
  Pending: <Clock className="h-3 w-3" />,
  Partial: <AlertCircle className="h-3 w-3" />,
  Complete: <CheckCircle2 className="h-3 w-3" />,
};

interface GridCell {
  subjectId: string;
  subjectName: string;
  classSubjectId: string;
  obtainedMarks: number | null;
}

export default function MarkingCentrePage() {
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompletionStatus | "">("");
  const [studentSearch, setStudentSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Local edits: studentId -> subjectId -> marks value
  const [localEdits, setLocalEdits] = useState<Record<string, Record<string, number>>>({});

  const { data: sessions } = api.session.getSessions.useQuery();
  const { data: classes } = api.class.getClasses.useQuery();
  const { data: examsForSession } = api.exam.getExamsForSession.useQuery(
    { sessionId: selectedSession },
    { enabled: !!selectedSession },
  );

  const { data: grid, refetch: refetchGrid } = api.markingCentre.getMarkingGrid.useQuery(
    {
      examId: selectedExam,
      classId: selectedClass,
      sessionId: selectedSession,
      statusFilter: statusFilter || undefined,
      studentSearch: studentSearch || undefined,
    },
    { enabled: !!selectedExam && !!selectedClass && !!selectedSession },
  );

  const saveAll = api.markingCentre.saveAll.useMutation({
    onSuccess: (d) => {
      toast.success(`Saved ${d.savedCount} mark entries`);
      setLocalEdits({});
      void refetchGrid();
    },
    onError: e => toast.error(e.message),
  });

  const saveRow = api.markingCentre.saveStudentRow.useMutation({
    onSuccess: () => { toast.success("Row saved"); void refetchGrid(); },
    onError: e => toast.error(e.message),
  });

  const handleCellChange = useCallback((studentId: string, subjectId: string, valueStr: string) => {
    setLocalEdits(prev => {
      const studentEdits = { ...(prev[studentId] ?? {}) };
      if (valueStr === "") {
        delete studentEdits[subjectId];
      } else {
        const parsed = parseFloat(valueStr);
        if (!isNaN(parsed)) {
          studentEdits[subjectId] = parsed;
        }
      }

      const newEdits = { ...prev };
      if (Object.keys(studentEdits).length === 0) {
        delete newEdits[studentId];
      } else {
        newEdits[studentId] = studentEdits;
      }
      return newEdits;
    });
  }, []);

  const handleSaveAll = async () => {
    if (!grid) return;
    setIsSaving(true);
    const cells = grid.rows.flatMap(row =>
      row.cells
        .filter(cell => {
          const hasLocalVal = localEdits[row.studentId]?.[cell.subjectId] !== undefined;
          const hasDbVal = cell.obtainedMarks !== null && cell.obtainedMarks !== undefined;
          return hasLocalVal || hasDbVal;
        })
        .map(cell => ({
          studentId: row.studentId,
          subjectId: cell.subjectId,
          classSubjectId: cell.classSubjectId,
          obtainedMarks: localEdits[row.studentId]?.[cell.subjectId] ?? cell.obtainedMarks ?? 0,
        }))
    );
    if (cells.length === 0) {
      toast.info("No changes to save");
      setIsSaving(false);
      return;
    }
    await saveAll.mutateAsync({ examId: selectedExam, cells });
    setIsSaving(false);
  };

  const handleSaveRow = async (studentId: string, cells: GridCell[]) => {
    const marks = cells
      .filter(cell => {
        const hasLocalVal = localEdits[studentId]?.[cell.subjectId] !== undefined;
        const hasDbVal = cell.obtainedMarks !== null && cell.obtainedMarks !== undefined;
        return hasLocalVal || hasDbVal;
      })
      .map(cell => ({
        studentId,
        subjectId: cell.subjectId,
        classSubjectId: cell.classSubjectId,
        obtainedMarks: localEdits[studentId]?.[cell.subjectId] ?? cell.obtainedMarks ?? 0,
      }));
    if (marks.length === 0) {
      toast.info("No changes to save for this student");
      return;
    }
    await saveRow.mutateAsync({ examId: selectedExam, studentId, marks });
  };

  const totalComplete = grid?.rows.filter(r => r.completionStatus === "Complete").length ?? 0;
  const totalRows = grid?.rows.length ?? 0;
  const overallPct = totalRows > 0 ? Math.round((totalComplete / totalRows) * 100) : 0;

  const hasLocalEdits = Object.keys(localEdits).length > 0;

  return (
    <div className="w-full space-y-5">
      <PageHeader breadcrumbs={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/exams", label: "Examinations" },
        { href: "/admin/exams/marking-centre", label: "Marking Centre" },
      ]} />

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5 text-emerald-600 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 dark:text-emerald-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              Examination <span className="text-emerald-600 dark:text-emerald-400">Marking Centre</span>
            </h1>
            <p className="text-sm text-muted-foreground">Unified grid for entering and reviewing examination marks</p>
          </div>
        </div>
        {hasLocalEdits && (
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Changes
          </Button>
        )}
      </div>

      {/* Context Selector */}
      <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-sm font-bold">Context &amp; Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session</Label>
              <Select value={selectedSession} onValueChange={v => { setSelectedSession(v); setSelectedExam(""); }}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Session" /></SelectTrigger>
                <SelectContent>{sessions?.map(s => <SelectItem key={s.sessionId} value={s.sessionId}>{s.sessionName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>{classes?.map((c: { classId: string; grade: string; section: string }) => <SelectItem key={c.classId} value={c.classId}>{c.grade} {c.section}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Examination</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam} disabled={!selectedSession}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Exam" /></SelectTrigger>
                <SelectContent>{examsForSession?.map((e: { examId: string; examTypeEnum: string }) => <SelectItem key={e.examId} value={e.examId}>{e.examTypeEnum}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Filter</Label>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as CompletionStatus | "")}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student name…"
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="h-8 max-w-xs text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Not configured yet */}
      {!selectedExam && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 dark:border-border dark:bg-card/50">
          <LayoutGrid className="mb-3 h-8 w-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Select a session, class, and examination to load the marking grid.</p>
        </div>
      )}

      {/* Grid loaded */}
      {grid && (
        <>
          {/* Progress Overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-slate-200 bg-white/60 shadow-sm dark:border-border dark:bg-card">
              <CardContent className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Students</p>
                <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-foreground">{grid.totalStudents}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50/60 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <CardContent className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Complete</p>
                <p className="mt-0.5 text-xl font-bold text-emerald-700 dark:text-emerald-400">{totalComplete}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/60 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/5">
              <CardContent className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Partial</p>
                <p className="mt-0.5 text-xl font-bold text-amber-700 dark:text-amber-400">{grid.rows.filter(r => r.completionStatus === "Partial").length}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white/60 shadow-sm dark:border-border dark:bg-card">
              <CardContent className="p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Progress</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={overallPct} className="h-2 flex-1" />
                  <span className="text-sm font-bold tabular-nums text-slate-800 dark:text-foreground">{overallPct}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column Stats */}
          <div className="flex flex-wrap gap-2">
            {grid.columnStats.map(cs => (
              <div key={cs.subjectId} className="rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-center shadow-sm dark:border-border dark:bg-card">
                <p className="text-xs font-semibold text-slate-800 dark:text-foreground">{cs.subjectName}</p>
                <p className="text-[10px] text-muted-foreground">{cs.markedStudents}/{cs.totalStudents} marked</p>
                <div className="mt-1">
                  <Progress value={cs.percentComplete} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-border dark:bg-black/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">
                  {grid.exam.examTypeEnum} · {grid.totalStudents} students × {grid.totalSubjects} subjects
                </CardTitle>
                <div className="flex items-center gap-2">
                  {hasLocalEdits && (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 text-xs animate-pulse">
                      Unsaved changes
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs">
                    Max: {grid.exam.totalMarks} · Pass: {grid.exam.passingMarks}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/80 dark:border-border dark:bg-black/10">
                      <TableHead className="sticky left-0 z-10 min-w-[180px] bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm dark:bg-black/50">Student</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      {grid.columnStats.map(cs => (
                        <TableHead key={cs.subjectId} className="min-w-[110px] text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <div className="text-center">
                            <p className="truncate max-w-[100px]">{cs.subjectName}</p>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grid.rows.map(row => (
                      <TableRow key={row.studentId} className="border-b border-slate-100 hover:bg-slate-50/30 dark:border-border dark:hover:bg-white/5">
                        <TableCell className="sticky left-0 z-10 bg-white/90 backdrop-blur-sm dark:bg-card/90">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-foreground">{row.studentName}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{row.admissionNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`flex w-fit items-center gap-1 text-xs ${STATUS_STYLE[row.completionStatus]}`}>
                            {STATUS_ICON[row.completionStatus]}
                            {row.completionStatus}
                          </Badge>
                        </TableCell>
                        {row.cells.map(cell => {
                          const localVal = localEdits[row.studentId]?.[cell.subjectId];
                          const displayVal = localVal ?? cell.obtainedMarks ?? "";
                          const isEdited = localVal !== undefined;
                          const isOver = (localVal ?? (cell.obtainedMarks ?? 0)) > grid.exam.totalMarks;

                          return (
                            <TableCell key={cell.subjectId} className="p-1">
                              <Input
                                type="number"
                                min={0}
                                max={grid.exam.totalMarks}
                                value={displayVal}
                                onChange={e => handleCellChange(row.studentId, cell.subjectId, e.target.value)}
                                className={`h-8 w-24 text-center font-mono text-sm transition-colors ${isEdited ? "border-amber-400 bg-amber-50/50 dark:border-amber-500/50 dark:bg-amber-500/10" : ""} ${isOver ? "border-red-500 bg-red-50 dark:border-red-500/50 dark:bg-red-500/10" : ""}`}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSaveRow(row.studentId, row.cells)}
                            disabled={saveRow.isPending}
                            className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                          >
                            <Save className="mr-1 h-3 w-3" /> Save Row
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {grid.rows.length === 0 && (
                      <TableRow><TableCell colSpan={grid.columnStats.length + 3} className="py-10 text-center text-sm text-muted-foreground">No students found for the selected filters.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bottom Save Bar */}
              {hasLocalEdits && (
                <div className="flex items-center justify-between border-t border-amber-200 bg-amber-50 px-5 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">You have unsaved changes</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setLocalEdits({})} className="text-xs">Discard</Button>
                    <Button size="sm" onClick={handleSaveAll} disabled={isSaving} className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs">
                      {isSaving ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Save className="mr-1.5 h-3 w-3" />}
                      Save All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
