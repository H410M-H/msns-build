"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, FileText } from "lucide-react";
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

const REPORT_CARDS = [
  {
    id: "RC-001",
    exam: "Midterm Exam 2025",
    totalMarks: 500,
    obtainedMarks: 425,
    percentage: 85,
    grade: "A",
    subjects: [
      { name: "Mathematics", marks: 85, total: 100 },
      { name: "English", marks: 88, total: 100 },
      { name: "Science", marks: 92, total: 100 },
      { name: "Social Studies", marks: 80, total: 100 },
      { name: "Computer Science", marks: 80, total: 100 },
    ],
    issued: "2025-01-30",
  },
  {
    id: "RC-002",
    exam: "Unit Test 1",
    totalMarks: 300,
    obtainedMarks: 255,
    percentage: 85,
    grade: "A",
    subjects: [
      { name: "Mathematics", marks: 84, total: 100 },
      { name: "English", marks: 86, total: 100 },
      { name: "Science", marks: 85, total: 100 },
    ],
    issued: "2025-01-15",
  },
];

const GRADE_SCALE = [
  { grade: "A+", percentage: "90-100", color: "text-emerald-400" },
  { grade: "A", percentage: "80-89", color: "text-blue-400" },
  { grade: "B", percentage: "70-79", color: "text-amber-400" },
  { grade: "C", percentage: "60-69", color: "text-orange-400" },
  { grade: "D", percentage: "50-59", color: "text-red-400" },
];

const CUMULATIVE_PERFORMANCE = [
  { month: "October", average: 78, trend: "up" },
  { month: "November", average: 81, trend: "up" },
  { month: "December", average: 82, trend: "up" },
  { month: "January", average: 85, trend: "up" },
];

export default function StudentGradesPage() {
  const breadcrumbs = [
    { href: "/student", label: "Dashboard", current: false },
    { href: "/student/grades", label: "Grades", current: true },
  ];

  const latestReportCard = REPORT_CARDS[0]!;

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
              {latestReportCard.percentage}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Grade: {latestReportCard.grade}
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
            <div className="text-2xl font-bold text-foreground">85%</div>
            <p className="mt-1 text-xs text-blue-400">
              +3% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Best Subject
            </CardTitle>
            <Award className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Science
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              92% average score
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
              {REPORT_CARDS.map((reportCard, index) => (
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
                              {reportCard.exam}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Issued: {reportCard.issued}
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

                        {/* Overall Score */}
                        <div className="border-t border-border pt-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Overall Score
                            </span>
                            <span className="font-medium text-foreground">
                              {reportCard.obtainedMarks}/{reportCard.totalMarks}
                            </span>
                          </div>
                          <Progress
                            value={reportCard.percentage}
                            className="h-2 bg-muted"
                          />
                        </div>

                        {/* Subject-wise Breakdown */}
                        <div className="space-y-3 border-t border-border pt-4">
                          <p className="text-sm font-semibold text-foreground">
                            Subject-wise Performance
                          </p>
                          {reportCard.subjects.map((subject) => (
                            <div
                              key={subject.name}
                              className="rounded-lg bg-black/20 p-3"
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm text-foreground">
                                  {subject.name}
                                </span>
                                <span className="font-semibold text-emerald-400">
                                  {subject.marks}/{subject.total}
                                </span>
                              </div>
                              <Progress
                                value={(subject.marks / subject.total) * 100}
                                className="h-1.5 bg-white/10"
                              />
                            </div>
                          ))}
                        </div>

                        <Button variant="outline" className="w-full gap-2">
                          <FileText className="h-4 w-4" /> Download Report Card
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Your academic progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CUMULATIVE_PERFORMANCE.map((item, index) => (
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
                </div>

                <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-sm font-medium text-emerald-200">
                    Positive Trend
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/70">
                    Your performance has been improving consistently. Keep up
                    the good work!
                  </p>
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
