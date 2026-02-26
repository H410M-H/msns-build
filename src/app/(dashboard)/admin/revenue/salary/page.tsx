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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { useToast } from "~/hooks/use-toast";

// Components
import { SalaryAssignmentForm } from "~/components/forms/employee/SalaryAllotment";
import { SalaryTable } from "~/components/tables/SalaryTable";
import { PayrollTable } from "~/components/tables/PayrollTable";
import { IncrementDialog } from "~/components/forms/employee/IncrementDialog";
import { SalaryAnalytics } from "~/components/blocks/salary/SalaryAnalytics";

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

export default function SalaryPage() {
  const { toast } = useToast();
  const utils = api.useUtils();

  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear()),
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Queries for Stats with Loading States
  const { data: payrollCost, isLoading: loadingCost } =
    api.salary.getTotalPayrollCost.useQuery({
      month: Number(selectedMonth),
      year: Number(selectedYear),
    });

  const { data: pendingSalaries, isLoading: loadingPending } =
    api.salary.getPendingSalaries.useQuery({
      month: Number(selectedMonth),
      year: Number(selectedYear),
      sessionId: "default-session-id", // Replace with dynamic session context
    });

  const { data: unpaidEmployees, isLoading: loadingUnpaid } =
    api.salary.getUnpaidEmployees.useQuery({
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
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
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
      value: loadingCost
        ? null
        : `Rs. ${(payrollCost?.totalPayroll ?? 0).toLocaleString()}`,
      desc: `Paid in ${MONTHS[Number(selectedMonth) - 1]?.label}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30",
    },
    {
      title: "Pending Payouts",
      value: loadingPending ? null : (pendingSalaries?.length ?? 0),
      desc: "Waiting for payment",
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30",
    },
    {
      title: "Unpaid Staff",
      value: loadingUnpaid ? null : (unpaidEmployees?.length ?? 0),
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
    <div className="w-full space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* === Header & Controls === */}
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm transition-colors dark:border-emerald-500/10 dark:bg-card dark:shadow-xl lg:flex-row lg:items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Compensation Management
          </h1>
          <p className="max-w-xl text-muted-foreground dark:text-muted-foreground">
            Manage employee salaries, process monthly payrolls, and track
            compensation analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner dark:border-emerald-500/20 dark:bg-card">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
              <Calendar className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
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
            <SelectContent className="border-slate-200 bg-white text-slate-700 dark:border-emerald-500/20 dark:bg-card dark:text-foreground">
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
            className="border-0 bg-emerald-600 text-foreground shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 dark:shadow-emerald-900/20 dark:hover:bg-emerald-500"
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
            className={`border shadow-sm backdrop-blur-md transition-all dark:shadow-lg ${stat.bg}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {stat.value ?? (
                  <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-muted" />
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* === Main Content Tabs === */}
      <Tabs defaultValue="payroll" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-emerald-500/20 dark:bg-card sm:inline-flex sm:w-auto">
          <TabsTrigger
            value="payroll"
            className="gap-2 text-muted-foreground transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <Wallet className="h-4 w-4" /> Payroll
          </TabsTrigger>
          <TabsTrigger
            value="structures"
            className="gap-2 text-muted-foreground transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <Users className="h-4 w-4" /> Salary Structures
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="gap-2 text-muted-foreground transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <BarChart3 className="h-4 w-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly Payroll Processing */}
        <TabsContent
          value="payroll"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-2xl">
            <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6 dark:border-emerald-500/10 dark:bg-card sm:flex-row sm:items-center">
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-foreground">
                  Payroll Processing
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground">
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
        <TabsContent
          value="structures"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-2xl">
            <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6 dark:border-emerald-500/10 dark:bg-card sm:flex-row sm:items-center">
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-foreground">
                  Employee Salary Structures
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground">
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
        <TabsContent
          value="analytics"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-xl transition-colors dark:border-emerald-500/20 dark:bg-card dark:shadow-2xl">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 dark:border-emerald-500/10 dark:bg-card">
              <CardTitle className="text-xl text-slate-900 dark:text-foreground">
                Financial Analytics
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-muted-foreground">
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
