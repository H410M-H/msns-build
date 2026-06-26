"use client";

import { useMemo, Suspense } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { CalendarGrid } from "~/components/attendance/attendance/attendance-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  CalendarIcon,
  Users,
  UserCheck,
  UserX,
  UserMinus,
  FileText,
  UploadCloud,
  Printer,
  CalendarDays,
  FileBarChart,
  CalendarRange
} from "lucide-react";
import dayjs from "dayjs";

function AttendanceDashboardContent() {
  const { data: employees, isLoading: employeesLoading } = api.employee.getEmployees.useQuery();
  const { data: attendances, isLoading: attendancesLoading } = api.attendance.getAllEmployeeAttendance.useQuery();

  const todayStr = dayjs().format("YYYY-MM-DD");

  const { presentCount, absentCount, leaveCount } = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;

    if (!attendances) return { presentCount: 0, absentCount: 0, leaveCount: 0 };

    // Get today's attendance records
    const todaysRecords = attendances.filter(a => a.date === todayStr);
    
    // We count based on morning/afternoon logic, simplified:
    todaysRecords.forEach(record => {
      if (record.morning === "P" || record.afternoon === "P") present++;
      else if (record.morning === "L" || record.afternoon === "L") leave++;
      else absent++;
    });

    return { presentCount: present, absentCount: absent, leaveCount: leave };
  }, [attendances, todayStr]);

  const exportData = useMemo(() => {
    if (!employees) return undefined;
    return {
      columns: [
        { key: "employeeName", label: "Employee Name", width: 25 },
        { key: "designation", label: "Designation", width: 20 },
        { key: "status", label: "Today's Status", width: 15 },
      ],
      rows: employees.map((emp) => {
        const record = attendances?.find(a => a.employeeId === emp.employeeId && a.date === todayStr);
        let status = "Not Marked";
        if (record) {
          if (record.morning === "P" || record.afternoon === "P") status = "Present";
          else if (record.morning === "L" || record.afternoon === "L") status = "Leave";
          else status = "Absent";
        }
        return {
          employeeName: emp.employeeName,
          designation: emp.designation,
          status,
        };
      }),
      sheetName: "Daily Attendance",
      title: `Daily Attendance Report - ${dayjs().format("MMMM D, YYYY")}`,
    };
  }, [employees, attendances, todayStr]);

  if (employeesLoading || attendancesLoading) {
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

  return (
    <>
      {/* --- Header Section with Actions --- */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            Attendance Management
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground dark:text-muted-foreground">
            Track and manage employee attendance records, leaves, and daily reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename={`attendance-${todayStr}`} pdfReportType="attendance" />
          <Button variant="outline" size="sm" className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Import Log
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="h-4 w-4" />
            Print Daily Sheet
          </Button>
        </div>
      </div>

      {/* --- Key Metrics Grid --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Staff"
          value={employees?.length ?? 0}
          icon={Users}
          theme="blue"
        />
        <GradientStatCard
          title="Present Today"
          value={presentCount}
          icon={UserCheck}
          theme="emerald"
        />
        <GradientStatCard
          title="Absent Today"
          value={absentCount}
          icon={UserX}
          theme="pink"
        />
        <GradientStatCard
          title="On Leave"
          value={leaveCount}
          icon={UserMinus}
          theme="amber"
        />
      </div>

      {/* --- Tabs Section --- */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-1 border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-card">
          <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <CalendarDays className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <FileBarChart className="h-4 w-4" />
            Daily Report
          </TabsTrigger>
          <TabsTrigger value="leave" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <CalendarRange className="h-4 w-4" />
            Leave Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="m-0 duration-300 animate-in fade-in-50">
          <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm backdrop-blur-xl dark:border-emerald-500/10 dark:bg-card dark:shadow-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-border dark:bg-white/5">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-foreground">
                <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Attendance Calendar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-[600px] w-full">
                <Suspense fallback={<div className="flex h-full items-center justify-center">Loading Calendar...</div>}>
                  <CalendarGrid />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="m-0 duration-300 animate-in fade-in-50">
          <Card className="border border-slate-200 bg-white shadow-sm dark:border-emerald-500/10 dark:bg-card">
            <CardHeader>
              <CardTitle>Daily Report View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-border">
                <div className="text-center text-muted-foreground">
                  <FileBarChart className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p>Detailed Daily Report coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="m-0 duration-300 animate-in fade-in-50">
          <Card className="border border-slate-200 bg-white shadow-sm dark:border-emerald-500/10 dark:bg-card">
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-border">
                <div className="text-center text-muted-foreground">
                  <CalendarRange className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p>Leave Requests Management coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function AttendancePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/attendance", label: "Attendance", current: true },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />
      <AttendanceDashboardContent />
    </div>
  );
}
