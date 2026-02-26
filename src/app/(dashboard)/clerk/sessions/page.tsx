"use client";

import React, { useMemo, lazy, Suspense } from "react";
import { api } from "~/trpc/react";
import { motion, useSpring, useTransform } from "framer-motion";

// --- UI Components ---
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { PageHeader } from "~/components/blocks/nav/PageHeader";

// --- Icons ---
import {
  Users,
  GraduationCap,
  School,
  DollarSign,
  TrendingUp,
  Download,
  Table as TableIcon,
} from "lucide-react";

// --- Types & Stat Components (Same as before) ---
interface StatConfig {
  id: string;
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  textColor: string;
  prefix?: string;
  suffix?: string;
  trend?: string;
}

const LazySessionList = lazy(() =>
  import("~/components/tables/SessionList").then((module) => ({
    default: module.SessionList as React.ComponentType,
  })),
);

const AnimatedCounter = ({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) => {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(
    spring,
    (current) => `${prefix}${Math.round(current).toLocaleString()}${suffix}`,
  );

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const StatCard = React.memo(
  ({
    stat,
    index,
    isLoading,
  }: {
    stat: StatConfig;
    index: number;
    isLoading: boolean;
  }) => {
    const Icon = stat.icon;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 120 }}
        // ⚡️ COMPACT: Reduced padding from p-6 to p-4
        className="group relative overflow-hidden rounded-xl border border-emerald-500/10 bg-white/5 p-4 shadow-lg backdrop-blur-md transition-all hover:border-emerald-500/30 hover:bg-white/10 hover:shadow-emerald-900/20"
      >
        <div
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-100/60">
              {stat.title}
            </p>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-white/10" />
              ) : (
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              )}
            </div>
          </div>
          <div
            className={`rounded-lg bg-gradient-to-br ${stat.gradient} p-2 shadow-inner ring-1 ring-white/10`}
          >
            <Icon className="h-4 w-4 text-foreground" />
          </div>
        </div>
        {stat.trend && !isLoading && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="flex items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/20 px-1.5 py-0.5">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400">
              {stat.trend} increase
            </span>
          </div>
        )}
      </motion.div>
    );
  },
);
StatCard.displayName = "StatCard";

// --- Loading Skeletons ---
const DashboardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-48 bg-emerald-900/20" />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl bg-emerald-900/20" />
      ))}
    </div>
    <Skeleton className="h-96 w-full rounded-xl bg-emerald-900/20" />
  </div>
);

const TableSkeleton = () => (
  <div className="w-full space-y-2 p-4">
    <div className="mb-4 flex justify-between">
      <Skeleton className="h-8 w-48 bg-white/5" />
      <Skeleton className="h-8 w-24 bg-white/5" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-lg bg-white/5" />
    ))}
  </div>
);

// --- Main Page ---
export default function SessionFeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Admin" },
    { href: "/admin/sessions", label: "Sessions & Fees", current: true },
  ];

  const queryOptions = { staleTime: 5 * 60 * 1000 };
  const { data: sessionData } = api.session.getActiveSession.useQuery(
    undefined,
    queryOptions,
  );
  const { data: classData } = api.class.getClasses.useQuery(
    undefined,
    queryOptions,
  );
  const { data: employeeData } = api.employee.getEmployees.useQuery(
    undefined,
    queryOptions,
  );
  const { data: feeData } = api.fee.getAllFees.useQuery(
    undefined,
    queryOptions,
  );
  const {
    data: studentData,
    isLoading: isInitialLoading,
    error,
  } = api.student.getStudents.useQuery(undefined, queryOptions);

  const stats = useMemo<StatConfig[]>(() => {
    const totalRevenue =
      feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0;
    return [
      {
        id: "students",
        title: "Total Students",
        value: studentData?.length ?? 0,
        icon: Users,
        gradient: "from-emerald-400 to-green-600",
        textColor: "text-emerald-400",
        trend: "12%",
      },
      {
        id: "revenue",
        title: "Revenue",
        value: totalRevenue,
        icon: DollarSign,
        gradient: "from-amber-400 to-orange-600",
        textColor: "text-amber-400",
        prefix: "Rs. ",
        trend: "8%",
      },
      {
        id: "classes",
        title: "Active Classes",
        value: classData?.length ?? 0,
        icon: School,
        gradient: "from-blue-400 to-indigo-600",
        textColor: "text-blue-400",
      },
      {
        id: "faculty",
        title: "Faculty",
        value: employeeData?.length ?? 0,
        icon: GraduationCap,
        gradient: "from-purple-400 to-pink-600",
        textColor: "text-pink-400",
      },
    ];
  }, [studentData, feeData, classData, employeeData]);

  if (error)
    return (
      <div className="p-8 text-center text-red-400">Error loading data.</div>
    );
  if (isInitialLoading) return <DashboardSkeleton />;

  return (
    // ⚡️ COMPACT: space-y-4 is tighter than standard space-y-6 or 8
    <div className="w-full space-y-4">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* --- Header Section (Reduced Margins) --- */}
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Session <span className="text-emerald-500">Overview</span>
          </h1>
          {/* ⚡️ COMPACT: Reduced margin-top (mt-1) and max-width */}
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Manage academic terms, fee collection, and enrollment statistics for{" "}
            {sessionData?.sessionName ?? "current term"}.
          </p>
        </div>

        {sessionData && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-emerald-200">
              {sessionData.sessionName}
            </span>
          </div>
        )}
      </div>

      {/* --- 1. Key Metrics Grid (Tighter Gap) --- */}
      {/* ⚡️ COMPACT: Reduced gap-4 to gap-3 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.id} stat={stat} index={i} isLoading={false} />
        ))}
      </div>

      {/* --- 2. Session Registry Table (Full Width & Compact) --- */}
      <Card className="overflow-hidden border border-emerald-500/10 bg-card shadow-2xl backdrop-blur-xl">
        {/* ⚡️ COMPACT: Reduced padding px-4 py-3 */}
        <CardHeader className="border-b border-border bg-white/5 px-4 py-3">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5">
                <TableIcon className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Session Registry
                </CardTitle>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
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
