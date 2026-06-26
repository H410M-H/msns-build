"use client";

import { useMemo } from "react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { StudentTable } from "~/components/tables/StudentTable";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { GradientStatCard } from "~/components/shared/GradientStatCard";
import { PageExportButton } from "~/components/shared/PageExportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, UserCheck, UserMinus, Percent, BarChart3, PieChartIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#059669", "#0284c7", "#7c3aed", "#ea580c", "#db2777", "#eab308"];

export default function StudentsTablePage() {
  const { data: students, isLoading } = api.student.getStudents.useQuery();

  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users/student", label: "Student Directory", current: true },
  ];

  // Stats computation
  const stats = useMemo(() => {
    if (!students) return { total: 0, assigned: 0, unassigned: 0, female: 0 };
    const total = students.length;
    const assigned = students.filter(s => s.isAssign).length;
    const unassigned = total - assigned;
    const female = students.filter(s => s.gender === "FEMALE").length;
    return { total, assigned, unassigned, female };
  }, [students]);

  // Chart Data: Gender distribution
  const genderData = useMemo(() => {
    if (!students) return [];
    const male = students.filter(s => s.gender === "MALE").length;
    const female = students.filter(s => s.gender === "FEMALE").length;
    return [
      { name: "Male", value: male },
      { name: "Female", value: female },
    ];
  }, [students]);

  // Chart Data: Registration trends by Month
  const registrationTrends = useMemo(() => {
    if (!students) return [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts: Record<string, number> = {};

    students.forEach(s => {
      const date = new Date(s.createdAt);
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      counts[label] = (counts[label] ?? 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .slice(-6); // Last 6 active registration months
  }, [students]);

  const exportData = useMemo(() => {
    if (!students) return undefined;
    return {
      columns: [
        { key: "registrationNumber", label: "Reg #" },
        { key: "admissionNumber", label: "Adm #" },
        { key: "studentName", label: "Student Name" },
        { key: "fatherName", label: "Father Name" },
        { key: "gender", label: "Gender" },
        { key: "dateOfBirth", label: "DoB" },
        { key: "fatherMobile", label: "Mobile" },
      ],
      rows: students.map(s => ({
        registrationNumber: s.registrationNumber,
        admissionNumber: s.admissionNumber,
        studentName: s.studentName,
        fatherName: s.fatherName,
        gender: s.gender,
        dateOfBirth: s.dateOfBirth,
        fatherMobile: s.fatherMobile,
      })),
      sheetName: "Students",
      title: "Registered Students Directory",
    };
  }, [students]);

  return (
    <section className="relative w-full space-y-5">
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="flex-1 p-4 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Registered Students
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Manage the complete directory of registered students. Use the controls below to filter, sort, or analyze data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PageExportButton exportData={exportData} csvFilename="student-directory" />
            </div>
          </div>

          <Separator className="bg-emerald-500/20" />

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GradientStatCard
              title="Total Registered"
              value={isLoading ? "..." : stats.total}
              icon={<Users className="h-5 w-5" />}
              theme="blue"
            />
            <GradientStatCard
              title="Assigned to Class"
              value={isLoading ? "..." : stats.assigned}
              icon={<UserCheck className="h-5 w-5" />}
              theme="emerald"
            />
            <GradientStatCard
              title="Unassigned Students"
              value={isLoading ? "..." : stats.unassigned}
              icon={<UserMinus className="h-5 w-5" />}
              theme="orange"
            />
            <GradientStatCard
              title="Female Students"
              value={isLoading ? "..." : stats.female}
              icon={<Percent className="h-5 w-5" />}
              theme="pink"
              subtitle={`${stats.total ? Math.round((stats.female / stats.total) * 100) : 0}% of student body`}
            />
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="directory" className="space-y-6">
            <TabsList className="h-auto flex-wrap justify-start gap-1 border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-card">
              <TabsTrigger value="directory" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
                <Users className="h-4 w-4" />
                Student Directory
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground">
                <BarChart3 className="h-4 w-4" />
                Demographic Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="directory" className="backdrop-blur-sm m-0 duration-300 animate-in fade-in-50">
              <StudentTable />
            </TabsContent>

            <TabsContent value="analytics" className="m-0 duration-300 animate-in fade-in-50 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-slate-200 bg-white shadow-sm dark:border-emerald-500/10 dark:bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4 text-emerald-600" /> Gender Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex justify-center items-center">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground">Loading chart data...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={genderData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {genderData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value as number} students`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm dark:border-emerald-500/10 dark:bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-600" /> Recent Registration Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    {isLoading ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading chart data...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={registrationTrends}>
                          <XAxis dataKey="name" fontSize={11} stroke="currentColor" className="text-muted-foreground" />
                          <YAxis fontSize={11} stroke="currentColor" className="text-muted-foreground" />
                          <Tooltip formatter={(value) => [`${value as number} registrations`]} />
                          <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
