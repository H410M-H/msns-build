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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Receipt,
  Building,
} from "lucide-react";
import { format } from "date-fns";

export interface RecordPaymentVoucherItem {
  sfcId: string;
  voucherNumber: string;
  studentName?: string;
  registrationNumber?: string;
  className?: string;
  netPayable: number;
  amountPaid: number;
  paymentStatus: string;
  voucherType?: string;
  isSplitLocked?: boolean;
  dueDate?: Date | string | null;
}

export interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: RecordPaymentVoucherItem | null;
  onSuccess?: () => void;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  voucher,
  onSuccess,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [collectingBank, setCollectingBank] = useState<string>("CASH_COUNTER");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [collectorName, setCollectorName] = useState<string>("");
  const [receiptNumber, setReceiptNumber] = useState<string>("");
  const [paidAt, setPaidAt] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const utils = api.useUtils();

  const outstanding = voucher ? Math.max(0, voucher.netPayable - voucher.amountPaid) : 0;

  useEffect(() => {
    if (voucher) {
      const remaining = Math.max(0, voucher.netPayable - voucher.amountPaid);
      setAmount(remaining);
      setTransactionRef("");
      setReceiptNumber("");
      setPaidAt(format(new Date(), "yyyy-MM-dd"));
    }
  }, [voucher]);

  const paymentMutation = api.voucher.recordPayment.useMutation({
    onSuccess: () => {
      toast.success(
        `Payment of Rs. ${amount.toLocaleString()} recorded successfully.`
      );
      void utils.voucher.getVouchers.invalidate();
      void utils.fee.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to record payment.");
    },
  });

  if (!voucher) return null;

  const isSplitLocked = !!voucher.isSplitLocked;
  const isPaid = voucher.paymentStatus === "PAID" || outstanding <= 0;
  const isMergedChild = voucher.paymentStatus === "LOCKED_MERGED";
  const isCancelled = voucher.paymentStatus === "CANCELLED";

  const isBlocked = isSplitLocked || isPaid || isMergedChild || isCancelled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }
    if (amount > outstanding) {
      toast.error(`Payment amount cannot exceed outstanding balance of Rs. ${outstanding.toLocaleString()}.`);
      return;
    }

    paymentMutation.mutate({
      sfcId: voucher.sfcId,
      amount,
      paymentMode: paymentMethod,
      paymentMethod,
      collectingBank,
      collectorName: collectorName || undefined,
      receiptNumber: receiptNumber || undefined,
      transactionReference: transactionRef || undefined,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Record Fee Payment
          </DialogTitle>
          <DialogDescription>
            Record cash counter collection, direct bank deposit, or electronic transfer for this voucher.
          </DialogDescription>
        </DialogHeader>

        {/* Voucher Summary Card */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-border dark:bg-card">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
              <span className="text-muted-foreground">Net Payable:</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Rs. {voucher.netPayable.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Outstanding:</span>
              <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                Rs. {outstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Blocking guards */}
        {isSplitLocked && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
            <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">Split-Locked Parent Voucher</p>
              <p>This voucher has been split into sub-installments. Please record payments against the child installments.</p>
            </div>
          </div>
        )}

        {isMergedChild && (
          <div className="flex items-start gap-2 rounded-md border border-slate-500/20 bg-slate-500/10 p-3 text-xs text-slate-800 dark:text-slate-200">
            <Lock className="h-4 w-4 shrink-0 mt-0.5 text-slate-600" />
            <div>
              <p className="font-bold">Merged Child Voucher</p>
              <p>This voucher is locked in a consolidated full-year merge. Please record payments on the master merged challan.</p>
            </div>
          </div>
        )}

        {isPaid && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold">Fully Settled Voucher</p>
              <p>This voucher has zero outstanding balance and is already marked as PAID.</p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold">Cancelled Voucher</p>
              <p>Payments cannot be accepted on cancelled fee vouchers.</p>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="payment-amount" className="text-xs font-semibold">
                Payment Amount (Rs.) <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setAmount(outstanding)}
                  disabled={isBlocked}
                >
                  Full (Rs. {outstanding.toLocaleString()})
                </Button>
                {outstanding > 100 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setAmount(Math.round(outstanding / 2))}
                    disabled={isBlocked}
                  >
                    50% (Rs. {Math.round(outstanding / 2).toLocaleString()})
                  </Button>
                )}
              </div>
            </div>
            <Input
              id="payment-amount"
              type="number"
              min={1}
              max={outstanding}
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              disabled={isBlocked}
              className="h-10 text-base font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label htmlFor="payment-method" className="text-xs font-semibold">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                disabled={isBlocked}
              >
                <SelectTrigger id="payment-method" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash Payment</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer (IBFT)</SelectItem>
                  <SelectItem value="ONLINE">Online Gateway / Mobile App</SelectItem>
                  <SelectItem value="CHEQUE">Cheque / Pay Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Collecting Channel / Bank */}
            <div className="space-y-1.5">
              <Label htmlFor="collecting-bank" className="text-xs font-semibold">
                Collecting Channel / Bank
              </Label>
              <Select
                value={collectingBank}
                onValueChange={setCollectingBank}
                disabled={isBlocked}
              >
                <SelectTrigger id="collecting-bank" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH_COUNTER">School Cash Counter</SelectItem>
                  <SelectItem value="MEEZAN_BANK_LMS">Meezan Bank Limited</SelectItem>
                  <SelectItem value="BANK_ALFALAH">Bank Alfalah Limited</SelectItem>
                  <SelectItem value="HABIB_BANK">Habib Bank Limited (HBL)</SelectItem>
                  <SelectItem value="OTHER">Other Bank / Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Receipt Number */}
            <div className="space-y-1.5">
              <Label htmlFor="receipt-number" className="text-xs font-semibold">
                Manual Receipt # (Optional)
              </Label>
              <Input
                id="receipt-number"
                placeholder="Leave blank to auto-generate"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                disabled={isBlocked}
                className="h-9"
              />
            </div>

            {/* Transaction Reference */}
            <div className="space-y-1.5">
              <Label htmlFor="transaction-ref" className="text-xs font-semibold">
                Bank Trx / Cheque # (Optional)
              </Label>
              <Input
                id="transaction-ref"
                placeholder="e.g. FT2603489248"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                disabled={isBlocked}
                className="h-9"
              />
            </div>

            {/* Cashier / Collector Name */}
            <div className="space-y-1.5">
              <Label htmlFor="collector-name" className="text-xs font-semibold">
                Collector / Cashier Name
              </Label>
              <Input
                id="collector-name"
                placeholder="Staff name"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                disabled={isBlocked}
                className="h-9"
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <Label htmlFor="paid-at" className="text-xs font-semibold">
                Payment Date
              </Label>
              <Input
                id="paid-at"
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                disabled={isBlocked}
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={paymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isBlocked || paymentMutation.isPending || amount <= 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {paymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  Confirm Receipt (Rs. {amount.toLocaleString()})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
