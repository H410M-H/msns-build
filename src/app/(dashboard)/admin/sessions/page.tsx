"use client";

import React, { useMemo, lazy, Suspense } from "react";
import { api } from "~/trpc/react";

// --- UI Components ---
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// --- Icons ---
import {
  Users,
  GraduationCap,
  School,
  DollarSign,
  Table as TableIcon,
  Calendar as CalendarIcon,
  BarChart3,
  List,
  Plus,
  UploadCloud,
  FileText
} from "lucide-react";

const LazySessionList = lazy(() =>
  import("~/components/tables/SessionList").then((module) => ({
    default: module.SessionList as React.ComponentType,
  })),
);

const LazyEventsCalendar = lazy(() =>
  import("~/components/blocks/academic-calender/events-calender"),
);

// --- Loading Skeletons ---
const DashboardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-emerald-900/20" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-32 rounded-xl bg-slate-200 dark:bg-emerald-900/20"
        />
      ))}
    </div>
    <Skeleton className="h-96 w-full rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
  </div>
);

const TableSkeleton = () => (
  <div className="w-full space-y-2 p-4">
    <div className="mb-4 flex justify-between">
      <Skeleton className="h-8 w-48 bg-slate-100 dark:bg-white/5" />
      <Skeleton className="h-8 w-24 bg-slate-100 dark:bg-white/5" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-12 w-full rounded-lg bg-slate-100 dark:bg-white/5"
      />
    ))}
  </div>
);

// --- Main Page ---
export default function SessionFeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/sessions", label: "Sessions Overview", current: true },
  ];

  const queryOptions = { staleTime: 5 * 60 * 1000 };
  const { data: sessionData } = api.session.getActiveSession.useQuery(undefined, queryOptions);
  const { data: allSessions } = api.session.getSessions.useQuery(undefined, queryOptions);
  const { data: classData } = api.class.getClasses.useQuery(undefined, queryOptions);
  const { data: employeeData } = api.employee.getEmployees.useQuery(undefined, queryOptions);
  const { data: feeData } = api.fee.getAllFees.useQuery(undefined, queryOptions);
  const { data: studentData, isLoading: isInitialLoading, error } = api.student.getStudents.useQuery(undefined, queryOptions);

  const totalRevenue = useMemo(() => feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0, [feeData]);

  const exportData = useMemo(() => {
    if (!allSessions) return undefined;
    return {
      columns: [
        { key: "sessionName", label: "Session Name", width: 20 },
        { key: "year", label: "Year", width: 15 },
        { key: "startDate", label: "Start Date", width: 15, format: "date" as const },
        { key: "endDate", label: "End Date", width: 15, format: "date" as const },
        { key: "status", label: "Status", width: 15 },
      ],
      rows: allSessions.map((s) => ({
        sessionName: s.sessionName,
        year: s.sessionFrom ? new Date(s.sessionFrom).getFullYear() : null,
        startDate: s.sessionFrom ? new Date(s.sessionFrom) : null,
        endDate: s.sessionTo ? new Date(s.sessionTo) : null,
        status: s.isActive ? "Active" : "Inactive",
      })),
      sheetName: "Sessions",
      title: "Sessions Registry Export",
    };
  }, [allSessions]);

  const chartData = useMemo(() => {
    if (!allSessions) return [];
    return allSessions.map(s => {
      const start = new Date(s.sessionFrom).getTime();
      const end = new Date(s.sessionTo).getTime();
      const durationDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return {
        name: s.sessionName,
        duration: durationDays,
      };
    });
  }, [allSessions]);

  if (error) {
    return <div className="p-8 text-center text-red-500 dark:text-red-400">Error loading data.</div>;
  }
  if (isInitialLoading) return <DashboardSkeleton />;

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* --- Header Section with Actions --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
              Sessions Overview
            </h1>
            {sessionData && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-200">
                  {sessionData.sessionName}
                </span>
              </div>
            )}
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground dark:text-muted-foreground">
            Manage academic terms, view enrollment statistics, and compare sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Import
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        </div>
      </div>

      {/* --- 1. Key Metrics Grid --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Students"
          value={studentData?.length ?? 0}
          icon={Users}
          theme="emerald"
          trend={12}
        />
        <GradientStatCard
          title="Monthly Revenue Base"
          value={totalRevenue}
          icon={DollarSign}
          theme="amber"
          formatAsCurrency={true}
          trend={8}
        />
        <GradientStatCard
          title="Active Classes"
          value={classData?.length ?? 0}
          icon={School}
          theme="blue"
        />
        <GradientStatCard
          title="Total Faculty"
          value={employeeData?.length ?? 0}
          icon={GraduationCap}
          theme="pink"
        />
      </div>

      {/* --- Tabs --- */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-1 border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-card">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <List className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <CalendarIcon className="h-4 w-4" />
            Academic Calendar
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <BarChart3 className="h-4 w-4" />
            Session Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="duration-300 animate-in fade-in-50">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-emerald-500/10 dark:bg-card dark:shadow-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-border dark:bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <TableIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground">
                    Session Registry
                  </CardTitle>
                </div>
                <PageExportButton exportData={exportData} csvFilename="sessions-export" pdfReportType="sessions" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense fallback={<TableSkeleton />}>
                <div className="overflow-x-auto p-0">
                  <LazySessionList />
                </div>
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="duration-300 animate-in fade-in-50">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-emerald-500/10 dark:bg-card dark:shadow-2xl">
            <CardContent className="p-4 sm:p-6">
              <Suspense
                fallback={
                  <div className="flex h-96 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
                      <span className="text-sm text-muted-foreground">Loading calendar...</span>
                    </div>
                  </div>
                }
              >
                <LazyEventsCalendar sessionId={sessionData?.sessionId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="duration-300 animate-in fade-in-50">
          <Card className="border border-slate-200 bg-white shadow-sm dark:border-emerald-500/10 dark:bg-card">
            <CardHeader>
              <CardTitle>Session Duration Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="duration" name="Duration (Days)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
