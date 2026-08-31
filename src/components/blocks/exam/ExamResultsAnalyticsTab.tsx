"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Progress } from "~/components/ui/progress";
import {
  Trophy,
  Users,
  Award,
  BarChart3,
  TrendingUp,
  FileCheck,
  GraduationCap,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "~/lib/utils";

interface ExamResultsAnalyticsTabProps {
  sessionId?: string;
  selectedClassId?: string | null;
  onSelectClass?: (classId: string | null) => void;
}

const GRADE_COLORS: Record<string, string> = {
  "A+ (90-100%)": "#10b981",
  "A (80-89%)": "#059669",
  "B (70-79%)": "#3b82f6",
  "C (60-69%)": "#f59e0b",
  "D (50-59%)": "#ea580c",
  "F (<50%)": "#ef4444",
};

export function ExamResultsAnalyticsTab({
  sessionId,
  selectedClassId,
  onSelectClass,
}: ExamResultsAnalyticsTabProps) {
  const { data: activeSession } = api.session.getActiveSession.useQuery(
    undefined,
    { enabled: !sessionId },
  );

  const effectiveSessionId = sessionId ?? activeSession?.sessionId;

  const { data: classes } = api.class.getAllClasses.useQuery(undefined, {
    enabled: true,
  });

  const [activeFilterClass, setActiveFilterClass] = useState<string | "all">(
    selectedClassId ?? "all",
  );

  const { data: analytics, isLoading } = api.exam.getResultsAnalytics.useQuery(
    {
      sessionId: effectiveSessionId ?? "",
      classId: activeFilterClass === "all" ? undefined : activeFilterClass,
    },
    { enabled: !!effectiveSessionId },
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Examination Results Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Aggregate performance indicators, subject pass rates, and grade distribution
          </p>
        </div>
      </div>

      {/* Class Pills Filter */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/70 p-2 shadow-sm backdrop-blur dark:border-border dark:bg-card">
        <Button
          size="sm"
          variant={activeFilterClass === "all" ? "default" : "ghost"}
          onClick={() => {
            setActiveFilterClass("all");
            onSelectClass?.(null);
          }}
          className={cn(
            "h-8 rounded-xl text-xs font-semibold transition-all",
            activeFilterClass === "all"
              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted",
          )}
        >
          All Classes ({classes?.length ?? 0})
        </Button>

        {classes?.map((cls) => {
          const isSelected = activeFilterClass === cls.classId;
          return (
            <Button
              key={cls.classId}
              size="sm"
              variant={isSelected ? "default" : "ghost"}
              onClick={() => {
                setActiveFilterClass(cls.classId);
                onSelectClass?.(cls.classId);
              }}
              className={cn(
                "h-8 rounded-xl text-xs font-semibold transition-all",
                isSelected
                  ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600 dark:text-white"
                  : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted",
              )}
            >
              {cls.grade} - {cls.section}
            </Button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-2xl p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
            <Card className="rounded-2xl p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
          </div>
        </div>
      )}

      {/* Analytics Loaded State */}
      {!isLoading && analytics && (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Evaluated Students
                </p>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {analytics.totalStudents}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Across {analytics.totalExams} exam records
                </p>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Average Class Score
                </p>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {analytics.averageScorePct}%
                </span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                  Overall performance
                </p>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Total Marks Entries
                </p>
                <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <FileCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {analytics.totalMarksCount}
                </span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Verified subject marks
                </p>
              </div>
            </Card>

            <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Top Score
                </p>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {analytics.topStudents[0]?.percentage ?? 0}%
                </span>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium truncate">
                  {analytics.topStudents[0]?.studentName ?? "No scores yet"}
                </p>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Subject Average Score Chart */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Subject Average Scores (%)
                </CardTitle>
                <CardDescription className="text-xs">
                  Average percentage score achieved across all evaluated subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {analytics.subjectStats.length > 0 ? (
                  <div className="h-72 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.subjectStats}
                        margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="subjectName"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <RechartsTooltip
                          formatter={(val: number) => [`${val}%`, "Average"]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar
                          dataKey="averagePct"
                          name="Average Score"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-72 items-center justify-center text-xs text-muted-foreground">
                    No subject marks recorded yet for the selected filter.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grade Distribution Chart */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                  <Award className="h-4 w-4 text-blue-600" />
                  Grade Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Count of students by overall examination grade bracket
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {analytics.totalStudents > 0 ? (
                  <div className="h-72 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.gradeDistribution}
                        margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#64748b" }}
                        />
                        <RechartsTooltip
                          formatter={(val: number) => [`${val} Students`, "Count"]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                          {analytics.gradeDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={GRADE_COLORS[entry.name] ?? "#3b82f6"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-72 items-center justify-center text-xs text-muted-foreground">
                    No student grades evaluated yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard & Subject Details Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Top Students Leaderboard */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-border/60">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Top Performers
                </CardTitle>
                <CardDescription className="text-xs">
                  Highest achieving students across all subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics.topStudents.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-border/40">
                    {analytics.topStudents.map((student, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                              idx === 0
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : idx === 1
                                ? "bg-slate-200 text-slate-700"
                                : idx === 2
                                ? "bg-amber-700/20 text-amber-900"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-foreground">
                              {student.studentName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {student.totalObtained} / {student.totalMax} Marks
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-xs"
                        >
                          {student.percentage}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No top scorers recorded.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subject Pass Rate Breakdown Table */}
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card lg:col-span-2">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-border/60">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  Subject Breakdown & Pass Rates
                </CardTitle>
                <CardDescription className="text-xs">
                  Detailed subject-by-subject passing percentage and average score
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {analytics.subjectStats.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-border/40">
                    {analytics.subjectStats.map((sub, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                            {sub.subjectName}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              Avg: <strong>{sub.averagePct}%</strong>
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs font-semibold",
                                sub.passRate >= 75
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : sub.passRate >= 50
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
                              )}
                            >
                              Pass Rate: {sub.passRate}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={sub.passRate} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No subject statistics available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
