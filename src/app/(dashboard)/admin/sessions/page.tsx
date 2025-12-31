// File: src/app/(dashboard)/admin/sessions/page.tsx
"use client";

import React, { useMemo, lazy, Suspense } from "react";
import { api } from "~/trpc/react";
import { motion, useSpring, useTransform } from "framer-motion";

// --- UI Components ---
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { cn } from "~/lib/utils";

// --- Icons ---
import {
  Users,
  GraduationCap,
  School,
  DollarSign,
  TrendingUp,
  Download,
  Table as TableIcon
} from "lucide-react";

// --- Types ---
interface StatConfig {
  id: string;
  title: string;
  value: number;
  icon: React.ElementType;
  baseColor: "emerald" | "amber" | "blue" | "pink";
  prefix?: string;
  suffix?: string;
  trend?: string;
}

const LazySessionList = lazy(() =>
  import("~/components/tables/SessionList").then((module) => ({
    default: module.SessionList as React.ComponentType,
  }))
);

const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => 
    `${prefix}${Math.round(current).toLocaleString()}${suffix}`
  );

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const StatCard = React.memo(({ stat, index, isLoading }: { stat: StatConfig; index: number; isLoading: boolean }) => {
  const Icon = stat.icon;

  // Theme-aware styles based on baseColor
  const styles = {
    emerald: {
      border: "border-emerald-200 dark:border-emerald-500/10",
      bg: "bg-emerald-50 dark:bg-white/5",
      text: "text-emerald-900 dark:text-white",
      subText: "text-emerald-600/70 dark:text-emerald-100/60",
      iconBox: "bg-emerald-100 dark:bg-emerald-500/20 ring-emerald-200 dark:ring-white/10",
      iconColor: "text-emerald-600 dark:text-white",
      trendBadge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      gradient: "from-emerald-400 to-green-600",
    },
    amber: {
      border: "border-amber-200 dark:border-amber-500/10",
      bg: "bg-amber-50 dark:bg-white/5",
      text: "text-amber-900 dark:text-white",
      subText: "text-amber-600/70 dark:text-amber-100/60",
      iconBox: "bg-amber-100 dark:bg-amber-500/20 ring-amber-200 dark:ring-white/10",
      iconColor: "text-amber-600 dark:text-white",
      trendBadge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      gradient: "from-amber-400 to-orange-600",
    },
    blue: {
      border: "border-blue-200 dark:border-blue-500/10",
      bg: "bg-blue-50 dark:bg-white/5",
      text: "text-blue-900 dark:text-white",
      subText: "text-blue-600/70 dark:text-blue-100/60",
      iconBox: "bg-blue-100 dark:bg-blue-500/20 ring-blue-200 dark:ring-white/10",
      iconColor: "text-blue-600 dark:text-white",
      trendBadge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      gradient: "from-blue-400 to-indigo-600",
    },
    pink: {
      border: "border-pink-200 dark:border-pink-500/10",
      bg: "bg-pink-50 dark:bg-white/5",
      text: "text-pink-900 dark:text-white",
      subText: "text-pink-600/70 dark:text-pink-100/60",
      iconBox: "bg-pink-100 dark:bg-pink-500/20 ring-pink-200 dark:ring-white/10",
      iconColor: "text-pink-600 dark:text-white",
      trendBadge: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400 border-pink-200 dark:border-pink-500/20",
      gradient: "from-pink-400 to-rose-600",
    },
  }[stat.baseColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 120 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-4 backdrop-blur-md transition-all shadow-sm hover:shadow-md",
        styles.border,
        styles.bg
      )}
    >
      {/* Background Gradient Blob */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${styles.gradient} opacity-5 dark:opacity-10 blur-3xl transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className={cn("text-xs font-bold uppercase tracking-wider", styles.subText)}>{stat.title}</p>
          <div className={cn("mt-1 text-2xl font-bold", styles.text)}>
            {isLoading ? <Skeleton className="h-8 w-24 bg-slate-200 dark:bg-white/10" /> : <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />}
          </div>
        </div>
        <div className={cn("rounded-lg p-2 shadow-sm ring-1", styles.iconBox)}>
          <Icon className={cn("h-4 w-4", styles.iconColor)} />
        </div>
      </div>
      
      {stat.trend && !isLoading && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className={cn("flex items-center justify-center rounded-full px-1.5 py-0.5 border", styles.trendBadge)}>
            <TrendingUp className="h-3 w-3" />
          </div>
          <span className={cn("text-xs font-bold", styles.subText)}>{stat.trend} increase</span>
        </div>
      )}
    </motion.div>
  );
});
StatCard.displayName = "StatCard";

