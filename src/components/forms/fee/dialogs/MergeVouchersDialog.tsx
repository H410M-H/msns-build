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
import { Checkbox } from "~/components/ui/checkbox";
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
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { format } from "date-fns";

export interface MergeVoucherItem {
  sfcId: string;
  voucherNumber: string;
  studentClassId: string;
  studentName?: string;
  registrationNumber?: string;
  className?: string;
  month: number;
  year: number;
  installmentNo?: number;
  netPayable: number;
  amountPaid: number;
  paymentStatus: string;
  isSplitLocked?: boolean;
  dueDate?: Date | string | null;
}

export interface MergeVouchersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vouchers: MergeVoucherItem[];
  onSuccess?: () => void;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function MergeVouchersDialog({
  open,
  onOpenChange,
  vouchers,
  onSuccess,
}: MergeVouchersDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [masterDueDate, setMasterDueDate] = useState<string>("");

  const utils = api.useUtils();

  // Reset selected IDs to all passed vouchers on open
  useEffect(() => {
    if (vouchers && vouchers.length > 0) {
      setSelectedIds(new Set(vouchers.map((v) => v.sfcId)));

      // Find latest due date among constituent vouchers
      let latest: Date | null = null;
      for (const v of vouchers) {
        if (v.dueDate) {
          const d = new Date(v.dueDate);
          if (!latest || d.getTime() > latest.getTime()) {
            latest = d;
          }
        }
      }
      setMasterDueDate(format(latest ?? new Date(), "yyyy-MM-dd"));
    } else {
      setSelectedIds(new Set());
    }
  }, [vouchers]);

  const mergeMutation = api.voucher.mergeVouchers.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Merged ${data.mergedVoucherCount} vouchers into consolidated challan #${data.masterVoucher.voucherNumber}.`
      );
      void utils.voucher.getVouchers.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to merge vouchers.");
    },
  });

  if (!vouchers || vouchers.length === 0) return null;

  // Check if multiple students are present
  const studentClassIds = new Set(vouchers.map((v) => v.studentClassId));
  const hasMultipleStudents = studentClassIds.size > 1;

  const firstVoucher = vouchers[0]!;
  const selectedList = vouchers.filter((v) => selectedIds.has(v.sfcId));
  const totalNetPayable = selectedList.reduce((acc, curr) => acc + curr.netPayable, 0);

  // Check for any paid or split-locked voucher
  const hasInvalidVoucher = selectedList.some(
    (v) =>
      v.amountPaid > 0 ||
      v.paymentStatus === "PAID" ||
      v.isSplitLocked ||
      v.paymentStatus === "LOCKED_MERGED"
  );

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(vouchers.map((v) => v.sfcId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleMergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size < 2) {
      toast.error("Please select at least 2 vouchers to merge.");
      return;
    }
    if (hasMultipleStudents) {
      toast.error("Cannot merge vouchers belonging to different students.");
      return;
    }

    mergeMutation.mutate({
      studentClassId: firstVoucher.studentClassId,
      voucherIds: Array.from(selectedIds),
      dueDate: masterDueDate ? new Date(masterDueDate) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <GitMerge className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Consolidate / Merge Unpaid Vouchers
          </DialogTitle>
          <DialogDescription>
            Merge multi-month unpaid vouchers for a student into a single master consolidated challan.
          </DialogDescription>
        </DialogHeader>

        {/* Validation Alert for Multiple Students */}
        {hasMultipleStudents && (
          <div className="flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-bold">Multiple Students Selected</p>
              <p>You can only merge vouchers belonging to the same student class.</p>
            </div>
          </div>
        )}

        {/* Student Summary Info */}
        {!hasMultipleStudents && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-border dark:bg-card">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-muted-foreground">Student:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {firstVoucher.studentName || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Reg No / Class:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {firstVoucher.registrationNumber || "N/A"} • {firstVoucher.className || ""}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Consolidated Total:</span>
                <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                  Rs. {totalNetPayable.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vouchers Table */}
        <form onSubmit={handleMergeSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                Select Vouchers to Consolidate ({selectedIds.size} of {vouchers.length} selected)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleSelectAll(selectedIds.size !== vouchers.length)}
                >
                  {selectedIds.size === vouchers.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 max-h-56 overflow-y-auto dark:border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-card">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          selectedIds.size > 0 && selectedIds.size === vouchers.length
                            ? true
                            : selectedIds.size > 0
                            ? "indeterminate"
                            : false
                        }
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      />
                    </TableHead>
                    <TableHead className="text-xs">Voucher #</TableHead>
                    <TableHead className="text-xs">Billing Period</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs text-right">Net Payable</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((v) => {
                    const isChecked = selectedIds.has(v.sfcId);
                    const monthName = MONTH_NAMES[(v.month - 1) % 12] ?? v.month;
                    const isInvalid =
                      v.amountPaid > 0 ||
                      v.paymentStatus === "PAID" ||
                      v.isSplitLocked ||
                      v.paymentStatus === "LOCKED_MERGED";

                    return (
                      <TableRow
                        key={v.sfcId}
                        className={isInvalid ? "opacity-50" : undefined}
                      >
                        <TableCell className="w-10">
                          <Checkbox
                            checked={isChecked}
                            disabled={isInvalid}
                            onCheckedChange={() => toggleSelect(v.sfcId)}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium">
                          {v.voucherNumber}
                        </TableCell>
                        <TableCell className="text-xs">
                          {monthName} {v.year} (Inst. {v.installmentNo ?? v.month})
                        </TableCell>
                        <TableCell className="text-xs">
                          {v.dueDate ? format(new Date(v.dueDate), "dd MMM yyyy") : "N/A"}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-right text-emerald-600 dark:text-emerald-400">
                          Rs. {v.netPayable.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <Badge
                            variant="outline"
                            className={
                              v.paymentStatus === "PAID"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-500/10 text-amber-600"
                            }
                          >
                            {v.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Master Due Date */}
          <div className="space-y-1.5">
            <Label htmlFor="master-due-date" className="text-xs font-semibold">
              Consolidated Challan Due Date
            </Label>
            <Input
              id="master-due-date"
              type="date"
              value={masterDueDate}
              onChange={(e) => setMasterDueDate(e.target.value)}
              className="h-9 w-full sm:w-48"
            />
          </div>

          {/* Notice info */}
          <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-muted-foreground dark:border-border dark:bg-card">
            <Layers className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>
              <strong>Consolidation Rule:</strong> The constituent vouchers will be locked as{" "}
              <code>LOCKED_MERGED</code>. A master <code>FULL_YEAR_MERGED</code> challan will be created.
              When the master challan is paid, settlement automatically cascades to all merged vouchers.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mergeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                mergeMutation.isPending ||
                hasMultipleStudents ||
                selectedIds.size < 2 ||
                hasInvalidVoucher
              }
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {mergeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Merging Vouchers...
                </>
              ) : (
                <>
                  <GitMerge className="h-4 w-4" />
                  Merge {selectedIds.size} Vouchers (Rs. {totalNetPayable.toLocaleString()})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
