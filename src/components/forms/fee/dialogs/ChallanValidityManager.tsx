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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
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
  CalendarDays,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export interface ScheduleRow {
  installmentNo: number;
  month: number;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export interface ChallanValidityManagerProps {
  isDialog?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultSessionId?: string;
  sessionId?: string; // convenient alias
  defaultGradeId?: string;
  year?: number;
  onSuccess?: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ChallanValidityManager({
  isDialog = true,
  open = false,
  onOpenChange,
  defaultSessionId,
  sessionId: aliasSessionId,
  defaultGradeId,
  year: propYear,
  onSuccess,
}: ChallanValidityManagerProps) {
  const currentYear = new Date().getFullYear();
  const effectiveDefaultSessionId = defaultSessionId || aliasSessionId || "";

  const [sessionId, setSessionId] = useState<string>(effectiveDefaultSessionId);
  const [gradeId, setGradeId] = useState<string>(defaultGradeId || "");
  const [year, setYear] = useState<number>(propYear || currentYear);
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);

  const utils = api.useUtils();

  const sessionsQuery = api.session.getSessions.useQuery();
  const classesQuery = api.class.getClasses.useQuery();

  // Auto-select session if none selected
  useEffect(() => {
    if (!sessionId && sessionsQuery.data?.length) {
      const active =
        sessionsQuery.data.find((s) => s.isActive) ?? sessionsQuery.data[0];
      if (active) setSessionId(active.sessionId);
    }
  }, [sessionsQuery.data, sessionId]);

  // Sync external session/grade changes
  useEffect(() => {
    if (effectiveDefaultSessionId) setSessionId(effectiveDefaultSessionId);
  }, [effectiveDefaultSessionId]);

  useEffect(() => {
    if (defaultGradeId) setGradeId(defaultGradeId);
  }, [defaultGradeId]);

  useEffect(() => {
    if (propYear) setYear(propYear);
  }, [propYear]);

  // Auto-select first class/grade if empty
  useEffect(() => {
    if (!gradeId && classesQuery.data?.length) {
      setGradeId(classesQuery.data[0]!.classId);
    }
  }, [classesQuery.data, gradeId]);

  // Fetch existing schedule
  const validityQuery = api.challanValidity.getBySessionAndGrade.useQuery(
    {
      sessionId,
      gradeId,
      year,
    },
    {
      enabled: !!sessionId && !!gradeId,
    }
  );

  // Sync existing validity records to local state
  useEffect(() => {
    if (validityQuery.data && validityQuery.data.length > 0) {
      const rows: ScheduleRow[] = validityQuery.data.map((item) => ({
        installmentNo: item.installmentNo,
        month: item.month ?? item.installmentNo,
        fromDate: format(new Date(item.fromDate), "yyyy-MM-dd"),
        toDate: format(new Date(item.toDate), "yyyy-MM-dd"),
        isActive: item.isActive,
      }));
      setSchedule(rows);
    } else if (validityQuery.data && validityQuery.data.length === 0) {
      // Default to standard 12 months for this year if completely empty
      generateDefaultSchedule(year);
    }
  }, [validityQuery.data, year]);

  const generateDefaultSchedule = (targetYear: number) => {
    const rows: ScheduleRow[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = m.toString().padStart(2, "0");
      rows.push({
        installmentNo: m,
        month: m,
        fromDate: `${targetYear}-${monthStr}-01`,
        toDate: `${targetYear}-${monthStr}-10`,
        isActive: true,
      });
    }
    setSchedule(rows);
  };

  // Validate non-overlapping intervals
  const validationErrors: string[] = [];
  const sorted = [...schedule].sort((a, b) => a.installmentNo - b.installmentNo);
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]!;
    if (current.fromDate && current.toDate) {
      const from = new Date(current.fromDate).getTime();
      const to = new Date(current.toDate).getTime();
      if (from > to) {
        validationErrors.push(
          `Installment #${current.installmentNo}: From Date cannot be after To Date.`
        );
      }
      if (i > 0) {
        const prev = sorted[i - 1]!;
        if (prev.toDate) {
          const prevTo = new Date(prev.toDate).getTime();
          if (from <= prevTo) {
            validationErrors.push(
              `Installment #${current.installmentNo} overlaps with Installment #${prev.installmentNo}. From date must be after previous installment's due date.`
            );
          }
        }
      }
    }
  }

  const setScheduleMutation = api.challanValidity.setInstallmentSchedule.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Installment schedule with ${data.count} windows successfully saved.`
      );
      void utils.challanValidity.getBySessionAndGrade.invalidate({ sessionId, gradeId });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save installment schedule.");
    },
  });

  const bulkSyncMutation = api.challanValidity.bulkSync.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Bulk sync complete: Updated validity dates for ${data.syncedVouchersCount} open vouchers.`
      );
      void utils.voucher.getVouchers.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sync validity dates to vouchers.");
    },
  });

  const handleSave = () => {
    if (!sessionId) {
      toast.error("Please select an academic session.");
      return;
    }
    if (!gradeId) {
      toast.error("Please select a target grade / class.");
      return;
    }
    if (schedule.length === 0) {
      toast.error("Schedule must contain at least one installment window.");
      return;
    }
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setScheduleMutation.mutate({
      sessionId,
      gradeId,
      year,
      schedule: schedule.map((s) => ({
        installmentNo: s.installmentNo,
        month: s.month,
        fromDate: new Date(s.fromDate),
        toDate: new Date(s.toDate),
        isActive: s.isActive,
      })),
    });
  };

  const handleBulkSync = () => {
    if (!sessionId || !gradeId) {
      toast.error("Please select session and class before syncing.");
      return;
    }
    bulkSyncMutation.mutate({
      sessionId,
      gradeId,
    });
  };

  const updateRow = (index: number, field: keyof ScheduleRow, value: any) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index]!, [field]: value };
      return copy;
    });
  };

  const removeRow = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const nextInst = schedule.length > 0 ? Math.max(...schedule.map((s) => s.installmentNo)) + 1 : 1;
    if (nextInst > 12) {
      toast.error("Maximum 12 installments supported.");
      return;
    }
    const monthStr = nextInst.toString().padStart(2, "0");
    setSchedule((prev) => [
      ...prev,
      {
        installmentNo: nextInst,
        month: nextInst,
        fromDate: `${year}-${monthStr}-01`,
        toDate: `${year}-${monthStr}-10`,
        isActive: true,
      },
    ]);
  };

  // Content body
  const content = (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Academic Session</Label>
          <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger className="h-9">
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

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Target Grade / Class</Label>
          <Select value={gradeId} onValueChange={setGradeId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select Grade" />
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

        <div className="space-y-1">
          <Label className="text-xs font-semibold">Schedule Year</Label>
          <Input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || currentYear)}
            className="h-9"
          />
        </div>
      </div>

      {/* Action Bar for Schedule */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 pt-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => generateDefaultSchedule(year)}
            className="gap-1.5 text-xs h-8"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Reset 12-Month Standard
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={schedule.length >= 12}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Installment
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBulkSync}
          disabled={bulkSyncMutation.isPending || !sessionId || !gradeId}
          className="gap-1.5 text-xs h-8 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
        >
          {bulkSyncMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Bulk Sync to Open Vouchers
        </Button>
      </div>

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="h-4 w-4" />
            <span>Temporal Boundary Conflicts Detected:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Schedule Table */}
      <div className="rounded-md border border-slate-200 overflow-hidden dark:border-border max-h-72 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-card">
              <TableHead className="w-16 text-xs">Inst #</TableHead>
              <TableHead className="text-xs">Month</TableHead>
              <TableHead className="text-xs">From Date (Issue)</TableHead>
              <TableHead className="text-xs">To Date (Due)</TableHead>
              <TableHead className="w-12 text-center text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                  No installment validity windows defined. Click &ldquo;Reset 12-Month Standard&rdquo; or &ldquo;Add Installment&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              schedule.map((item, index) => (
                <TableRow key={item.installmentNo}>
                  <TableCell className="font-bold text-xs">
                    Inst. {item.installmentNo}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Select
                      value={item.month.toString()}
                      onValueChange={(val) =>
                        updateRow(index, "month", parseInt(val, 10))
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES.map((name, idx) => (
                          <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={item.fromDate}
                      onChange={(e) => updateRow(index, "fromDate", e.target.value)}
                      className="h-7 text-xs w-36"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={item.toDate}
                      onChange={(e) => updateRow(index, "toDate", e.target.value)}
                      className="h-7 text-xs w-36"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(index)}
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[11px] text-muted-foreground">
          Strict non-overlapping rule: <code>fromDate(k) &le; toDate(k) &lt; fromDate(k+1)</code>
        </p>
        <Button
          type="button"
          onClick={handleSave}
          disabled={setScheduleMutation.isPending || validationErrors.length > 0 || !sessionId || !gradeId}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {setScheduleMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Schedule...
            </>
          ) : (
            <>
              <CalendarDays className="h-4 w-4" />
              Save Validity Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // If used in Dialog mode
  if (isDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Challan Validity & Due Date Manager
            </DialogTitle>
            <DialogDescription>
              Configure monthly issue and due date intervals with non-overlapping temporal constraints.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // If embedded in a Tab
  return (
    <Card className="border-slate-200 dark:border-border shadow-xs">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Challan Validity & Due Date Schedule Manager
        </CardTitle>
        <CardDescription>
          Configure temporal issue and due date windows per session and grade, and bulk sync dates to open vouchers.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
