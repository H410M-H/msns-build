"use client";

import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  BookOpen,
  DollarSign,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const PRINCIPAL_STATS = [
  {
    title: "Total Students",
    value: "324",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    trend: "+5% this month",
  },
  {
    title: "Total Staff",
    value: "32",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    trend: "+1 new hire",
  },
  {
    title: "Classes",
    value: "12",
    icon: BookOpen,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    trend: "All active",
  },
  {
    title: "Monthly Revenue",
    value: "Rs. 450K",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    trend: "+12% growth",
  },
];

const PERFORMANCE_METRICS = [
  { name: "Attendance Rate", value: 85, target: 90 },
  { name: "Fee Collection", value: 78, target: 95 },
  { name: "Academic Performance", value: 82, target: 85 },
  { name: "Student Satisfaction", value: 88, target: 85 },
];

const RECENT_ALERTS = [
  {
    type: "warning",
    title: "Low Attendance",
    message: "Class 3 has attendance below 75% for the week",
  },
  {
    type: "info",
    title: "Fee Collection",
    message: "5 students have pending fee payments over 30 days",
  },
  {
    type: "success",
    title: "Exam Results",
    message: "2024 Final exams have been completed successfully",
  },
];

export default function PrincipalDashboardPage() {
  const breadcrumbs = [
    { href: "/principal", label: "Dashboard", current: true },
  ];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {PRINCIPAL_STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="performance"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <BarChart3 className="h-4 w-4" /> Performance
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <AlertCircle className="h-4 w-4" /> Alerts
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" /> Reports
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key institutional performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {PERFORMANCE_METRICS.map((metric, index) => {
                    const isBelow = metric.value < metric.target;
                    const color = isBelow ? "text-amber-400" : "text-emerald-400";

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {metric.name}
                          </span>
                          <span className={`font-semibold ${color}`}>
                            {metric.value}% / {metric.target}%
                          </span>
                        </div>
                        <Progress
                          value={metric.value}
                          className="h-2 bg-muted"
                        />
                        {isBelow && (
                          <p className="text-xs text-amber-400">
                            Below target - {metric.target - metric.value}%
                            improvement needed
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button className="mt-6 w-full gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                  <BarChart3 className="h-4 w-4" /> View Detailed Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>
                  Recent notifications and action items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {RECENT_ALERTS.map((alert, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 ${
                        alert.type === "warning"
                          ? "border-amber-500/20 bg-amber-500/10"
                          : alert.type === "info"
                            ? "border-blue-500/20 bg-blue-500/10"
                            : "border-emerald-500/20 bg-emerald-500/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-2 w-2 rounded-full ${
                            alert.type === "warning"
                              ? "bg-amber-500"
                              : alert.type === "info"
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {alert.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="mt-6 w-full">
                  View All Alerts
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>
                  Generate and view comprehensive institutional reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" className="h-16 flex-col items-start justify-center gap-1 p-4">
                    <span className="text-sm font-semibold">
                      Student Report
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Enrollment and progress
                    </span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col items-start justify-center gap-1 p-4">
                    <span className="text-sm font-semibold">
                      Financial Report
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Revenue and expenses
                    </span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col items-start justify-center gap-1 p-4">
                    <span className="text-sm font-semibold">
                      Attendance Report
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Student and staff
                    </span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col items-start justify-center gap-1 p-4">
                    <span className="text-sm font-semibold">
                      Academic Report
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Exam results and grades
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
