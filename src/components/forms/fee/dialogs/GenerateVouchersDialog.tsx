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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Calendar, FileText, Info } from "lucide-react";
import { format } from "date-fns";

export interface GenerateVouchersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  defaultSessionId?: string;
  defaultClassId?: string;
  defaultYear?: number;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function GenerateVouchersDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultSessionId,
  defaultClassId,
  defaultYear,
}: GenerateVouchersDialogProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [sessionId, setSessionId] = useState<string>(defaultSessionId || "");
  const [classId, setClassId] = useState<string>(defaultClassId || "");
  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(defaultYear || currentYear);
  const [installmentNo, setInstallmentNo] = useState<number>(currentMonth);
  const [dueDate, setDueDate] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [includeArrears, setIncludeArrears] = useState<boolean>(true);
  const [fineAmount, setFineAmount] = useState<number>(0);

  const utils = api.useUtils();

  const sessionsQuery = api.session.getSessions.useQuery();
  const classesQuery = api.class.getClasses.useQuery();

  // Auto-select active session if none selected
  useEffect(() => {
    if (!sessionId && sessionsQuery.data?.length) {
      const active =
        sessionsQuery.data.find((s) => s.isActive) ?? sessionsQuery.data[0];
      if (active) setSessionId(active.sessionId);
    }
  }, [sessionsQuery.data, sessionId]);

  // Sync defaultSessionId / defaultClassId if changed externally
  useEffect(() => {
    if (defaultSessionId) setSessionId(defaultSessionId);
  }, [defaultSessionId]);

  useEffect(() => {
    if (defaultClassId) setClassId(defaultClassId);
  }, [defaultClassId]);

  // Query challan validity schedule to preview configured dates
  const validityScheduleQuery = api.challanValidity.getBySessionAndGrade.useQuery(
    {
      sessionId,
      gradeId: classId,
      year,
    },
    {
      enabled: !!sessionId && !!classId,
    }
  );

  // Look for matching validity window for current installmentNo
  const matchedSchedule = validityScheduleQuery.data?.find(
    (s) => s.installmentNo === installmentNo
  );

  // When matched schedule changes, prefill due date if empty
  useEffect(() => {
    if (matchedSchedule && !dueDate) {
      setDueDate(format(new Date(matchedSchedule.toDate), "yyyy-MM-dd"));
    }
  }, [matchedSchedule, dueDate]);

  const generateBatchMutation = api.voucher.generateBatch.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Batch generation complete: ${data.generatedCount} vouchers generated, ${data.skippedCount} skipped.`
      );
      void utils.voucher.getVouchers.invalidate();
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate vouchers batch.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      toast.error("Please select an academic session.");
      return;
    }
    if (!classId) {
      toast.error("Please select a target class / grade.");
      return;
    }

    generateBatchMutation.mutate({
      sessionId,
      classId,
      month,
      year,
      installmentNo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      includeArrears,
      fineAmount: fineAmount > 0 ? fineAmount : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Generate Monthly Fee Vouchers
          </DialogTitle>
          <DialogDescription>
            Issue fee vouchers for all enrolled students in the selected class and academic session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Academic Session */}
            <div className="space-y-1.5">
              <Label htmlFor="session-select" className="text-xs font-semibold">
                Academic Session <span className="text-red-500">*</span>
              </Label>
              <Select value={sessionId} onValueChange={setSessionId}>
                <SelectTrigger id="session-select" className="h-9">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessionsQuery.data?.map((s) => (
                    <SelectItem key={s.sessionId} value={s.sessionId}>
                      {s.sessionName} {s.isActive ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Class / Grade */}
            <div className="space-y-1.5">
              <Label htmlFor="class-select" className="text-xs font-semibold">
                Target Class / Grade <span className="text-red-500">*</span>
              </Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger id="class-select" className="h-9">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classesQuery.data?.map((c) => (
                    <SelectItem key={c.classId} value={c.classId}>
                      {c.grade} - {c.section} ({c.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Billing Month */}
            <div className="space-y-1.5">
              <Label htmlFor="month-select" className="text-xs font-semibold">
                Billing Month <span className="text-red-500">*</span>
              </Label>
              <Select
                value={month.toString()}
                onValueChange={(val) => {
                  const m = parseInt(val, 10);
                  setMonth(m);
                  setInstallmentNo(m);
                }}
              >
                <SelectTrigger id="month-select" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, idx) => (
                    <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                      {idx + 1} - {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <Label htmlFor="year-input" className="text-xs font-semibold">
                Billing Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year-input"
                type="number"
                min={2000}
                max={2100}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || currentYear)}
                className="h-9"
              />
            </div>

            {/* Installment Number */}
            <div className="space-y-1.5">
              <Label htmlFor="installment-no" className="text-xs font-semibold">
                Installment No (1..12)
              </Label>
              <Input
                id="installment-no"
                type="number"
                min={1}
                max={12}
                value={installmentNo}
                onChange={(e) =>
                  setInstallmentNo(parseInt(e.target.value, 10) || 1)
                }
                className="h-9"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="due-date" className="text-xs font-semibold">
                Due Date
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <Label htmlFor="issue-date" className="text-xs font-semibold">
                Issue Date
              </Label>
              <Input
                id="issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Optional Late Fine */}
            <div className="space-y-1.5">
              <Label htmlFor="fine-amount" className="text-xs font-semibold">
                Fine / Late Fee (Rs.)
              </Label>
              <Input
                id="fine-amount"
                type="number"
                min={0}
                value={fineAmount}
                onChange={(e) => setFineAmount(parseFloat(e.target.value) || 0)}
                className="h-9"
              />
            </div>
          </div>

          {/* Schedule Notice */}
          {matchedSchedule && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <Info className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                Configured validity schedule for Installment #{installmentNo}:{" "}
                <strong>{format(new Date(matchedSchedule.fromDate), "dd MMM yyyy")}</strong> to{" "}
                <strong>{format(new Date(matchedSchedule.toDate), "dd MMM yyyy")}</strong>.
              </span>
            </div>
          )}

          {/* Arrears checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="include-arrears"
              checked={includeArrears}
              onCheckedChange={(checked) => setIncludeArrears(!!checked)}
            />
            <Label
              htmlFor="include-arrears"
              className="text-xs font-medium cursor-pointer leading-none text-slate-700 dark:text-slate-300"
            >
              Automatically calculate and carry forward prior unpaid arrears
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={generateBatchMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generateBatchMutation.isPending || !sessionId || !classId}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {generateBatchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Generate Vouchers
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
