"use client";

import { useState } from "react";
import {
  FileText,
  CalendarDays,
  Users,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";

const EXAM_TYPE_LABELS: Record<string, string> = {
  MIDTERM: "Mid-Term",
  FINAL: "Final",
  PHASE_1: "Phase 1",
  PHASE_2: "Phase 2",
  PHASE_3: "Phase 3",
  PHASE_4: "Phase 4",
  PHASE_5: "Phase 5",
  PHASE_6: "Phase 6",
};

function ExamSubjectsTable({
  examId,
  classId,
  sessionId,
}: {
  examId: string;
  classId: string;
  sessionId: string;
}) {
  const { data, isLoading, isError } = api.exam.getExamWithSubjects.useQuery({
    examId,
    classId,
    sessionId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        Loading subjects…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-red-400">
        <AlertCircle className="h-4 w-4" />
        Failed to load subject data.
      </div>
    );
  }

  if (data.subjectSummary.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-black/10 p-6 text-center text-sm text-muted-foreground">
        <BookOpen className="mx-auto mb-2 h-5 w-5 opacity-30" />
        No subjects assigned to this class yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-black/20 hover:bg-black/20">
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Subject
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Teacher
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Exam Date
            </TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Time
            </TableHead>
            <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Marks
            </TableHead>
            <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Avg. Obtained
            </TableHead>
            <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Students Evaluated
            </TableHead>
            <TableHead className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.subjectSummary.map((sub) => {
            const evaluated = sub.studentsEvaluated > 0;
            const passingMarks = data.exam.passingMarks;
            const avgPassed =
              sub.averageObtained !== null && sub.averageObtained >= passingMarks;

            return (
              <TableRow
                key={sub.csId}
                className="border-border transition-colors hover:bg-white/5"
              >
                {/* Subject */}
                <TableCell className="font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {sub.subjectName}
                  </div>
                </TableCell>

                {/* Teacher */}
                <TableCell>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {sub.teacherName}
                  </span>
                </TableCell>

                {/* Exam Date */}
                <TableCell>
                  {sub.examDate ? (
                    <span className="flex items-center gap-1 text-sm text-foreground">
                      <CalendarDays className="h-3 w-3 text-amber-500" />
                      {format(new Date(sub.examDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Time */}
                <TableCell>
                  {sub.startTime && sub.endTime ? (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {sub.startTime} – {sub.endTime}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Total Marks */}
                <TableCell className="text-center">
                  <span className="font-mono font-semibold text-foreground">
                    {sub.totalMarks}
                  </span>
                </TableCell>

                {/* Avg Obtained */}
                <TableCell className="text-center">
                  {evaluated ? (
                    <span
                      className={`font-mono font-bold ${
                        avgPassed ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {sub.averageObtained}
                      <span className="text-xs font-normal text-muted-foreground">
                        /{sub.totalMarks}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Students Evaluated */}
                <TableCell className="text-center">
                  <span className="flex items-center justify-center gap-1 text-sm">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className={evaluated ? "text-foreground" : "text-muted-foreground"}>
                      {sub.studentsEvaluated}
                    </span>
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  {evaluated ? (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Evaluated
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500/20 bg-amber-500/5 text-amber-400"
                    >
                      Pending
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ExamCard({
  exam,
  classId,
  sessionId,
}: {
  exam: {
    examId: string;
    examTypeEnum: string;
    status: string;
    startDate: Date | string;
    endDate: Date | string;
    totalMarks: number;
    passingMarks: number;
    uniqueStudents: number;
    ExamType: { name: string };
  };
  classId: string;
  sessionId: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusStyles = {
    COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    ONGOING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    SCHEDULED: "bg-slate-500/20 text-muted-foreground border-slate-500/20",
  }[exam.status] ?? "bg-slate-500/20 text-muted-foreground border-slate-500/20";

  const borderColor = {
    COMPLETED: "border-l-emerald-500",
    ONGOING: "border-l-blue-500",
    SCHEDULED: "border-l-amber-500",
  }[exam.status] ?? "border-l-amber-500";

  return (
    <Card
      className={`overflow-hidden rounded-2xl border-l-4 border-border ${borderColor} bg-card shadow-xl transition-all`}
    >
      <CardHeader className="bg-card p-5 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge
              variant="outline"
              className="mb-2 border-amber-500/20 bg-amber-500/10 text-amber-400"
            >
              {EXAM_TYPE_LABELS[exam.examTypeEnum] ?? exam.examTypeEnum.replace(/_/g, " ")}
            </Badge>
            <CardTitle className="text-lg text-foreground">{exam.ExamType.name}</CardTitle>
          </div>
          <Badge variant="outline" className={`border text-xs font-semibold ${statusStyles}`}>
            {exam.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5 pt-2">
        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Start Date
            </span>
            <p className="font-medium text-foreground">
              {format(new Date(exam.startDate), "MMM d, yyyy")}
            </p>
          </div>
          <div className="space-y-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> End Date
            </span>
            <p className="font-medium text-foreground">
              {format(new Date(exam.endDate), "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Total Marks</span>
            <p className="font-medium text-foreground">{exam.totalMarks}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Passing Marks</span>
            <p className="font-medium text-foreground">{exam.passingMarks}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" /> Evaluated
            </span>
            <p className="font-medium text-emerald-400">{exam.uniqueStudents}</p>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-border bg-white/5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {expanded ? "Hide" : "Show"} Subject Breakdown
          {expanded ? (
            <ChevronUp className="ml-auto h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="ml-auto h-3.5 w-3.5" />
          )}
        </Button>

        {/* Subject Table (expandable) */}
        {expanded && (
          <div className="animate-in fade-in slide-in-from-top-2 pt-1 duration-200">
            <ExamSubjectsTable
              examId={exam.examId}
              classId={classId}
              sessionId={sessionId}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ClassExamsTab({
  classId,
  sessionId,
}: {
  classId: string;
  sessionId: string;
}) {
  const { data: exams, isLoading } = api.exam.getExamsForClass.useQuery({
    classId,
    sessionId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        <FileText className="mx-auto mb-3 h-8 w-8 text-amber-500 opacity-20" />
        No exams scheduled for this class yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 duration-500 animate-in fade-in md:mt-4 md:grid-cols-2 xl:grid-cols-3">
      {exams.map((exam) => (
        <ExamCard
          key={exam.examId}
          exam={exam}
          classId={classId}
          sessionId={sessionId}
        />
      ))}
    </div>
  );
}
