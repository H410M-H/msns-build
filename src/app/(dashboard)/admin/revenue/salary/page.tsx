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
      color: "text-emerald-400",
      bg: "bg-gradient-to-br from-emerald-600/20 to-teal-900/40 border-emerald-500/30",
    },
    {
      title: "Pending Payouts",
      value: loadingPending ? null : pendingSalaries?.length ?? 0,
      desc: "Waiting for payment",
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-slate-900/60 border-emerald-500/10",
    },
    {
      title: "Unpaid Staff",
      value: loadingUnpaid ? null : unpaidEmployees?.length ?? 0,
      desc: "Not generated yet",
      icon: Users,
      color: "text-rose-400",
      bg: "bg-slate-900/60 border-emerald-500/10",
    },
    {
      title: "System Status",
      value: "Active",
      desc: "Payroll Operational",
      icon: CheckCircle2,
      color: "text-blue-400",
      bg: "bg-slate-900/60 border-emerald-500/10",
    },
  ];

  return (
    <section className="relative w-full overflow-x-hidden selection:bg-emerald-500/30">
      <div className="relative z-10 flex flex-col space-y-8">
        
        {/* === Header & Controls === */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-slate-900/40 p-6 rounded-2xl border border-emerald-500/10 backdrop-blur-sm shadow-xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold tracking-tight text-white">
              Compensation Management
            </h1>
            <p className="text-slate-400 max-w-xl">
              Manage employee salaries, process monthly payrolls, and track compensation analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-950/50 p-1.5 rounded-xl border border-emerald-500/20 shadow-inner">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] bg-slate-900 border-emerald-500/20 text-white focus:ring-emerald-500/50">
                <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-emerald-500/20 text-white">
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px] bg-slate-900 border-emerald-500/20 text-white focus:ring-emerald-500/50">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-emerald-500/20 text-white">
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all border-0"
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
              className={`backdrop-blur-md shadow-lg transition-all border ${stat.bg}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stat.value ?? (
                    <Skeleton className="h-8 w-24 bg-slate-800" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* === Main Content Tabs === */}
        <Tabs defaultValue="payroll" className="space-y-6">
          <TabsList className="bg-slate-900/60 backdrop-blur-md border border-emerald-500/20 p-1 rounded-xl w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-2">
            <TabsTrigger
              value="payroll"
              className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400"
            >
              <Wallet className="h-4 w-4" /> Payroll
            </TabsTrigger>
            <TabsTrigger
              value="structures"
              className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400"
            >
              <Users className="h-4 w-4" /> Salary Structures
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400"
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Monthly Payroll Processing */}
          <TabsContent value="payroll" className="focus-visible:outline-none focus-visible:ring-0">
            <Card className="border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/10 bg-slate-900/50 p-6">
                <div>
                  <CardTitle className="text-xl text-white">
                    Payroll Processing
                  </CardTitle>
                  <CardDescription className="text-slate-400">
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
            <Card className="border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/10 bg-slate-900/50 p-6">
                <div>
                  <CardTitle className="text-xl text-white">
                    Employee Salary Structures
                  </CardTitle>
                  <CardDescription className="text-slate-400">
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
            <Card className="border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-emerald-500/10 bg-slate-900/50 p-6">
                <CardTitle className="text-xl text-white">
                  Financial Analytics
                </CardTitle>
                <CardDescription className="text-slate-400">
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
    </section>
  );
}