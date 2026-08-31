"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  CalendarDays,
  Printer,
  BookOpen,
  Clock,
  GraduationCap,
} from "lucide-react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

interface DatesheetsViewerTabProps {
  sessionId?: string;
  selectedClassId?: string | null;
  onSelectClass?: (classId: string | null) => void;
}

export function DatesheetsViewerTab({
  sessionId,
  selectedClassId,
  onSelectClass,
}: DatesheetsViewerTabProps) {
  const { data: activeSession } = api.session.getActiveSession.useQuery(
    undefined,
    { enabled: !sessionId },
  );

  const effectiveSessionId = sessionId ?? activeSession?.sessionId;

  const { data: classes } = api.class.getAllClasses.useQuery(undefined, {
    enabled: true,
  });

  const { data: datesheets, isLoading } = api.exam.getAllDatesheets.useQuery(
    {
      sessionId: effectiveSessionId ?? "",
      classId: selectedClassId ?? undefined,
    },
    { enabled: !!effectiveSessionId },
  );

  const [activeFilterClass, setActiveFilterClass] = useState<string | "all">(
    selectedClassId ?? "all",
  );

  const filteredDatesheets = (datesheets ?? []).filter((exam) => {
    if (activeFilterClass === "all") return true;
    return exam.classId === activeFilterClass;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Examination Datesheets
          </h2>
          <p className="text-xs text-muted-foreground">
            View, filter, and print subject-wise exam schedules for all classes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            disabled={filteredDatesheets.length === 0}
            className="gap-2 rounded-xl text-xs font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-muted"
          >
            <Printer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Print Datesheets
          </Button>
        </div>
      </div>

      {/* Class Pills Filter */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/70 p-2 shadow-sm backdrop-blur print:hidden dark:border-border dark:bg-card">
        <Button
          size="sm"
          variant={activeFilterClass === "all" ? "default" : "ghost"}
          onClick={() => {
            setActiveFilterClass("all");
            onSelectClass?.(null);
          }}
          className={cn(
            "h-8 rounded-xl text-xs font-semibold transition-all",
            activeFilterClass === "all"
              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted",
          )}
        >
          All Classes ({classes?.length ?? 0})
        </Button>

        {classes?.map((cls) => {
          const isSelected = activeFilterClass === cls.classId;
          return (
            <Button
              key={cls.classId}
              size="sm"
              variant={isSelected ? "default" : "ghost"}
              onClick={() => {
                setActiveFilterClass(cls.classId);
                onSelectClass?.(cls.classId);
              }}
              className={cn(
                "h-8 rounded-xl text-xs font-semibold transition-all",
                isSelected
                  ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600 dark:text-white"
                  : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted",
              )}
            >
              {cls.grade} - {cls.section}
            </Button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="rounded-2xl border border-slate-200 dark:border-border">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDatesheets.length === 0 && (
        <Card className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center dark:border-border dark:bg-card/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20">
            <CalendarDays className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
            No Datesheets Found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            No scheduled exams with datesheet papers were found for the selected session and class filter.
          </p>
        </Card>
      )}

      {/* Datesheet Cards Grid */}
      {!isLoading && filteredDatesheets.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredDatesheets.map((exam) => {
            const hasPapers = exam.ExamDatesheet && exam.ExamDatesheet.length > 0;

            return (
              <Card
                key={exam.examId}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md dark:border-border dark:bg-card print:border-none print:shadow-none"
              >
                {/* Header */}
                <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-4 dark:border-border/60 dark:bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
                          {exam.Grades.grade} - {exam.Grades.section}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                        {exam.ExamType?.name ?? "Examination"} • Total Marks: {exam.totalMarks}
                      </CardDescription>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-lg text-[10px] font-semibold px-2 py-0.5",
                        exam.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-700 dark:bg-muted"
                          : exam.status === "ONGOING"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40",
                      )}
                    >
                      {exam.status}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Body Table of Papers */}
                <CardContent className="p-0">
                  {hasPapers ? (
                    <div className="divide-y divide-slate-100 dark:divide-border/40">
                      {exam.ExamDatesheet.map((paper, idx) => (
                        <div
                          key={paper.id}
                          className="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-muted/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-foreground">
                                {paper.Subject?.subjectName}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-muted-foreground">
                                  <CalendarDays className="h-3 w-3 text-emerald-600 opacity-70" />
                                  {format(new Date(paper.date), "EEEE, dd MMM yyyy")}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {paper.startTime && paper.endTime ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 rounded-lg text-[10px] font-normal"
                              >
                                <Clock className="h-2.5 w-2.5 opacity-60" />
                                {paper.startTime} - {paper.endTime}
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                Full Period
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      <BookOpen className="mx-auto mb-1.5 h-6 w-6 opacity-30" />
                      No individual subject papers scheduled yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
