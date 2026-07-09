"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Loader2, Receipt, AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentFeesPage() {
  const { data: session } = useSession();
  const breadcrumbs = [
    { href: "/student", label: "Dashboard" },
    { href: "/student/fees", label: "Fees", current: true },
  ];

  const { data: profile, isLoading: isProfileLoading } =
    api.student.getProfileByUserId.useQuery(undefined, {
      enabled: !!session?.user,
    });

  const studentId = profile?.studentId ?? "";

  const { data: feeData, isLoading: isFeeLoading } =
    api.fee.getStudentFees.useQuery(
      { studentId },
      { enabled: !!studentId }
    );

  const getMonthName = (monthNum: number) => {
    return new Date(0, monthNum - 1).toLocaleString("default", { month: "long" });
  };

  if (isProfileLoading || isFeeLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <PageHeader breadcrumbs={breadcrumbs} />
        <Card className="mt-6 border-red-500/20 bg-red-500/5">
          <CardContent className="flex items-center gap-3 p-6 text-red-200">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>Student profile not found. Please contact administration.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ledger = feeData?.ledger ?? [];

  return (
    <div className="w-full space-y-8 p-6 font-sans">
      <PageHeader breadcrumbs={breadcrumbs} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Fee Ledger</h1>
          <p className="text-muted-foreground">
            View your fee status, payment history, and outstanding balances
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-emerald-500/10 bg-emerald-500/5 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Total Paid</CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                Rs.{" "}
                {ledger
                  .reduce((acc, curr) => acc + curr.paidAmount, 0)
                  .toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-amber-500/10 bg-amber-500/5 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Outstanding Balance</CardDescription>
              <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                Rs.{" "}
                {ledger
                  .reduce((acc, curr) => acc + curr.outstanding, 0)
                  .toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-blue-500/10 bg-blue-500/5 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription>Current Status</CardDescription>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                {ledger.some((f) => f.outstanding > 0) ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <span className="text-lg">Dues Pending</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="text-lg">Up to Date</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Ledger Table */}
        <Card className="border-emerald-500/20 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Payment History</CardTitle>
              <CardDescription>
                Detailed month-by-month record of your fee payments
              </CardDescription>
            </div>
            <Receipt className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {ledger.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Receipt className="mb-4 h-10 w-10 text-slate-400" />
                <p>No fee records found for the current session.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Billing Period</TableHead>
                      <TableHead>Base Fee</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Late Fee</TableHead>
                      <TableHead>Total Due</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.map((record) => (
                      <TableRow key={record.sfcId}>
                        <TableCell className="font-medium">
                          {getMonthName(record.month)} {record.year}
                        </TableCell>
                        <TableCell>Rs. {record.baseFee.toLocaleString()}</TableCell>
                        <TableCell>
                          Rs. {record.discountAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>Rs. {record.lateFee.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                          Rs. {record.totalDue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-emerald-600 dark:text-emerald-400">
                          Rs. {record.paidAmount.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={
                            record.outstanding > 0
                              ? "font-semibold text-amber-600 dark:text-amber-400"
                              : "text-slate-500"
                          }
                        >
                          Rs. {record.outstanding.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            className={
                              record.isPaid
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }
                            variant="outline"
                          >
                            {record.isPaid ? "Paid" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
