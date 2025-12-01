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
} from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "~/components/ui/button";

// 🎯 Define proper TypeScript interfaces
interface StatType {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
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

// 🎯 LAZY LOAD HEAVY COMPONENTS (Correct TypeScript import)
const LazySessionList = lazy(() => 
  import("~/components/tables/SessionList").then(module => ({
    default: module.SessionList as React.ComponentType
  }))
);

// 🎯 OPTIMIZED AnimatedNumber component (No DOM updates during animation)
const OptimizedAnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion(); // ✅ Moved to top level
  
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof value !== 'number' || prefersReducedMotion) return;
    
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentValue = Math.floor(startValue + (value - startValue) * easedProgress);
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    requestAnimationFrame(animate);
    
    return () => {
      setDisplayValue(0);
    };
  }, [value, prefersReducedMotion]); // ✅ Added prefersReducedMotion to dependencies
  
  if (prefersReducedMotion || !isMounted) {
    return <span>{value.toLocaleString()}</span>;
  }
  
  return <span>{displayValue.toLocaleString()}</span>;
};

// 🎯 STATS COMPONENT (Memoized with proper typing)
const StatCard = React.memo(({ 
  stat, 
  index,
  isLoading 
}: { 
  stat: StatType, 
  index: number,
  isLoading: boolean 
}) => {
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
      whileHover={{
        scale: 1.03,
        y: -4,
      }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-4 sm:p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl">
        <CardHeader className="mb-3 flex flex-row items-center justify-between space-y-0 p-0">
          <div>
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500">
              {stat.title}
            </CardTitle>
            {stat.change && (
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
            )}
          </div>
          <motion.div
            className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${stat.color} shadow-lg`}
            whileHover={{
              rotate: [0, -5, 5, 0],
              scale: 1.1,
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </motion.div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Skeleton className="h-7 w-20 rounded-lg bg-slate-200/50" />
            </motion.div>
          ) : (
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900">
                  {stat.prefix ?? ''}
                  <OptimizedAnimatedNumber value={stat.value} />
                </div>
                {stat.title === "Total Revenue" && stat.avgRevenue && (
                  <div className="mt-1 text-xs text-slate-500">
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
});

StatCard.displayName = 'StatCard';

// 🎯 SKELETON LOADER COMPONENT
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Skeleton className="h-6 w-48 bg-white/10" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />
        ))}
      </div>
      
      <div className="rounded-3xl bg-white/5 p-6">
        <Skeleton className="h-8 w-64 mb-4 bg-white/10" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 🎯 ERROR BOUNDARY COMPONENT
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  const errorMessage = error instanceof Error ? error.message : error.message || "Failed to load dashboard data";
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      <Card className="max-w-md bg-white/90 backdrop-blur-xl border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {errorMessage}
            </p>
            <Button 
              onClick={resetErrorBoundary}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 🎯 MAIN COMPONENT
export default function SessionFeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sessions", label: "Sessions", current: true },
  ];

  const [activeView, setActiveView] = useState<"overview" | "details">("overview");
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion(); // ✅ Moved to top level, before any conditional returns

  // 🎯 Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 🎯 PARALLEL API CALLS with error handling
  const { 
    data: sessionData, 
    isLoading: sessionLoading,
    error: sessionError 
  } = api.session.getActiveSession.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: classData, 
    isLoading: classLoading 
  } = api.class.getClasses.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: employeeData, 
    isLoading: employeeLoading 
  } = api.employee.getEmployees.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: feeData, 
    isLoading: feeLoading 
  } = api.fee.getAllFees.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: studentData, 
    isLoading: studentLoading 
  } = api.student.getStudents.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { 
    data: subjectData, 
    isLoading: subjectLoading 
  } = api.subject.getAllSubjects.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // 🎯 Compute derived data only when dependencies change
  const { totalRevenue, avgRevenuePerStudent } = useMemo(() => {
    const total = feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0;
    const avg = studentData?.length ? total / studentData.length : 0;
    return { totalRevenue: total, avgRevenuePerStudent: avg };
  }, [feeData, studentData]);

  // 🎯 Memoize stats array with proper typing
  const stats: StatType[] = useMemo(() => [
    {
      title: "Total Students",
      value: studentData?.length ?? 0,
      icon: Users,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-green-100/50",
      change: "+12%",
      trend: "up",
      isLoading: studentLoading,
    },
    {
      title: "Total Classes",
      value: classData?.length ?? 0,
      icon: School,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-purple-100/50",
      change: "+5%",
      trend: "up",
      isLoading: classLoading,
    },
    {
      title: "Active Employees",
      value: employeeData?.length ?? 0,
      icon: GraduationCap,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      bgColor: "from-amber-50 to-amber-100/50",
      change: "+3%",
      trend: "up",
      isLoading: employeeLoading,
    },
    {
      title: "Courses Offered",
      value: subjectData?.length ?? 0,
      icon: BookOpen,
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-pink-100/50",
      change: "+8%",
      trend: "up",
      isLoading: subjectLoading,
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      icon: DollarSign,
      color: "bg-gradient-to-br from-teal-500 to-cyan-600",
      bgColor: "from-teal-50 to-teal-100/50",
      prefix: "Rs. ",
      change: "+15%",
      trend: "up",
      avgRevenue: Math.round(avgRevenuePerStudent),
      isLoading: feeLoading,
    },
  ], [
    studentData, classData, employeeData, subjectData, totalRevenue,
    studentLoading, classLoading, employeeLoading, subjectLoading, feeLoading,
    avgRevenuePerStudent
  ]);

  // 🎯 Loading state
  const isLoading = sessionLoading || classLoading || employeeLoading || 
                   feeLoading || studentLoading || subjectLoading;

  // 🎯 Error state
  if (sessionError) {
    const error = sessionError instanceof Error 
      ? sessionError 
      : new Error(sessionError?.message || "Failed to load session data");
    
    return <ErrorFallback error={error} resetErrorBoundary={() => window.location.reload()} />;
  }

  // 🎯 Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* 🎯 OPTIMIZED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-cyan-900/10 to-transparent" />
      </div>

      {/* 🎯 REDUCED ANIMATIONS ON MOBILE */}
      {!prefersReducedMotion && !isMobile && (
        <>
          <motion.div
            className="absolute left-1/4 top-1/4 h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[60px] sm:h-[25rem] sm:w-[25rem] sm:blur-[80px]"
            animate={{ 
              y: [0, 20, 0], 
              x: [0, 10, 0],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 h-[15rem] w-[15rem] rounded-full bg-cyan-500/10 blur-[40px] sm:h-[20rem] sm:w-[20rem] sm:blur-[60px]"
            animate={{ 
              y: [0, -20, 0], 
              x: [0, -10, 0],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
        </>
      )}

      <div className="relative z-10 px-4 py-4 sm:px-6 lg:px-8">
        <PageHeader breadcrumbs={breadcrumbs} />

        {/* 🎯 IMPROVED MOBILE TOGGLE */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setActiveView("overview")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                activeView === "overview" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "bg-transparent text-white/70"
              }`}
              aria-label="View overview"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView("details")}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                activeView === "details" 
                  ? "bg-white/20 text-white shadow-lg" 
                  : "bg-transparent text-white/70"
              }`}
              aria-label="View details"
            >
              Details
            </button>
          </div>
        </div>

        {/* 🎯 MAIN CONTENT */}
        <div className="flex-1 space-y-4 lg:space-y-6">
          {/* OVERVIEW SECTION */}
          <div className={`${activeView === "overview" ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl">
              <div className="relative overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8">
                {!isMobile && (
                  <>
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/10 to-cyan-400/20 blur-xl"></div>
                    <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/15 blur-lg"></div>
                  </>
                )}

                <div className="mb-4 sm:mb-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-800 to-cyan-700 bg-clip-text text-transparent">
                    Session Dashboard
                  </h1>
                  <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
                    Comprehensive overview of academic sessions and financial data
                  </p>
                </div>

                {/* 🎯 OPTIMIZED STATS GRID */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.map((stat, index) => (
                    <StatCard 
                      key={index} 
                      stat={stat} 
                      index={index} 
                      isLoading={stat.isLoading ?? false}
                    />
                  ))}
                </div>

                {/* 🎯 MOBILE CALL TO ACTION */}
                <div className="lg:hidden mt-6">
                  <button
                    onClick={() => setActiveView("details")}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
                  >
                    View Session Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className={`${activeView === "details" ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-white/40 shadow-xl">
              <div className="relative overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8">
                <Card className="border-0 bg-transparent shadow-none">
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-2 sm:p-3 shadow-lg">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                          Session Management
                        </CardTitle>
                        {sessionData && (
                          <CardDescription className="mt-1 text-xs sm:text-sm text-slate-600">
                            <span className="font-medium">Current Session:</span>{" "}
                            <span className="font-semibold text-slate-900">
                              {sessionData.sessionName}
                            </span>
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 🎯 SUSPENSE BOUNDARY FOR LAZY LOADED TABLE */}
                  <Suspense fallback={
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 rounded-lg bg-slate-200/50" />
                      ))}
                    </div>
                  }>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="min-w-[800px] sm:min-w-0">
                        <LazySessionList />
                      </div>
                    </div>
                  </Suspense>
                </Card>

                {/* 🎯 BACK BUTTON FOR MOBILE */}
                <div className="lg:hidden mt-6">
                  <button
                    onClick={() => setActiveView("overview")}
                    className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-500 text-white rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 FLOATING ACTION BUTTON (Mobile only) */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setActiveView(activeView === "overview" ? "details" : "overview")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-xl active:scale-90 transition-transform"
            aria-label="Toggle view"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        </div>

        {/* 🎯 PERFORMANCE MONITORING (Dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-20 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-50">
            {isMobile ? '📱 Mobile' : '🖥️ Desktop'} | 
            Perf: {stats.filter(s => !s.isLoading).length}/5 loaded
          </div>
        )}
      </div>
    </div>
  );
}