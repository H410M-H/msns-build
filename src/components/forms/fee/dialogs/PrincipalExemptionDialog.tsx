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
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Award,
  AlertTriangle,
  CheckCircle2,
  Undo2,
  ShieldCheck,
  Percent,
} from "lucide-react";

export interface ExemptionVoucherItem {
  sfcId: string;
  voucherNumber: string;
  studentName?: string;
  registrationNumber?: string;
  className?: string;
  baseFee: number;
  concessionCategory?: string | null;
  concessionAmount?: number;
  exemptionAmount?: number | null;
  exemptionReason?: string | null;
  exemptionApprovedBy?: string | null;
  discount?: number;
  lateFee?: number;
  netPayable: number;
  paymentStatus: string;
  isSplitLocked?: boolean;
}

export interface PrincipalExemptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: ExemptionVoucherItem | null;
  onSuccess?: () => void;
}

export function PrincipalExemptionDialog({
  open,
  onOpenChange,
  voucher,
  onSuccess,
}: PrincipalExemptionDialogProps) {
  const [exemptionAmount, setExemptionAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");

  const utils = api.useUtils();

  useEffect(() => {
    if (voucher) {
      setExemptionAmount(voucher.exemptionAmount ?? 0);
      setReason(voucher.exemptionReason ?? "");
    }
  }, [voucher]);

  const applyMutation = api.concession.applyPrincipalExemption.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Principal discretionary exemption of Rs. ${data.exemptionAmount} successfully applied.`
      );
      void utils.voucher.getVouchers.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to apply principal exemption.");
    },
  });

  const revokeMutation = api.concession.revokePrincipalExemption.useMutation({
    onSuccess: () => {
      toast.success("Principal exemption successfully revoked and base discount restored.");
      void utils.voucher.getVouchers.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to revoke principal exemption.");
    },
  });

  if (!voucher) return null;

  const baseFee = voucher.baseFee;
  const policyConcession = voucher.concessionAmount ?? 0;
  const existingExemption = voucher.exemptionAmount ?? 0;
  const isPaid = voucher.paymentStatus === "PAID";
  const isSplitLocked = !!voucher.isSplitLocked;
  const isMerged = voucher.paymentStatus === "LOCKED_MERGED";

  const isBlocked = isPaid || isSplitLocked || isMerged;

  // New simulated totals
  const simulatedTotalDiscount = policyConcession + (exemptionAmount > 0 ? exemptionAmount : 0);
  const simulatedNetPayable = Math.max(
    0,
    baseFee + (voucher.lateFee ?? 0) - simulatedTotalDiscount
  );

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (exemptionAmount <= 0) {
      toast.error("Exemption amount must be greater than zero.");
      return;
    }
    if (reason.trim().length < 5) {
      toast.error("Justification reason must be at least 5 characters long.");
      return;
    }

    applyMutation.mutate({
      voucherId: voucher.sfcId,
      exemptionAmount,
      reason: reason.trim(),
    });
  };

  const handleRevoke = () => {
    revokeMutation.mutate({
      voucherId: voucher.sfcId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Principal Discretionary Fee Exemption
          </DialogTitle>
          <DialogDescription>
            Grant one-off special fee exemptions or scholarships with mandatory justification for management audit.
          </DialogDescription>
        </DialogHeader>

        {/* Voucher Header Info Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-border dark:bg-card">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Voucher #:</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {voucher.voucherNumber}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Student:</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {voucher.studentName || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Base Tuition:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Rs. {baseFee.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Current Net Due:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                Rs. {voucher.netPayable.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Guard Warnings */}
        {isPaid && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>Cannot apply or modify exemption on an already paid voucher.</span>
          </div>
        )}

        {isSplitLocked && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>Exemptions cannot be applied to split-locked vouchers. Revert the split first.</span>
          </div>
        )}

        {/* Existing Active Exemption Card */}
        {existingExemption > 0 && (
          <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-xs space-y-2 text-blue-900 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                <Award className="h-4 w-4" />
                Active Principal Exemption: Rs. {existingExemption.toLocaleString()}
              </span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRevoke}
                disabled={revokeMutation.isPending || isBlocked}
                className="h-7 text-xs gap-1"
              >
                {revokeMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Undo2 className="h-3.5 w-3.5" />
                )}
                Revoke Exemption
              </Button>
            </div>
            {voucher.exemptionReason && (
              <p className="text-muted-foreground italic">
                &ldquo;{voucher.exemptionReason}&rdquo;
              </p>
            )}
            {voucher.exemptionApprovedBy && (
              <p className="text-[10px] text-muted-foreground">
                Approved by Employee/User ID: {voucher.exemptionApprovedBy}
              </p>
            )}
          </div>
        )}

        {/* Apply / Update Form */}
        <form onSubmit={handleApply} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="exemption-amount" className="text-xs font-semibold">
              Exemption Amount (Rs.) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exemption-amount"
              type="number"
              min={1}
              max={baseFee}
              value={exemptionAmount || ""}
              onChange={(e) => setExemptionAmount(parseFloat(e.target.value) || 0)}
              disabled={isBlocked}
              placeholder="e.g. 1500"
              className="h-9 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exemption-reason" className="text-xs font-semibold">
              Administrative Justification / Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="exemption-reason"
              rows={3}
              placeholder="State reason (e.g. Orphan welfare discount approved by Principal, Hafiz-e-Quran scholarship, hardship waiver)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isBlocked}
              className="text-xs resize-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Mandatory minimum 5 characters. This reason is logged to the management audit trail.
            </p>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5 dark:border-border dark:bg-card">
            <div className="flex justify-between text-muted-foreground">
              <span>Base Tuition Fee:</span>
              <span>Rs. {baseFee.toLocaleString()}</span>
            </div>
            {policyConcession > 0 && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400">
                <span>Policy Concession ({voucher.concessionCategory || "Merit"}):</span>
                <span>- Rs. {policyConcession.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Principal Exemption Discount:</span>
              <span>- Rs. {(exemptionAmount > 0 ? exemptionAmount : 0).toLocaleString()}</span>
            </div>
            <div className="border-t pt-1.5 flex justify-between font-bold text-sm">
              <span>Adjusted Net Payable:</span>
              <span className="text-emerald-700 dark:text-emerald-300">
                Rs. {simulatedNetPayable.toLocaleString()}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={applyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isBlocked ||
                applyMutation.isPending ||
                exemptionAmount <= 0 ||
                reason.trim().length < 5
              }
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  Apply Principal Exemption
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
