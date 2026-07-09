"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { EmployeeTable } from "~/components/tables/EmployeeTable";
import { SalaryContent } from "../../../erp/revenue/salary/SalaryContent";
import { EmployeeAttendanceContent } from "../../../sessions/attendance/employees/EmployeeAttendanceContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, UserCog, DollarSign, CheckCircle2Icon, ShieldCheck, Calendar, BookOpen } from "lucide-react";
import { api } from "~/trpc/react";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Separator } from "~/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function EmployeesDashboard() {
  const { data: employees, isLoading } = api.employee.getEmployees.useQuery();
  const { data: activeSession } = api.session.getActiveSession.useQuery();
  const { data: sessions } = api.session.getSessions.useQuery();

  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedSession, setSelectedSession] = useState<string>("");

  useEffect(() => {
    if (activeSession && !selectedSession) {
      setSelectedSession(activeSession.sessionId);
    }
  }, [activeSession, selectedSession]);

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    {
      href: "/admin/users/faculty/view",
      label: "Faculty Management",
      current: true,
    },
  ];

  // Stats computation
  const stats = useMemo(() => {
    if (!employees) return { total: 0, active: 0, assigned: 0, biometric: 0 };
    const total = employees.length;
    const active = employees.filter(e => e.status === "Active").length;
    const assigned = employees.filter(e => e.isAssign).length;
    const biometric = employees.filter(e => e.BioMetric).length;
    return { total, active, assigned, biometric };
  }, [employees]);

  // Export Data definition
  const exportData = useMemo(() => {
    if (!employees) return undefined;
    return {
      columns: [
        { key: "registrationNumber", label: "Reg #" },
        { key: "employeeName", label: "Name" },
        { key: "fatherName", label: "Father Name" },
        { key: "cnic", label: "CNIC" },
        { key: "designation", label: "Designation" },
        { key: "mobileNo", label: "Mobile" },
        { key: "education", label: "Education" },
        { key: "status", label: "Status" },
      ],
      rows: employees.map(e => ({
        registrationNumber: e.registrationNumber,
        employeeName: e.employeeName,
        fatherName: e.fatherName,
        cnic: e.cnic,
        designation: e.designation,
        mobileNo: e.mobileNo,
        education: e.education,
        status: e.status,
      })),
      sheetName: "Faculty",
      title: "Faculty and Staff Directory",
    };
  }, [employees]);

  return (
    <section className="relative w-full">
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <div className="mb-2 inline-flex items-center justify-center rounded-2xl border border-emerald-500/20 bg-card p-3 shadow-lg backdrop-blur-sm">
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text font-serif text-3xl font-bold tracking-tight text-transparent drop-shadow-sm sm:text-4xl md:text-5xl">
                Employee Management
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Centralized hub for managing faculty credentials, processing salaries, and tracking daily attendance records.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner dark:border-emerald-500/20 dark:bg-card">
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="w-[160px] border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
                    <BookOpen className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <SelectValue placeholder="Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions?.map((s) => (
                      <SelectItem key={s.sessionId} value={s.sessionId}>
                        {s.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[130px] border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
                    <Calendar className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <PageExportButton exportData={exportData} csvFilename="faculty-directory" />
            </div>
          </div>

          <Separator className="bg-emerald-500/20" />

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GradientStatCard
              title="Total Employees"
              value={isLoading ? "..." : stats.total}
              icon={<Users className="h-5 w-5" />}
              theme="blue"
            />
            <GradientStatCard
              title="Active Staff"
              value={isLoading ? "..." : stats.active}
              icon={<UserCog className="h-5 w-5" />}
              theme="emerald"
            />
            <GradientStatCard
              title="Assigned Classes"
              value={isLoading ? "..." : stats.assigned}
              icon={<ShieldCheck className="h-5 w-5" />}
              theme="indigo"
            />
            <GradientStatCard
              title="Biometric Enrolled"
              value={isLoading ? "..." : stats.biometric}
              icon={<CheckCircle2Icon className="h-5 w-5" />}
              theme="purple"
            />
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="credentials" className="w-full space-y-8">
            {/* Tab Navigation - Responsive */}
            <div className="flex justify-center">
              <TabsList className="grid h-auto w-full max-w-3xl grid-cols-1 gap-2 rounded-xl border border-emerald-500/20 bg-card p-1.5 backdrop-blur-md sm:grid-cols-3">
                <TabsTrigger
                  value="credentials"
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-muted-foreground transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg"
                >
                  <UserCog className="h-4 w-4" />
                  <span>Credentials</span>
                </TabsTrigger>
                <TabsTrigger
                  value="salaries"
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-muted-foreground transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Salaries</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-muted-foreground transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg"
                >
                  <CheckCircle2Icon className="h-4 w-4" />
                  <span>Attendance</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Areas */}
            <div className="relative min-h-[500px]">
              <TabsContent
                value="credentials"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                <EmployeeTable />
              </TabsContent>

              <TabsContent
                value="salaries"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 shadow-xl backdrop-blur-md sm:p-6 overflow-hidden">
                  <SalaryContent 
                    externalMonth={selectedMonth} 
                    externalYear={selectedYear} 
                    externalSessionId={selectedSession} 
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="attendance"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 shadow-xl backdrop-blur-md sm:p-6 overflow-hidden">
                  <EmployeeAttendanceContent 
                    externalMonth={selectedMonth} 
                    externalYear={selectedYear} 
                    externalSessionId={selectedSession} 
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
