"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, FileText, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Grade scale reference
const GRADE_SCALE = [
  { grade: "A+", percentage: "90-100", color: "text-emerald-400" },
  { grade: "A", percentage: "80-89", color: "text-blue-400" },
  { grade: "B", percentage: "70-79", color: "text-amber-400" },
  { grade: "C", percentage: "60-69", color: "text-orange-400" },
  { grade: "D", percentage: "50-59", color: "text-red-400" },
];

export default function StudentGradesPage() {
  const breadcrumbs = [
    { href: "/student", label: "Dashboard", current: false },
    { href: "/student/grades", label: "Grades", current: true },
  ];

  // Get current user profile to fetch their report cards
  const { data: userProfile } = api.profile.getProfile.useQuery();
  const studentId = userProfile?.accountId ?? "";

  // Fetch report cards for the student
  const { data: reportCards, isLoading } = api.reportCard.getStudentReportCards.useQuery(
    { studentId },
    { enabled: !!studentId }
  );

  const latestReportCard = reportCards?.[0];
  const cumulativePerformance = reportCards?.map((card, idx) => ({
    month: ["January", "February", "March", "April", "May", "June"][idx] || `Month ${idx + 1}`,
    average: card.percentage || 0,
    trend: "up" as const,
  })) ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading grades...</p>
        </div>
      </div>
    );
  }

  const avgScore = reportCards && reportCards.length > 0
    ? Math.round(reportCards.reduce((sum, card) => sum + (card.percentage ?? 0), 0) / reportCards.length)
    : 0;

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Report Card
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {latestReportCard?.percentage ?? "—"}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Grade: {latestReportCard?.grade ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Average
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgScore}%</div>
            <p className="mt-1 text-xs text-blue-400">
              Across all exams
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reports
            </CardTitle>
            <Award className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {reportCards?.length ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Report cards issued
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="reports"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <FileText className="h-4 w-4" /> Report Cards
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" /> Trends
            </TabsTrigger>
            <TabsTrigger
              value="scale"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Award className="h-4 w-4" /> Grade Scale
            </TabsTrigger>
          </TabsList>

          {/* Report Cards Tab */}
          <TabsContent value="reports">
            <div className="space-y-4">
              {reportCards && reportCards.length > 0 ? (
                reportCards.map((reportCard, index) => (
                <motion.div
                  key={reportCard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold text-foreground">
                              {reportCard.examName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Issued: {new Date(reportCard.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-400">
                              {reportCard.grade}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {reportCard.percentage}%
                            </p>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full gap-2">
                          <FileText className="h-4 w-4" /> View Full Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
              ) : (
                <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No report cards available yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cumulativePerformance.length > 0 ? (
                    <>
                      {cumulativePerformance.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border bg-black/20 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">
                              {item.month}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-emerald-400">
                                {item.average}%
                              </span>
                              {item.trend === "up" && (
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                              )}
                            </div>
                          </div>
                          <Progress
                            value={item.average}
                            className="h-2 bg-muted"
                          />
                        </div>
                      ))}
                      <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <p className="text-sm font-medium text-emerald-200">
                          Performance Summary
                        </p>
                        <p className="mt-1 text-sm text-emerald-100/70">
                          View your academic progress across all report cards above.
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No trend data available yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grade Scale Tab */}
          <TabsContent value="scale">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Grade Scale</CardTitle>
                <CardDescription>
                  Marking scheme and grade conversion chart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {GRADE_SCALE.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border bg-black/20 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold ${item.color}`}
                        >
                          {item.grade}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.grade}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Grade
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {item.percentage}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Percentage
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
