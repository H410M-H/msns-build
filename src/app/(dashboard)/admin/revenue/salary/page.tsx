// File: src/app/(dashboard)/admin/revenue/salary/page.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import {
  BarChart3,
  Wallet,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/hooks/use-toast";

// Components
import { SalaryAssignmentForm } from "~/components/forms/employee/SalaryAllotment";
import { SalaryTable } from "~/components/tables/SalaryTable";
import { PayrollTable } from "~/components/tables/PayrollTable";
import { IncrementDialog } from "~/components/forms/employee/IncrementDialog";
import { SalaryAnalytics } from "~/components/blocks/salary/SalaryAnalytics";

const MONTHS = [
  { value: "1", label: "January" }, { value: "2", label: "February" },
  { value: "3", label: "March" }, { value: "4", label: "April" },
  { value: "5", label: "May" }, { value: "6", label: "June" },
  { value: "7", label: "July" }, { value: "8", label: "August" },
  { value: "9", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" }
];

export default function SalaryPage() {
  const { toast } = useToast();
  const utils = api.useUtils();

  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [isGenerating, setIsGenerating] = useState(false);

  // Queries for Stats with Loading States
  const { data: payrollCost, isLoading: loadingCost } = api.salary.getTotalPayrollCost.useQuery({
    month: Number(selectedMonth),
    year: Number(selectedYear),
  });

  const { data: pendingSalaries, isLoading: loadingPending } = api.salary.getPendingSalaries.useQuery({
    month: Number(selectedMonth),
    year: Number(selectedYear),
    sessionId: "default-session-id", // Replace with dynamic session context
  });

  const { data: unpaidEmployees, isLoading: loadingUnpaid } = api.salary.getUnpaidEmployees.useQuery({
    month: Number(selectedMonth),
    year: Number(selectedYear),
    sessionId: "default-session-id",
  });

  // Mutations
  const generateMutation = api.salary.generateMonthlySalaries.useMutation({
    onSuccess: async (data) => {
      toast({
        title: "Payroll Generated",
        description: `Successfully generated ${data.generatedCount} salary records for ${MONTHS[Number(selectedMonth) - 1]?.label}.`,
      });
      await Promise.all([
        utils.salary.getAll.invalidate(),
        utils.salary.getPendingSalaries.invalidate(),
        utils.salary.getUnpaidEmployees.invalidate(),
        utils.salary.getTotalPayrollCost.invalidate(),
      ]);
      setIsGenerating(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setIsGenerating(false);
    },
  });

  const handleGeneratePayroll = () => {
    setIsGenerating(true);
    generateMutation.mutate({
      month: Number(selectedMonth),
      year: Number(selectedYear),
      sessionId: "default-session-id",
    });
  };

  // Define stats array dynamically
  const stats = [
    {
      title: "Total Payroll",
      value: loadingCost ? null : `Rs. ${(payrollCost?.totalPayroll ?? 0).toLocaleString()}`,
      desc: `Paid in ${MONTHS[Number(selectedMonth) - 1]?.label}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    },
    {
      title: "Pending Payouts",
      value: loadingPending ? null : pendingSalaries?.length ?? 0,
      desc: "Waiting for payment",
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30",
    },
    {
      title: "Unpaid Staff",
      value: loadingUnpaid ? null : unpaidEmployees?.length ?? 0,
      desc: "Not generated yet",
      icon: Users,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30",
    },
    {
      title: "System Status",
      value: "Active",
      desc: "Payroll Operational",
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30",
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* === Header & Controls === */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-emerald-500/10 backdrop-blur-sm shadow-sm dark:shadow-xl transition-colors">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Compensation Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl">
              Manage employee salaries, process monthly payrolls, and track compensation analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded-xl border border-slate-200 dark:border-emerald-500/20 shadow-inner">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-white">
                <Calendar className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-white">
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-white">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-emerald-500/20 dark:text-white">
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleGeneratePayroll}
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/20 transition-all border-0 dark:hover:bg-emerald-500"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* === Stats Cards === */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card
              key={i}
              className={`backdrop-blur-md shadow-sm dark:shadow-lg transition-all border ${stat.bg}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value ?? (
                    <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* === Main Content Tabs === */}
        <Tabs defaultValue="payroll" className="space-y-6">
          <TabsList className="bg-slate-100 p-1 border border-slate-200 rounded-xl w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-2 dark:bg-slate-900/60 dark:border-emerald-500/20">
            <TabsTrigger
              value="payroll"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-500 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white dark:text-slate-400 transition-all"
            >
              <Wallet className="h-4 w-4" /> Payroll
            </TabsTrigger>
            <TabsTrigger
              value="structures"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-500 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white dark:text-slate-400 transition-all"
            >
              <Users className="h-4 w-4" /> Salary Structures
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-slate-500 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white dark:text-slate-400 transition-all"
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Monthly Payroll Processing */}
          <TabsContent value="payroll" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border border-slate-200 bg-white dark:border-emerald-500/20 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm dark:shadow-2xl overflow-hidden rounded-2xl transition-colors">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-emerald-500/10 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">
                    Payroll Processing
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Generate and manage monthly salary disbursements
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <PayrollTable
                  month={Number(selectedMonth)}
                  year={Number(selectedYear)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Salary Structures */}
          <TabsContent value="structures" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border border-slate-200 bg-white dark:border-emerald-500/20 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm dark:shadow-2xl overflow-hidden rounded-2xl transition-colors">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-emerald-500/10 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">
                    Employee Salary Structures
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Manage base salaries and increments
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <IncrementDialog />
                  <SalaryAssignmentForm />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <SalaryTable
                  page={1}
                  pageSize={10}
                  setPage={() => ""}
                  setPageSize={() => ""}
                  searchTerm=""
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Analytics */}
          <TabsContent value="analytics" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border border-slate-200 bg-white dark:border-emerald-500/20 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm dark:shadow-2xl overflow-hidden rounded-2xl transition-colors">
              <CardHeader className="border-b border-slate-100 dark:border-emerald-500/10 bg-slate-50/50 dark:bg-slate-900/50 p-6">
                <CardTitle className="text-xl text-slate-900 dark:text-white">
                  Financial Analytics
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Yearly breakdown of salary distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <SalaryAnalytics year={Number(selectedYear)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}