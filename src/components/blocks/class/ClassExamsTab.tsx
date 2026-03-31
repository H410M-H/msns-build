"use client";

import { FileText, CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Loader2 } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-6 duration-500 animate-in fade-in md:mt-4 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Card
          key={exam.examId}
          className="overflow-hidden rounded-2xl border-l-4 border-border border-l-amber-500 bg-card shadow-xl transition-all hover:bg-card"
        >
          <CardHeader className="bg-card p-5 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="mb-2 border-amber-500/20 bg-amber-500/10 text-amber-400"
                >
                  {exam.examTypeEnum.replace("_", " ")}
                </Badge>
                <CardTitle className="text-lg text-foreground">
                  {exam.ExamType.name}
                </CardTitle>
              </div>
              <Badge
                variant={
                  exam.status === "COMPLETED"
                    ? "default"
                    : exam.status === "ONGOING"
                      ? "secondary"
                      : "outline"
                }
                className={
                  exam.status === "COMPLETED"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : exam.status === "ONGOING"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-slate-500/20 text-muted-foreground"
                }
              >
                {exam.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
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
                <span className="text-xs text-muted-foreground">
                  Total Marks
                </span>
                <p className="font-medium text-foreground">{exam.totalMarks}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">
                  Passing Marks
                </span>
                <p className="font-medium text-foreground">
                  {exam.passingMarks}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> Evaluated
                </span>
                <p className="font-medium text-emerald-400">
                  {exam.uniqueStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
