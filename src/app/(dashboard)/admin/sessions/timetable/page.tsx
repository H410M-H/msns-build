"use client";

import { useState, Suspense, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ClasswiseView } from "~/components/attendance/timetable/classwise-view";
import { TeacherwiseView } from "~/components/attendance/timetable/teacherwise-view";
import type { Class, Teacher, TimetableViewMode } from "~/lib/timetable-types";
import { GridIcon, Users, Clock, Calendar, Printer, UploadCloud, LayoutGrid } from "lucide-react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Button } from "~/components/ui/button";

const DEFAULT_TIME_SLOTS = [
  { lectureNumber: 1, startTime: "08:00", endTime: "08:35" },
  { lectureNumber: 2, startTime: "08:40", endTime: "09:15" },
  { lectureNumber: 3, startTime: "09:20", endTime: "09:55" },
  { lectureNumber: 4, startTime: "10:00", endTime: "10:35" },
  { lectureNumber: 5, startTime: "10:40", endTime: "11:15" },
  { lectureNumber: 6, startTime: "11:20", endTime: "11:55" },
  { lectureNumber: 7, startTime: "12:00", endTime: "12:35" },
  { lectureNumber: 8, startTime: "13:00", endTime: "13:35" },
  { lectureNumber: 9, startTime: "13:40", endTime: "14:15" },
];

function TimetableContent() {
  const [viewMode, setViewMode] = useState<TimetableViewMode>("class");

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sessions/timetable", label: "Timetable Management", current: true },
  ];

  const { data: teachers, isLoading: teachersLoading } =
    api.employee.getAllEmployeesForTimeTable.useQuery();
  const { data: classes, isLoading: classesLoading } =
    api.class.getClasses.useQuery();

  const exportData = useMemo(() => {
    if (!teachers) return undefined;
    return {
      columns: [
        { key: "employeeName", label: "Teacher Name", width: 25 },
        { key: "designation", label: "Designation", width: 20 },
        { key: "education", label: "Education", width: 20 },
      ],
      rows: teachers.map((t) => ({
        employeeName: t.employeeName,
        designation: t.designation,
        education: t.education ?? "N/A",
      })),
      sheetName: "Teachers",
      title: "Teachers List for Timetable",
    };
  }, [teachers]);

  if (teachersLoading || classesLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-emerald-900/20" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
          ))}
        </div>
        <div className="h-96 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
      </div>
    );
  }

  const transformedClasses: Class[] = (classes ?? []).map(
    (cls) => ({
      classId: cls.classId,
      grade: cls.grade,
      section: cls.section,
    }),
  );

  const transformedTeachers: Teacher[] = (teachers ?? []).map(
    (teacher) => ({
      employeeId: teacher.employeeId,
      employeeName: teacher.employeeName,
      designation: teacher.designation,
      education: teacher.education ?? undefined,
    }),
  );

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* --- Header Section with Actions --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            Timetable Management
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground dark:text-muted-foreground">
            Manage class schedules, assign teachers, and view weekly timetables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename="teachers-list" />
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="h-4 w-4" />
            Print All
          </Button>
        </div>
      </div>

      {/* --- Key Metrics Grid --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Classes"
          value={transformedClasses.length}
          icon={LayoutGrid}
          theme="emerald"
        />
        <GradientStatCard
          title="Available Teachers"
          value={transformedTeachers.length}
          icon={Users}
          theme="blue"
        />
        <GradientStatCard
          title="Time Slots / Day"
          value={DEFAULT_TIME_SLOTS.length}
          icon={Clock}
          theme="amber"
        />
        <GradientStatCard
          title="Working Days"
          value={6}
          icon={Calendar}
          theme="pink"
        />
      </div>

      {/* View Mode Tabs */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-emerald-500/10 dark:bg-card dark:shadow-2xl">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-border dark:bg-white/5">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-foreground">
            <GridIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Timetable Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as TimetableViewMode)}
            className="w-full"
          >
            <div className="px-4 py-3 sm:px-6">
              <TabsList className="h-auto flex-wrap justify-start gap-1 border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-card">
                <TabsTrigger
                  value="class"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Class View
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
                >
                  <Users className="h-4 w-4" />
                  Teacher View
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Classwise View */}
            <TabsContent value="class" className="m-0 border-t border-slate-100 dark:border-border duration-300 animate-in fade-in-50">
              <div className="p-4 sm:p-6">
                <ClasswiseView
                  classes={transformedClasses}
                  teachers={transformedTeachers}
                  defaultTimeSlots={DEFAULT_TIME_SLOTS}
                />
              </div>
            </TabsContent>

            {/* Teacherwise View */}
            <TabsContent value="teacher" className="m-0 border-t border-slate-100 dark:border-border duration-300 animate-in fade-in-50">
              <div className="p-4 sm:p-6">
                <TeacherwiseView
                  teachers={transformedTeachers}
                  classes={transformedClasses}
                  defaultTimeSlots={DEFAULT_TIME_SLOTS}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TimetablePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-emerald-900/20" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
            ))}
          </div>
          <div className="h-96 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
        </div>
      }
    >
      <TimetableContent />
    </Suspense>
  );
}