// --- Loading Skeletons ---
const DashboardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-48 bg-slate-200 dark:bg-emerald-900/20" />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-emerald-900/20" />)}
    </div>
    <Skeleton className="h-96 w-full rounded-xl bg-slate-200 dark:bg-emerald-900/20" />
  </div>
);

const TableSkeleton = () => (
  <div className="w-full space-y-2 p-4">
    <div className="flex justify-between mb-4">
       <Skeleton className="h-8 w-48 bg-slate-100 dark:bg-white/5" />
       <Skeleton className="h-8 w-24 bg-slate-100 dark:bg-white/5" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg bg-slate-100 dark:bg-white/5" />)}
  </div>
);

// --- Main Page ---
export default function SessionFeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/sessions", label: "Sessions & Fees", current: true },
  ];

  const queryOptions = { staleTime: 5 * 60 * 1000 };
  const { data: sessionData } = api.session.getActiveSession.useQuery(undefined, queryOptions);
  const { data: classData } = api.class.getClasses.useQuery(undefined, queryOptions);
  const { data: employeeData } = api.employee.getEmployees.useQuery(undefined, queryOptions);
  const { data: feeData } = api.fee.getAllFees.useQuery(undefined, queryOptions);
  const { data: studentData, isLoading: isInitialLoading, error } = api.student.getStudents.useQuery(undefined, queryOptions);

  const stats = useMemo<StatConfig[]>(() => {
    const totalRevenue = feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0;
    return [
      { id: "students", title: "Total Students", value: studentData?.length ?? 0, icon: Users, baseColor: "emerald", trend: "12%" },
      { id: "revenue", title: "Revenue", value: totalRevenue, icon: DollarSign, baseColor: "amber", prefix: "Rs. ", trend: "8%" },
      { id: "classes", title: "Active Classes", value: classData?.length ?? 0, icon: School, baseColor: "blue" },
      { id: "faculty", title: "Faculty", value: employeeData?.length ?? 0, icon: GraduationCap, baseColor: "pink" },
    ];
  }, [studentData, feeData, classData, employeeData]);

  if (error) return <div className="text-center p-8 text-red-500 dark:text-red-400">Error loading data.</div>;
  if (isInitialLoading) return <DashboardSkeleton />;

  return (
    <div className="w-full space-y-4">
      
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* --- Header Section --- */}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Session <span className="text-emerald-600 dark:text-emerald-500">Overview</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Manage academic terms, fee collection, and enrollment statistics for {sessionData?.sessionName ?? "current term"}.
          </p>
        </div>
        
        {sessionData && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 dark:border-emerald-500/20 dark:bg-emerald-500/5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-200">{sessionData.sessionName}</span>
          </div>
        )}
      </div>

      {/* --- 1. Key Metrics Grid --- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.id} stat={stat} index={i} isLoading={false} />
        ))}
      </div>

      {/* --- 2. Session Registry Table --- */}
      <Card className="overflow-hidden border border-slate-200 dark:border-emerald-500/10 bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-sm dark:shadow-2xl">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                  <TableIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Session Registry</CardTitle>
              </div>
            </div>
            <Button 
              size="sm"
              variant="outline" 
              className="h-8 text-xs border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-200 transition-colors"
            >
              <Download className="mr-2 h-3 w-3" />
              Export CSV
            </Button>
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

    </div>
  );
}