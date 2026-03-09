"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  FileText,
  Filter,
  Download,
  TrendingUp,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

const CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

const FEE_SUMMARY = [
  { class: "Class 1", total: 150000, collected: 135000, pending: 15000 },
  { class: "Class 2", total: 180000, collected: 175000, pending: 5000 },
  { class: "Class 3", total: 200000, collected: 180000, pending: 20000 },
  { class: "Class 4", total: 220000, collected: 210000, pending: 10000 },
  { class: "Class 5", total: 250000, collected: 220000, pending: 30000 },
];

const DEFAULTERS = [
  { admissionNo: "ADM-001", name: "Ali Khan", class: "Class 1", pending: 15000 },
  { admissionNo: "ADM-025", name: "Sara Ahmed", class: "Class 3", pending: 20000 },
  { admissionNo: "ADM-042", name: "Bilal Raza", class: "Class 5", pending: 30000 },
];

export default function ClerkFeeReportPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("1");

  const breadcrumbs = [
    { href: "/clerk", label: "Dashboard", current: false },
    { href: "/clerk/revenue", label: "Revenue", current: false },
    { href: "/clerk/revenue/fee", label: "Fee Reports", current: true },
  ];

  const totalCollected = FEE_SUMMARY.reduce((sum, item) => sum + item.collected, 0);
  const totalPending = FEE_SUMMARY.reduce((sum, item) => sum + item.pending, 0);
  const totalExpected = FEE_SUMMARY.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {totalExpected.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {FEE_SUMMARY.length} classes
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              Rs. {totalCollected.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {Math.round((totalCollected / totalExpected) * 100)}% collected
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
              Rs. {totalPending.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {Math.round((totalPending / totalExpected) * 100)}% pending
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
              <DollarSign className="h-4 w-4" /> Fee Summary
            </TabsTrigger>
            <TabsTrigger
              value="defaulters"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <AlertCircle className="h-4 w-4" /> Defaulters
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <FileText className="h-4 w-4" /> Monthly Reports
            </TabsTrigger>
          </TabsList>

          {/* Fee Summary Tab */}
          <TabsContent value="summary">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Class-wise Fee Summary</CardTitle>
                  <CardDescription>
                    Fee collection status by class
                  </CardDescription>
                </div>
                <Select value={selectedClass || ""} onValueChange={(v) => setSelectedClass(v || null)}>
                  <SelectTrigger className="w-[150px] border-slate-200 dark:border-border">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Classes</SelectItem>
                    {CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {FEE_SUMMARY.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border bg-black/20 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold text-foreground">
                          {item.class}
                        </h4>
                        <span className="text-sm font-medium text-muted-foreground">
                          {Math.round((item.collected / item.total) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium text-foreground">
                            Rs. {item.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                            style={{
                              width: `${(item.collected / item.total) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-400">
                            Collected: Rs. {item.collected.toLocaleString()}
                          </span>
                          <span className="text-amber-400">
                            Pending: Rs. {item.pending.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Defaulters Tab */}
          <TabsContent value="defaulters">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader>
                <CardTitle>Fee Defaulters</CardTitle>
                <CardDescription>
                  Students with outstanding fee balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6 border-amber-500/20 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-200">
                    {DEFAULTERS.length} students have pending fees
                  </AlertTitle>
                  <AlertDescription className="text-amber-100/70">
                    Total pending amount: Rs.{" "}
                    {DEFAULTERS.reduce((sum, d) => sum + d.pending, 0).toLocaleString()}
                  </AlertDescription>
                </Alert>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-white/5">
                      <tr>
                        <th className="p-3 font-medium">Admission No.</th>
                        <th className="p-3 font-medium">Student Name</th>
                        <th className="p-3 font-medium">Class</th>
                        <th className="p-3 font-medium">Pending Amount</th>
                        <th className="p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {DEFAULTERS.map((student) => (
                        <tr
                          key={student.admissionNo}
                          className="transition-colors hover:bg-white/5"
                        >
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {student.admissionNo}
                          </td>
                          <td className="p-3 font-medium text-foreground">
                            {student.name}
                          </td>
                          <td className="p-3">{student.class}</td>
                          <td className="p-3 font-medium text-amber-400">
                            Rs. {student.pending.toLocaleString()}
                          </td>
                          <td className="p-3">
                            <Button variant="outline" size="sm">
                              Send Reminder
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Monthly Fee Reports</CardTitle>
                  <CardDescription>
                    Generate and download fee reports for specific months
                  </CardDescription>
                </div>
                <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                  <Download className="h-4 w-4" /> Export PDF
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Month
                    </label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="border-slate-200 dark:border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                        ].map((month, index) => (
                          <SelectItem key={index} value={String(index + 1)}>
                            {month} 2025
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-black/20 p-4">
                    <h4 className="mb-2 font-semibold text-foreground">
                      January 2025 Report
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Expected:
                        </span>
                        <span className="font-medium text-foreground">
                          Rs. {totalExpected.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Collected:
                        </span>
                        <span className="font-medium text-emerald-400">
                          Rs. {totalCollected.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-muted-foreground">
                          Pending Amount:
                        </span>
                        <span className="font-medium text-amber-400">
                          Rs. {totalPending.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="h-4 w-4" /> View Detailed Report
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
