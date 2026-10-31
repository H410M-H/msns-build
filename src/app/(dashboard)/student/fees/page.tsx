"use client";

import { useState } from "react";
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
import { Button } from "~/components/ui/button";
import { Loader2, Receipt, AlertCircle, CheckCircle2, Printer } from "lucide-react";
import { VoucherPrintSheet } from "~/components/forms/fee/VoucherPrintSheet";

export default function StudentFeesPage() {
  const { data: session } = useSession();
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);

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

  const { data: voucherPrintData, isLoading: isVoucherPrintLoading } =
    api.voucher.getVoucherPrintData.useQuery(
      { sfcId: selectedVoucherId! },
      { enabled: !!selectedVoucherId }
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
        {/* PageHeader in layout */}
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
  const activeUnpaidVoucher = ledger.find((f) => f.outstanding > 0) ?? ledger[0];

  return (
    <div className="w-full space-y-8 p-6 font-sans">
      {/* PageHeader in layout */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Fee Ledger</h1>
            <p className="text-muted-foreground">
              View your fee status, payment history, and download printable fee challans
            </p>
          </div>
          {activeUnpaidVoucher && (
            <Button
              onClick={() => setSelectedVoucherId(activeUnpaidVoucher.sfcId)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Download Active Challan ({getMonthName(activeUnpaidVoucher.month)})</span>
            </Button>
          )}
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
                Detailed month-by-month record of your fee payments and challan copies
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
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
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
                        <TableCell className="text-center">
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
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVoucherId(record.sfcId)}
                            className="h-8 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Challan</span>
                          </Button>
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

      {/* Printable Challan Modal / Overlay */}
      {selectedVoucherId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs print:static print:bg-white print:overflow-visible">
          {isVoucherPrintLoading ? (
            <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          ) : voucherPrintData ? (
            <VoucherPrintSheet
              vouchers={[voucherPrintData as any]}
              onClose={() => setSelectedVoucherId(null)}
              title={`Fee Challan — ${(voucherPrintData as any)?.voucherNumber || "Print Preview"}`}
            />
          ) : (
            <div className="flex h-screen flex-col items-center justify-center p-6 text-white">
              <p className="mb-4">Failed to load fee challan data.</p>
              <Button variant="secondary" onClick={() => setSelectedVoucherId(null)}>
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
