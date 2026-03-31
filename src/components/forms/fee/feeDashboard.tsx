// File: src/components/forms/fee/feeDashboard.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertCircle,
  BarChart3,
  FileText,
  GraduationCap,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { ExportDialog } from "./export-dialog";
import { FeeAssignmentDialog } from "./feeAssignment";
import { ClassFeeCards } from "./class-fee-cards";
import { MonthlyFeeSummary } from "./monthly-fee-summary";
import { FeeTable } from "~/components/tables/FeeTable";
import { DefaultersList } from "./defaulters-list";
import { FeeAnalyticsDashboard } from "./fee-analytics-dashboard";
import { StudentFeeLedger } from "./student-fee-ledger";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export function FeeDashboard() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sessionsQuery = api.session.getSessions.useQuery();
  const utils = api.useUtils();

  const summaryQuery = api.fee.getClassFeeSummary.useQuery(
    { sessionId: selectedSessionId, year: selectedYear },
    { enabled: !!selectedSessionId },
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await utils.fee.invalidate();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Auto-select first session
  if (sessionsQuery.data?.length && !selectedSessionId) {
    const activeSession =
      sessionsQuery.data.find((s) => s.isActive) ?? sessionsQuery.data[0];
    if (activeSession) {
      setSelectedSessionId(activeSession.sessionId);
    }
  }

  const { grandTotals } = summaryQuery.data ?? {
    grandTotals: {
      totalExpected: 0,
      totalCollected: 0,
      outstanding: 0,
      collectionRate: 0,
      totalStudents: 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Fee Management
          </h1>
          <p className="mt-1 text-muted-foreground dark:text-muted-foreground">
            Manage fee structures, track collections, and view analytics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedSessionId}
            onValueChange={setSelectedSessionId}
          >
            <SelectTrigger className="w-[200px] border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground">
              {sessionsQuery.isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <SelectValue placeholder="Select Session" />
              )}
            </SelectTrigger>
            <SelectContent className="dark:border-border dark:bg-card">
              {sessionsQuery.data?.map((session) => (
                <SelectItem key={session.sessionId} value={session.sessionId}>
                  <div className="flex items-center gap-2">
                    {session.sessionName}
                    {session.isActive && (
                      <Badge
                        variant="default"
                        className="bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(selectedYear)}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[120px] border-slate-200 bg-white dark:border-border dark:bg-card dark:text-foreground">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="dark:border-border dark:bg-card">
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-slate-200 bg-white text-slate-600 hover:text-emerald-600 dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:text-emerald-400"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>

          <ExportDialog sessionId={selectedSessionId} year={selectedYear} />

          <FeeAssignmentDialog />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Expected"
          value={grandTotals.totalExpected}
          icon={DollarSign}
          trend={null}
          color="blue"
          isLoading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Total Collected"
          value={grandTotals.totalCollected}
          icon={TrendingUp}
          trend={grandTotals.collectionRate}
          color="green"
          isLoading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Outstanding"
          value={grandTotals.outstanding}
          icon={AlertCircle}
          trend={null}
          color="orange"
          isLoading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Total Students"
          value={grandTotals.totalStudents}
          icon={Users}
          trend={null}
          color="purple"
          isLoading={summaryQuery.isLoading}
          isCurrency={false}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-card">
          <TabsTrigger
            value="classes"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <GraduationCap className="h-4 w-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="monthly"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Monthly View
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Student Ledger
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="defaulters"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <AlertCircle className="h-4 w-4" />
            Defaulters
          </TabsTrigger>
          <TabsTrigger
            value="structure"
            className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-foreground"
          >
            <DollarSign className="h-4 w-4" />
            Fee Structure
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="classes"
          className="duration-300 animate-in fade-in-50"
        >
          <ClassFeeCards
            sessionId={selectedSessionId}
            year={selectedYear}
            classData={summaryQuery.data?.classes}
            isLoading={summaryQuery.isLoading}
          />
        </TabsContent>

        <TabsContent
          value="monthly"
          className="duration-300 animate-in fade-in-50"
        >
          <MonthlyFeeSummary
            sessionId={selectedSessionId}
            year={selectedYear}
          />
        </TabsContent>

        <TabsContent
          value="ledger"
          className="duration-300 animate-in fade-in-50"
        >
          <StudentFeeLedger sessionId={selectedSessionId} />
        </TabsContent>

        <TabsContent
          value="analytics"
          className="duration-300 animate-in fade-in-50"
        >
          <FeeAnalyticsDashboard
            sessionId={selectedSessionId}
            year={selectedYear}
          />
        </TabsContent>

        <TabsContent
          value="defaulters"
          className="duration-300 animate-in fade-in-50"
        >
          <DefaultersList sessionId={selectedSessionId} year={selectedYear} />
        </TabsContent>

        <TabsContent
          value="structure"
          className="duration-300 animate-in fade-in-50"
        >
          <FeeTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend: number | null;
  color: "blue" | "green" | "orange" | "purple";
  isLoading: boolean;
  isCurrency?: boolean;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  isLoading,
  isCurrency = true,
}: SummaryCardProps) {
  // Theme-aware color classes
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 hover:shadow-blue-500/10",
    green:
      "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 hover:shadow-emerald-500/10",
    orange:
      "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300 hover:shadow-orange-500/10",
    purple:
      "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300 hover:shadow-purple-500/10",
  };

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    green:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  };

  return (
    <Card
      className={cn(
        "border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        colorClasses[color],
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", iconColorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-black/5 dark:bg-white/10" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {isCurrency
                ? `Rs. ${value.toLocaleString()}`
                : value.toLocaleString()}
            </span>
            {trend !== null && (
              <Badge
                variant={trend >= 70 ? "default" : "destructive"}
                className={cn(
                  "ml-auto text-xs",
                  trend >= 70
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400",
                )}
              >
                {trend >= 70 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {trend.toFixed(1)}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
