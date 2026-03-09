"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calendar, FileText } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

const REVENUE_STATS = [
  {
    title: "Total Collected Today",
    value: "Rs. 145,500",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "This Month",
    value: "Rs. 1,250,000",
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Pending Collection",
    value: "Rs. 385,000",
    icon: Calendar,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export default function ClerkRevenuePages() {
  const breadcrumbs = [
    { href: "/clerk", label: "Dashboard", current: false },
    { href: "/clerk/revenue", label: "Revenue", current: true },
  ];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {REVENUE_STATS.map((stat, i) => {
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
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="fees" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="fees"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <DollarSign className="h-4 w-4" /> Fee Collection
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <FileText className="h-4 w-4" /> Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fees">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fee Collections</CardTitle>
                  <CardDescription>
                    View and manage fee collections by class and student
                  </CardDescription>
                </div>
                <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                  <DollarSign className="h-4 w-4" /> Record Payment
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                  <div className="rounded-full bg-muted p-4 text-muted-foreground">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-foreground">
                    No fee data available
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Fee collection data will be displayed once students are enrolled and fee structures are assigned.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Reports</CardTitle>
                  <CardDescription>
                    Generate and view revenue reports for different periods
                  </CardDescription>
                </div>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" /> Generate Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                  <div className="rounded-full bg-muted p-4 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-foreground">
                    No reports available
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Generated reports will appear here. Click the Generate Report button to create a new report.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
