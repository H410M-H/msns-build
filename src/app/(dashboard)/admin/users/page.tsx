"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, Users, UserCheck, Shield, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import RegistrationCards from "~/components/cards/RegistrationCard";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { api } from "~/trpc/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function RegistrationPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "User Management", current: true },
  ];

  const { data: students, isLoading: studentsLoading } = api.student.getStudents.useQuery();
  const { data: faculty, isLoading: facultyLoading } = api.employee.getEmployees.useQuery();

  const exportData = useMemo(() => {
    if (!students || !faculty) return undefined;
    return {
      columns: [
        { key: "type", label: "Type", width: 15 },
        { key: "id", label: "ID", width: 20 },
        { key: "name", label: "Name", width: 30 },
        { key: "contact", label: "Contact", width: 20 },
      ],
      rows: [
        ...students.map(s => ({
          type: "Student",
          id: s.admissionNumber ?? s.registrationNumber,
          name: s.studentName,
          contact: s.studentMobile,
        })),
        ...faculty.map(f => ({
          type: "Faculty",
          id: f.employeeId,
          name: f.employeeName,
          contact: f.mobileNo,
        }))
      ],
      sheetName: "All Users",
      title: "Users Directory Export",
    };
  }, [students, faculty]);

  if (studentsLoading || facultyLoading) {
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
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            User Management Hub
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground dark:text-muted-foreground">
            Central portal for student and faculty registration, directories, and account management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PageExportButton exportData={exportData} csvFilename="users-directory" pdfReportType="students" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GradientStatCard
          title="Total Students"
          value={students?.length ?? 0}
          icon={Users}
          theme="blue"
        />
        <GradientStatCard
          title="Total Faculty"
          value={faculty?.length ?? 0}
          icon={Shield}
          theme="emerald"
        />
        <GradientStatCard
          title="Active Accounts"
          value={(students?.length ?? 0) + (faculty?.length ?? 0)}
          icon={UserCheck}
          theme="amber"
        />
        <GradientStatCard
          title="Pending Approvals"
          value={0}
          icon={FileSpreadsheet}
          theme="pink"
        />
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-1 border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-card">
          <TabsTrigger value="actions" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <Sparkles className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
            <Shield className="h-4 w-4" />
            Roles &amp; Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="m-0 duration-300 animate-in fade-in-50">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mx-auto mb-10 max-w-4xl space-y-4 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="mb-2 inline-flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-lg shadow-emerald-900/20"
              >
                <GraduationCap className="h-10 w-10 text-emerald-500 sm:h-12 sm:w-12" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-black tracking-tight text-foreground sm:text-4xl"
              >
                Online{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Registration
                </span>{" "}
                Portal
              </motion.h2>
            </div>

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full"
            >
              <RegistrationCards />
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="m-0 duration-300 animate-in fade-in-50">
          <Card className="border border-slate-200 bg-white shadow-sm dark:border-emerald-500/10 dark:bg-card">
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-border">
                <div className="text-center text-muted-foreground">
                  <Shield className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p>Advanced Role Management Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
