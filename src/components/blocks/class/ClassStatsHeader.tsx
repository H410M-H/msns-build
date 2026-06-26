"use client";

import React, { useMemo } from "react";
import { api } from "~/trpc/react";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Button } from "~/components/ui/button";
import { Users, BookOpen, DollarSign, Calendar, UploadCloud, Printer, FileText } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

interface ClassStatsHeaderProps {
  classId: string;
  sessionId: string;
}

export function ClassStatsHeader({ classId, sessionId }: ClassStatsHeaderProps) {
  const { data: students, isLoading: studentsLoading } = api.allotment.getStudentsByClassAndSession.useQuery({ classId, sessionId });
  const { data: subjects, isLoading: subjectsLoading } = api.subject.getSubjectsByClass.useQuery({ classId, sessionId });
  const { data: classDetails, isLoading: classLoading } = api.class.getClassById.useQuery({ classId });

  const exportData = useMemo(() => {
    if (!students || !classDetails) return undefined;
    return {
      columns: [
        { key: "studentName", label: "Student Name", width: 25 },
        { key: "fatherName", label: "Father Name", width: 25 },
        { key: "grade", label: "Grade", width: 10 },
      ],
      rows: students.data?.map((s: any) => ({
        studentName: s.Students.studentName,
        fatherName: s.Students.fatherName,
        grade: classDetails.grade,
      })) ?? [],
      sheetName: `Class ${classDetails.grade} Roster`,
      title: `Class ${classDetails.grade} - Enrolled Students`,
    };
  }, [students, classDetails]);

  if (studentsLoading || subjectsLoading || classLoading) {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
              Class Details
            </h1>
            {classDetails && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-200">
                  Grade {classDetails.grade}
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground dark:text-muted-foreground">
            Manage roster, subjects, timetable, and attendance for this class.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename={`class-${classDetails?.grade}-roster`} pdfReportType="class-roster" />
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="h-4 w-4" />
            Print Timetable
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Enrolled Students"
          value={students?.data?.length ?? 0}
          icon={Users}
          theme="emerald"
        />
        <GradientStatCard
          title="Assigned Subjects"
          value={subjects?.length ?? 0}
          icon={BookOpen}
          theme="blue"
        />
        <GradientStatCard
          title="Monthly Fee"
          value={classDetails?.fee ?? 0}
          icon={DollarSign}
          theme="amber"
          formatAsCurrency={true}
        />
        <GradientStatCard
          title="Class Sections"
          value={1}
          icon={Calendar}
          theme="pink"
        />
      </div>
    </div>
  );
}
