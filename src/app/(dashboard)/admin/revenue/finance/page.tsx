"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const FINANCIAL_SUMMARY = {
  totalRevenue: 1250000,
  totalExpenses: 875000,
  netProfit: 375000,
  currentSession: "2024-2025",
};

const MONTHLY_DATA = [
  {
    month: "January",
    revenue: 450000,
    expenses: 320000,
    profit: 130000,
  },
  {
    month: "February",
    revenue: 425000,
    expenses: 290000,
    profit: 135000,
  },
  {
    month: "March",
    revenue: 375000,
    expenses: 265000,
    profit: 110000,
  },
];

const EXPENSE_BREAKDOWN = [
  { category: "SALARIES", amount: 450000, percentage: 51 },
  { category: "UTILITIES", amount: 150000, percentage: 17 },
  { category: "MAINTENANCE", amount: 120000, percentage: 14 },
  { category: "SUPPLIES", amount: 80000, percentage: 9 },
  { category: "OTHER", amount: 75000, percentage: 9 },
];

const REVENUE_BREAKDOWN = [
  { source: "Tuition Fees", amount: 850000, percentage: 68 },
  { source: "Exam Fund", amount: 200000, percentage: 16 },
  { source: "Lab Fees", amount: 150000, percentage: 12 },
  { source: "ID Card & Others", amount: 50000, percentage: 4 },
];

export default function AdminFinancePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard", current: false },
    { href: "/admin/revenue", label: "Revenue", current: false },
    { href: "/admin/revenue/finance", label: "Finance Dashboard", current: true },
  ];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Main Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {FINANCIAL_SUMMARY.totalRevenue.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-emerald-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {FINANCIAL_SUMMARY.totalExpenses.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-red-400">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {FINANCIAL_SUMMARY.netProfit.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-blue-400">30% profit margin</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {FINANCIAL_SUMMARY.currentSession}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Current academic session
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
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="summary"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <BarChart3 className="h-4 w-4" /> Summary
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" /> Revenue
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <TrendingDown className="h-4 w-4" /> Expenses
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Monthly Financial Summary</CardTitle>
                <CardDescription>
                  Revenue, expenses, and profit by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MONTHLY_DATA.map((month, index) => {
                    const maxAmount = Math.max(
                      ...MONTHLY_DATA.map((m) => m.revenue)
                    );

                    return (
                      <div
                        key={index}
                        className="rounded-lg border border-border bg-black/20 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {month.month}
                          </h4>
                          <span className="text-sm font-medium text-emerald-400">
                            Profit: Rs.{" "}
                            {month.profit.toLocaleString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Revenue
                            </p>
                            <p className="mt-1 text-lg font-bold text-emerald-400">
                              Rs. {month.revenue.toLocaleString()}
                            </p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                style={{
                                  width: `${(month.revenue / maxAmount) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Expenses
                            </p>
                            <p className="mt-1 text-lg font-bold text-red-400">
                              Rs. {month.expenses.toLocaleString()}
                            </p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                                style={{
                                  width: `${(month.expenses / month.revenue) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Margin %
                            </p>
                            <p className="mt-1 text-lg font-bold text-blue-400">
                              {Math.round((month.profit / month.revenue) * 100)}%
                            </p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                style={{
                                  width: `${(month.profit / month.revenue) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button variant="outline" className="mt-6 w-full">
                  View Detailed Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue sources and distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {REVENUE_BREAKDOWN.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-black/20 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        {item.source}
                      </h4>
                      <span className="text-sm font-medium text-emerald-400">
                        {item.percentage}%
                      </span>
                    </div>
                    <p className="mb-2 text-lg font-bold text-foreground">
                      Rs. {item.amount.toLocaleString()}
                    </p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="mt-6 w-full gap-2">
                  <FileText className="h-4 w-4" /> Export Revenue Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Expenses by category and percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {EXPENSE_BREAKDOWN.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-black/20 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">
                        {item.category}
                      </h4>
                      <span className="text-sm font-medium text-red-400">
                        {item.percentage}%
                      </span>
                    </div>
                    <p className="mb-2 text-lg font-bold text-foreground">
                      Rs. {item.amount.toLocaleString()}
                    </p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="mt-6 w-full gap-2">
                  <FileText className="h-4 w-4" /> Export Expense Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
