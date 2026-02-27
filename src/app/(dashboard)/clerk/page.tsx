"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Receipt,
  Users,
  FileText,
  Search,
  Plus,
  TrendingUp,
  AlertCircle,
  Zap,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const ExpensesTable = lazy(() => import("~/components/tables/ExpensesTable"));

// Mock Data
const RECENT_TRANSACTIONS = [
  {
    id: "TRX-001",
    student: "Ali Khan",
    amount: 5000,
    type: "Tuition Fee",
    date: "Today, 10:30 AM",
    status: "Paid",
  },
  {
    id: "TRX-002",
    student: "Sara Ahmed",
    amount: 500,
    type: "Exam Fund",
    date: "Today, 11:15 AM",
    status: "Paid",
  },
  {
    id: "TRX-003",
    student: "Bilal Raza",
    amount: 5000,
    type: "Tuition Fee",
    date: "Yesterday",
    status: "Paid",
  },
];

const CLERK_STATS = [
  {
    title: "Daily Collection",
    value: "Rs. 45,500",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    trend: "+12%",
  },
  {
    title: "Pending Fees",
    value: "24",
    icon: Receipt,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    trend: "-5%",
  },
  {
    title: "New Admissions",
    value: "5",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    trend: "+2",
  },
];

export default function ClerkDashboard() {
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-8"
        >
          <WelcomeSection />

          {/* Quick Action: Fee Collection */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Zap className="h-4 w-4 text-emerald-500" />
                Quick Fee Collection
              </CardTitle>
              <CardDescription>
                Enter admission number to process fee payment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-emerald-400/50" />
                <Input
                  placeholder="Admission #"
                  className="border-emerald-500/20 bg-black/20 pl-9 text-emerald-100 placeholder:text-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
              <Button className="bg-emerald-600 text-foreground hover:bg-emerald-700">
                Process Payment
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <div className="h-full w-full">
            <ProfileSection />
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {CLERK_STATS.map((stat, i) => {
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

      {/* Main Content Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="transactions" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-4 py-4 sm:px-6 sm:flex-row">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Finance Dashboard
            </h2>
            <TabsList className="border border-border bg-card p-1">
              <TabsTrigger
                value="transactions"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Transactions</span>
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Expenses</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="transactions" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Monthly Collection Target
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">Collected</span>
                        <span className="font-medium text-emerald-400">
                          Rs. 2.45M / Rs. 3M
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: "82%" }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-white/50 shadow-sm dark:border-border dark:bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Default Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded border border-red-500/20 bg-red-500/10 p-2 text-center">
                        <p className="text-sm font-bold text-red-400">24</p>
                        <p className="text-xs text-muted-foreground">
                          Defaulters
                        </p>
                      </div>
                      <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2 text-center">
                        <p className="text-sm font-bold text-amber-400">
                          Rs. 1.2M
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Outstanding
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Latest fee collections and payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-muted-foreground">
                        <tr className="border-b border-border">
                          <th className="p-3 font-medium">Transaction ID</th>
                          <th className="p-3 font-medium">Student</th>
                          <th className="p-3 font-medium">Type</th>
                          <th className="p-3 font-medium">Amount</th>
                          <th className="p-3 font-medium">Date</th>
                          <th className="p-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {RECENT_TRANSACTIONS.map((trx, i) => (
                          <tr
                            key={i}
                            className="transition-colors hover:bg-white/5"
                          >
                            <td className="p-3 font-mono text-xs">
                              {trx.id}
                            </td>
                            <td className="p-3 font-medium text-foreground">
                              {trx.student}
                            </td>
                            <td className="p-3 text-foreground">
                              {trx.type}
                            </td>
                            <td className="p-3 font-medium text-emerald-400">
                              Rs. {trx.amount.toLocaleString()}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {trx.date}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                                {trx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Expense Management</CardTitle>
                    <CardDescription>
                      Record and manage school expenditures
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" /> Add Expense
                  </Button>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                    }
                  >
                    <ExpensesTable />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
