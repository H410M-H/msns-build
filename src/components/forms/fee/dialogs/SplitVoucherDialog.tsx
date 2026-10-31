"use client";

import React, { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { toast } from "sonner";
import {
  Loader2,
  Split,
  Undo2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calendar,
} from "lucide-react";
import { format, addDays } from "date-fns";

export interface SplitVoucherItem {
  sfcId: string;
  voucherNumber: string;
  studentName?: string;
  registrationNumber?: string;
  className?: string;
  netPayable: number;
  amountPaid: number;
  paymentStatus: string;
  isSplitLocked?: boolean;
  dueDate?: Date | string | null;
  subInstallments?: Array<{
    sfcId: string;
    voucherNumber: string;
    subInstallmentIndex: number;
    amountPaid: number;
    paymentStatus: string;
    dueDate?: Date | string | null;
    adjustmentAmount?: number;
  }>;
}

export interface SplitVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: SplitVoucherItem | null;
  onSuccess?: () => void;
}

export function SplitVoucherDialog({
  open,
  onOpenChange,
  voucher,
  onSuccess,
}: SplitVoucherDialogProps) {
  const [splitsCount, setSplitsCount] = useState<number>(2);
  const [dueDates, setDueDates] = useState<string[]>([]);

  const utils = api.useUtils();

  // Reset/Initialize custom due dates when voucher or splitsCount changes
  useEffect(() => {
    if (!voucher) return;
    const baseDate = voucher.dueDate ? new Date(voucher.dueDate) : new Date();
    const newDates: string[] = [];
    for (let i = 0; i < splitsCount; i++) {
      // Offset each installment by 15 days
      const date = addDays(baseDate, i * 15);
      newDates.push(format(date, "yyyy-MM-dd"));
    }
    setDueDates(newDates);
  }, [voucher, splitsCount]);

  const splitMutation = api.voucher.splitInstallment.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Voucher split successfully into ${data.splitsCount} sub-installments.`
      );
      void utils.voucher.getVouchers.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to split voucher.");
    },
  });

  const revertMutation = api.voucher.revertSplit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Sub-installments reverted and parent unlocked.");
      void utils.voucher.getVouchers.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to revert voucher split.");
    },
  });

  if (!voucher) return null;

  const totalPayable = voucher.netPayable;
  const isSplitLocked = !!voucher.isSplitLocked;
  const subInstallments = voucher.subInstallments ?? [];

  // Check whether any child has received payments
  const hasChildPayments = subInstallments.some(
    (s) => s.amountPaid > 0 || s.paymentStatus !== "PENDING"
  );

  // Compute breakdown for preview
  const partAmount = Math.floor(totalPayable / splitsCount);
  const remainder = totalPayable - partAmount * (splitsCount - 1);

  const previewParts = Array.from({ length: splitsCount }, (_, idx) => {
    const isLast = idx === splitsCount - 1;
    const amount = isLast ? remainder : partAmount;
    return {
      partIndex: idx + 1,
      voucherNumber: `${voucher.voucherNumber}-S${idx + 1}`,
      amount,
      dueDate: dueDates[idx] || "",
    };
  });

  const handleSplitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customDates = dueDates.map((d) => (d ? new Date(d) : new Date()));
    splitMutation.mutate({
      voucherId: voucher.sfcId,
      numberOfSplits: splitsCount,
      customDueDates: customDates,
    });
  };

  const handleRevert = () => {
    revertMutation.mutate({
      voucherId: voucher.sfcId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Split className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {isSplitLocked ? "Manage Sub-Installments" : "Split Voucher into Installments"}
          </DialogTitle>
          <DialogDescription>
            {isSplitLocked
              ? "View active sub-installments or revert the split back to the original voucher."
              : "Divide the total payable amount into multiple child installments with customized due dates."}
          </DialogDescription>
        </DialogHeader>

        {/* Voucher Header Info Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-border dark:bg-card/50">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Voucher #:</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {voucher.voucherNumber}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Student:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {voucher.studentName || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Payable:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                Rs. {totalPayable.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div>
                <Badge
                  variant={isSplitLocked ? "secondary" : "outline"}
                  className="text-[10px] uppercase font-bold"
                >
                  {isSplitLocked ? "SPLIT LOCKED" : voucher.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Mode 1: Already Split - Show sub-installments and Revert Option */}
        {isSplitLocked ? (
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Parent Voucher is Locked</p>
                  <p className="text-muted-foreground">
                    This voucher has been partitioned into sub-installments. Payments are recorded directly against individual child vouchers.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Active Sub-Installments</Label>
              <div className="rounded-md border border-slate-200 overflow-hidden dark:border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-card">
                      <TableHead className="text-xs">Part #</TableHead>
                      <TableHead className="text-xs">Voucher No</TableHead>
                      <TableHead className="text-xs">Due Date</TableHead>
                      <TableHead className="text-xs">Paid</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subInstallments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-4">
                          No sub-installment records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      subInstallments.map((sub) => (
                        <TableRow key={sub.sfcId}>
                          <TableCell className="text-xs font-medium">Part {sub.subInstallmentIndex}</TableCell>
                          <TableCell className="text-xs font-mono">{sub.voucherNumber}</TableCell>
                          <TableCell className="text-xs">
                            {sub.dueDate ? format(new Date(sub.dueDate), "dd MMM yyyy") : "N/A"}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Rs. {sub.amountPaid.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            <Badge
                              variant="outline"
                              className={
                                sub.paymentStatus === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              }
                            >
                              {sub.paymentStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {hasChildPayments ? (
              <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>
                  Reverting is blocked because one or more sub-installments have already recorded payments.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                <span>
                  All child sub-installments are 100% unpaid. You may revert this split to restore the original voucher.
                </span>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={hasChildPayments || revertMutation.isPending}
                onClick={handleRevert}
                className="gap-1.5"
              >
                {revertMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Undo2 className="h-4 w-4" />
                )}
                Revert Split
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Mode 2: Unsplit Voucher - Configure and Execute Split */
          <form onSubmit={handleSplitSubmit} className="space-y-4 py-2">
            {voucher.amountPaid > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>
                  Partially paid vouchers cannot be split. Only 100% unpaid vouchers can be partitioned into sub-installments.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Number of Splits (2 to 4 Installments)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={splitsCount === n ? "default" : "outline"}
                    className={
                      splitsCount === n
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        : ""
                    }
                    onClick={() => setSplitsCount(n)}
                  >
                    {n} Splits ({Math.round(100 / n)}% each)
                  </Button>
                ))}
              </div>
            </div>

            {/* Live Calculation & Custom Due Dates Table */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Sub-Installment Breakdown & Due Dates</Label>
              <div className="rounded-md border border-slate-200 overflow-hidden dark:border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-card">
                      <TableHead className="text-xs">Part</TableHead>
                      <TableHead className="text-xs">Sub-Voucher #</TableHead>
                      <TableHead className="text-xs">Payable Amount</TableHead>
                      <TableHead className="text-xs">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewParts.map((part, idx) => (
                      <TableRow key={part.partIndex}>
                        <TableCell className="text-xs font-medium">Part {part.partIndex}</TableCell>
                        <TableCell className="text-xs font-mono">{part.voucherNumber}</TableCell>
                        <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Rs. {part.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Input
                            type="date"
                            value={dueDates[idx] || ""}
                            onChange={(e) => {
                              const updated = [...dueDates];
                              updated[idx] = e.target.value;
                              setDueDates(updated);
                            }}
                            className="h-8 text-xs w-36"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-muted-foreground dark:border-border dark:bg-card">
              <p>
                <strong>Security Guardrail:</strong> Once split, the parent voucher is locked.
                Reverting is permitted if and only if <em>zero rupees</em> have been collected on all child sub-installments.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={splitMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  splitMutation.isPending ||
                  voucher.amountPaid > 0 ||
                  voucher.paymentStatus === "PAID"
                }
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {splitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    <Split className="h-4 w-4" />
                    Confirm Split into {splitsCount} Parts
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
