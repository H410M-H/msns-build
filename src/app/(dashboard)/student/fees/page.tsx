"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const STUDENT_FEES = {
  total: 50000,
  paid: 35000,
  pending: 15000,
  components: [
    { name: "Tuition Fee", amount: 30000, paid: 20000, dueDate: "2025-02-15" },
    { name: "Exam Fund", amount: 5000, paid: 5000, dueDate: "2025-01-31" },
    { name: "Computer Lab", amount: 8000, paid: 5000, dueDate: "2025-02-28" },
    { name: "Student ID Card", amount: 500, paid: 500, dueDate: "2025-01-15" },
    { name: "Info & Calls", amount: 500, paid: 500, dueDate: "2025-01-15" },
  ],
};

const PAYMENT_HISTORY = [
  {
    id: "PAY-001",
    component: "Exam Fund",
    amount: 5000,
    date: "2025-01-20",
    status: "Completed",
  },
  {
    id: "PAY-002",
    component: "Student ID Card",
    amount: 500,
    date: "2025-01-15",
    status: "Completed",
  },
  {
    id: "PAY-003",
    component: "Info & Calls",
    amount: 500,
    date: "2025-01-10",
    status: "Completed",
  },
  {
    id: "PAY-004",
    component: "Tuition Fee",
    amount: 20000,
    date: "2025-01-05",
    status: "Completed",
  },
];

export default function StudentFeesPage() {
  const breadcrumbs = [
    { href: "/student", label: "Dashboard", current: false },
    { href: "/student/fees", label: "Fee Status", current: true },
  ];

  const completionPercentage = (STUDENT_FEES.paid / STUDENT_FEES.total) * 100;

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Alert className="border-emerald-500/20 bg-emerald-500/10">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <AlertTitle className="text-emerald-200">Fee Status</AlertTitle>
          <AlertDescription className="text-emerald-100/70">
            You have paid Rs. {STUDENT_FEES.paid.toLocaleString()} out of Rs.{" "}
            {STUDENT_FEES.total.toLocaleString()} ({completionPercentage.toFixed(0)}%)
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                Rs. {STUDENT_FEES.total.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Total fees for this session
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                Rs. {STUDENT_FEES.paid.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {completionPercentage.toFixed(0)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                Rs. {STUDENT_FEES.pending.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {((STUDENT_FEES.pending / STUDENT_FEES.total) * 100).toFixed(0)}% outstanding
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="components" className="w-full">
          <TabsList className="mb-6 border border-border bg-card p-1">
            <TabsTrigger
              value="components"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <DollarSign className="h-4 w-4" /> Fee Components
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <FileText className="h-4 w-4" /> Payment History
            </TabsTrigger>
          </TabsList>

          {/* Fee Components Tab */}
          <TabsContent value="components">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Fee Components Breakdown</CardTitle>
                <CardDescription>
                  Detailed breakdown of all fee components and their payment status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {STUDENT_FEES.components.map((component, index) => {
                  const paid = component.paid;
                  const remaining = component.amount - component.paid;
                  const percentage = (paid / component.amount) * 100;

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-black/20 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-foreground">
                            {component.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Due by: {component.dueDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            Rs. {component.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total Amount
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400">
                            Paid: Rs. {paid.toLocaleString()}
                          </span>
                          {remaining > 0 && (
                            <span className="text-amber-400">
                              Remaining: Rs. {remaining.toLocaleString()}
                            </span>
                          )}
                          {remaining === 0 && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="h-3 w-3" /> Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  All your previous fee payments and transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PAYMENT_HISTORY.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-black/20 p-4 transition-colors hover:bg-black/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {payment.component}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {payment.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-400">
                          +Rs. {payment.amount.toLocaleString()}
                        </p>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="mt-6 w-full gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                  <FileText className="h-4 w-4" /> Download Receipt
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
