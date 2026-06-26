"use client";

import { useMemo } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { EmployeeTable } from "~/components/tables/EmployeeTable";
import SalaryPage from "../../../erp/revenue/salary/page";
import AttendancePage from "../../../attendance/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Users, UserCog, DollarSign, CheckCircle2Icon, ShieldCheck } from "lucide-react";
import { api } from "~/trpc/react";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Separator } from "~/components/ui/separator";

export default function EmployeesDashboard() {
  const { data: employees, isLoading } = api.employee.getEmployees.useQuery();

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
            <div className="flex items-center gap-2">
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
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 shadow-xl backdrop-blur-md sm:p-6">
                  <SalaryPage />
                </div>
              </TabsContent>

              <TabsContent
                value="attendance"
                className="mt-0 duration-500 animate-in fade-in slide-in-from-bottom-4 focus-visible:outline-none"
              >
                <div className="rounded-xl border border-emerald-500/20 bg-card p-4 shadow-xl backdrop-blur-md sm:p-6">
                  <AttendancePage />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
