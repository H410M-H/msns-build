"use client";

import React, { useEffect, useState, useMemo, lazy, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  School,
  DollarSign,
  Target,
  TrendingUp,
  BarChart3,
  AlertCircle,
  Layers,
} from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "~/components/ui/button";

// --- Types ---
interface StatType {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  textColor: string;
  borderColor: string;
  change?: string;
  trend?: "up" | "down";
  prefix?: string;
  avgRevenue?: number;
  isLoading?: boolean;
}

interface ErrorFallbackProps {
  error: Error | { message: string };
  resetErrorBoundary: () => void;
}

// --- Lazy Load ---
const LazySessionList = lazy(() =>
  import("~/components/tables/SessionList").then((module) => ({
    default: module.SessionList as React.ComponentType,
  }))
);

// --- Optimized Number Animation ---
const OptimizedAnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
    if (typeof value !== "number" || prefersReducedMotion) return;

    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentValue = Math.floor(
        startValue + (value - startValue) * easedProgress
      );
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
    return () => setDisplayValue(0);
  }, [value, prefersReducedMotion]);

  if (prefersReducedMotion || !isMounted) {
    return <span>{value.toLocaleString()}</span>;
  }

  return <span>{displayValue.toLocaleString()}</span>;
};

// --- Stat Card Component ---
const StatCard = React.memo(
  ({ stat, index, isLoading }: { stat: StatType; index: number; isLoading: boolean }) => {
    const Icon = stat.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: index * 0.05,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Card
          className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border ${stat.borderColor} bg-white/5 p-4 sm:p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-900/20`}
        >
          <div
            className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40`}
          />

          <CardHeader className="mb-3 flex flex-row items-center justify-between space-y-0 p-0 relative z-10">
            <div>
              <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/70">
                {stat.title}
              </CardTitle>
              {stat.change && (
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className={`h-3 w-3 ${stat.textColor}`} />
                  <span className={`text-xs font-medium ${stat.textColor}`}>
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <motion.div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg text-white`}
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          </CardHeader>

          <CardContent className="p-0 relative z-10">
            {isLoading ? (
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Skeleton className="h-8 w-24 rounded-lg bg-white/10" />
              </motion.div>
            ) : (
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                    <span className={`text-lg mr-1 ${stat.textColor} opacity-80`}>
                      {stat.prefix ?? ""}
                    </span>
                    <OptimizedAnimatedNumber value={stat.value} />
                  </div>
                  {stat.title === "Total Revenue" && stat.avgRevenue && (
                    <div className="mt-1 text-xs text-white/50 font-medium">
                      Avg: Rs. {stat.avgRevenue.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
StatCard.displayName = "StatCard";

// --- Skeleton Component ---
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-64 mb-6 bg-white/10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-white/5 border border-white/10" />
        ))}
      </div>
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
        <Skeleton className="h-8 w-64 mb-4 bg-white/10" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- Error Fallback Component ---
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
    <Card className="max-w-md bg-black/40 backdrop-blur-xl border border-red-500/30 text-white shadow-2xl">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-500/10 p-3 rounded-full mb-4">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">System Error</h3>
          <p className="text-sm text-red-200/80 mb-6">{error.message}</p>
          <Button
            onClick={resetErrorBoundary}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 border-0 shadow-lg"
          >
            Retry Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// --- Main Page Component ---
export default function SessionFeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sessions", label: "Sessions", current: true },
  ];

  const [activeView, setActiveView] = useState<"overview" | "details">("overview");
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const queryOptions = { staleTime: 5 * 60 * 1000 };
  const { data: sessionData, isLoading: sessionLoading, error: sessionError } = api.session.getActiveSession.useQuery(undefined, queryOptions);
  const { data: classData, isLoading: classLoading } = api.class.getClasses.useQuery(undefined, queryOptions);
  const { data: employeeData, isLoading: employeeLoading } = api.employee.getEmployees.useQuery(undefined, queryOptions);
  const { data: feeData, isLoading: feeLoading } = api.fee.getAllFees.useQuery(undefined, queryOptions);
  const { data: studentData, isLoading: studentLoading } = api.student.getStudents.useQuery(undefined, queryOptions);
  const { data: subjectData, isLoading: subjectLoading } = api.subject.getAllSubjects.useQuery(undefined, queryOptions);

  const { totalRevenue, avgRevenuePerStudent } = useMemo(() => {
    const total = feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0;
    const avg = studentData?.length ? total / studentData.length : 0;
    return { totalRevenue: total, avgRevenuePerStudent: avg };
  }, [feeData, studentData]);

  const stats: StatType[] = useMemo(
    () => [
      {
        title: "Total Students",
        value: studentData?.length ?? 0,
        icon: Users,
        color: "from-emerald-400 to-green-600",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500/30",
        change: "+12%",
        trend: "up",
        isLoading: studentLoading,
      },
      {
        title: "Total Classes",
        value: classData?.length ?? 0,
        icon: Layers,
        color: "from-teal-400 to-cyan-600",
        textColor: "text-cyan-400",
        borderColor: "border-cyan-500/30",
        change: "+5%",
        trend: "up",
        isLoading: classLoading,
      },
      {
        title: "Active Faculty",
        value: employeeData?.length ?? 0,
        icon: GraduationCap,
        color: "from-lime-400 to-green-600",
        textColor: "text-lime-400",
        borderColor: "border-lime-500/30",
        change: "+3%",
        trend: "up",
        isLoading: employeeLoading,
      },
      {
        title: "Courses Offered",
        value: subjectData?.length ?? 0,
        icon: BookOpen,
        color: "from-cyan-400 to-blue-600",
        textColor: "text-blue-400",
        borderColor: "border-blue-500/30",
        change: "+8%",
        trend: "up",
        isLoading: subjectLoading,
      },
      {
        title: "Total Revenue",
        value: totalRevenue,
        icon: DollarSign,
        color: "from-amber-400 to-orange-600",
        textColor: "text-amber-400",
        borderColor: "border-amber-500/30",
        prefix: "Rs. ",
        change: "+15%",
        trend: "up",
        avgRevenue: Math.round(avgRevenuePerStudent),
        isLoading: feeLoading,
      },
    ],
    [studentData, classData, employeeData, subjectData, totalRevenue, studentLoading, classLoading, employeeLoading, subjectLoading, feeLoading, avgRevenuePerStudent]
  );

  const isLoading = sessionLoading || classLoading || employeeLoading || feeLoading || studentLoading || subjectLoading;

  if (sessionError) {
    const error = sessionError instanceof Error ? sessionError : new Error(sessionError?.message || "Failed to load data");
    return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
  }

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>

      {!prefersReducedMotion && !isMobile && (
        <>
          <motion.div
            className="absolute left-[10%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[80px]"
            animate={{ y: [0, 30, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[10%] right-[10%] h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[80px]"
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </>
      )}

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader breadcrumbs={breadcrumbs} />

        {/* Mobile View Toggle */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
            <Button
              onClick={() => setActiveView("overview")}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                activeView === "overview" ? "bg-emerald-600 text-white shadow-lg" : "bg-transparent text-emerald-100/60"
              }`}
            >
              Overview
            </Button>
            <Button
              onClick={() => setActiveView("details")}
              className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all text-sm ${
                activeView === "details" ? "bg-emerald-600 text-white shadow-lg" : "bg-transparent text-emerald-100/60"
              }`}
            >
              Details
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-6 lg:space-y-8">
          {/* OVERVIEW */}
          <div className={activeView === "overview" ? "block" : "hidden lg:block"}>
            <div className="bg-black/20 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="p-6 sm:p-8 md:p-10 relative z-10">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      Session <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Insights</span>
                    </h1>
                    <p className="text-emerald-100/60 mt-2 text-sm sm:text-base font-medium max-w-2xl">
                      Real-time academic metrics and financial overview.
                    </p>
                  </div>
                  {sessionData && (
                    <div className="hidden sm:block text-right">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-sm font-semibold text-emerald-100">
                          Active: {sessionData.sessionName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} index={index} isLoading={stat.isLoading ?? false} />
                  ))}
                </div>

                <div className="lg:hidden mt-8">
                  <Button
                    onClick={() => setActiveView("details")}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
                  >
                    View All Details <Target className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className={activeView === "details" ? "block" : "hidden lg:block"}>
            <div className="bg-black/20 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative">
              <div className="p-0 sm:p-2 relative z-10">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="p-6 sm:px-8 pt-8 flex items-center gap-4 border-b border-white/5 pb-6 mb-2">
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-3 shadow-lg">
                      <School className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-white">Session Management</CardTitle>
                      <CardDescription className="text-emerald-100/50 text-xs sm:text-sm mt-1">
                        Manage academic terms, view detailed lists, and configure session parameters.
                      </CardDescription>
                    </div>
                  </div>

                  <div className="p-2 sm:p-6">
                    <Suspense
                      fallback={
                        <div className="space-y-4 p-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-xl bg-white/5 border border-white/10" />
                          ))}
                        </div>
                      }
                    >
                      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
                        <div className="min-w-[800px] sm:min-w-0 p-4">
                          <LazySessionList />
                        </div>
                      </div>
                    </Suspense>
                  </div>
                </Card>

                <div className="lg:hidden p-6 pt-0">
                  <Button
                    onClick={() => setActiveView("overview")}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold active:scale-95 transition-transform"
                  >
                    Back to Overview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Toggle (Mobile) */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveView(activeView === "overview" ? "details" : "overview")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-2xl border border-white/20 backdrop-blur-md"
          >
            <BarChart3 className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}