"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Receipt,
  Users,
  FileText,
  Search,
  Plus,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
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
  },
  {
    title: "Pending Fees",
    value: "24",
    icon: Receipt,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    title: "New Admissions",
    value: "5",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export default function ClerkDashboard() {
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
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
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-emerald-100">
                  Quick Fee Collection
                </h3>
                <p className="text-sm text-emerald-400/70">
                  Enter admission number to process fee payment
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-emerald-400/50" />
                  <Input
                    placeholder="Admission #"
                    className="w-[200px] border-emerald-500/20 bg-black/20 pl-9 text-emerald-100 placeholder:text-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  />
                </div>
                <Button className="bg-emerald-600 text-foreground hover:bg-emerald-700">
                  Process
                </Button>
              </div>
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
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="transactions"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Receipt className="h-4 w-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <DollarSign className="h-4 w-4" /> Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest fee collections and payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-muted-foreground">
                      <tr>
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
                          <td className="p-3 font-mono text-xs">{trx.id}</td>
                          <td className="p-3 font-medium text-foreground">
                            {trx.student}
                          </td>
                          <td className="p-3 text-foreground">{trx.type}</td>
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

          <TabsContent value="expenses">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Expense Management</CardTitle>
                  <CardDescription>
                    Record and view school expenses
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
                <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                  <div className="rounded-full bg-muted p-4 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-foreground">
                    No expenses recorded today
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Use the &quot;Add Expense&quot; button to record new
                    expenditures for the school account.
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
