"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { PaymentStatus, VoucherType } from "@prisma/client";
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
import { Checkbox } from "~/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  GitMerge,
  Printer,
  Calendar,
  MoreVertical,
  DollarSign,
  Split,
  Award,
  Ban,
  Loader2,
  RefreshCw,
  Lock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";

// Interactive Dialogs
import { GenerateVouchersDialog } from "./dialogs/GenerateVouchersDialog";
import { SplitVoucherDialog, type SplitVoucherItem } from "./dialogs/SplitVoucherDialog";
import { MergeVouchersDialog, type MergeVoucherItem } from "./dialogs/MergeVouchersDialog";
import { RecordPaymentDialog, type RecordPaymentVoucherItem } from "./dialogs/RecordPaymentDialog";
import { ChallanValidityManager } from "./dialogs/ChallanValidityManager";
import { PrincipalExemptionDialog, type ExemptionVoucherItem } from "./dialogs/PrincipalExemptionDialog";
import { VoucherPrintSheet } from "./VoucherPrintSheet";
import type { PrintableVoucherData } from "./PrintableVoucher";

export interface MonthlyVoucherHubProps {
  sessionId?: string;
  year?: number;
  initialSessionId?: string;
  initialYear?: number;
}

const MONTH_OPTIONS = [
  { value: "ALL", label: "All Months" },
  { value: "1", label: "January (01)" },
  { value: "2", label: "February (02)" },
  { value: "3", label: "March (03)" },
  { value: "4", label: "April (04)" },
  { value: "5", label: "May (05)" },
  { value: "6", label: "June (06)" },
  { value: "7", label: "July (07)" },
  { value: "8", label: "August (08)" },
  { value: "9", label: "September (09)" },
  { value: "10", label: "October (10)" },
  { value: "11", label: "November (11)" },
  { value: "12", label: "December (12)" },
];

export function MonthlyVoucherHub({
  sessionId: propSessionId,
  year: propYear,
  initialSessionId,
  initialYear,
}: MonthlyVoucherHubProps) {
  const currentYear = new Date().getFullYear();
  const effectiveInitialSession = propSessionId || initialSessionId || "";
  const effectiveInitialYear = propYear || initialYear || currentYear;

  // Filter States
  const [sessionId, setSessionId] = useState<string>(effectiveInitialSession);
  const [classId, setClassId] = useState<string>("ALL");
  const [month, setMonth] = useState<string>("ALL");
  const [year, setYear] = useState<number>(effectiveInitialYear);
  const [paymentStatus, setPaymentStatus] = useState<string>("ALL");
  const [voucherType, setVoucherType] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Selection State
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<Set<string>>(new Set());

  // Modal Control States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isValidityOpen, setIsValidityOpen] = useState(false);
  const [splitVoucherTarget, setSplitVoucherTarget] = useState<SplitVoucherItem | null>(null);
  const [recordPaymentTarget, setRecordPaymentTarget] = useState<RecordPaymentVoucherItem | null>(null);
  const [exemptionTarget, setExemptionTarget] = useState<ExemptionVoucherItem | null>(null);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [printTargetVoucherIds, setPrintTargetVoucherIds] = useState<string[] | null>(null);
  const [cancelTargetVoucher, setCancelTargetVoucher] = useState<{ id: string; voucherNumber: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const utils = api.useUtils();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync props when changed
  useEffect(() => {
    if (propSessionId) setSessionId(propSessionId);
  }, [propSessionId]);

  useEffect(() => {
    if (propYear) setYear(propYear);
  }, [propYear]);

  // Queries
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

  const vouchersQuery = api.voucher.getVouchers.useQuery({
    sessionId: sessionId && sessionId !== "ALL" ? sessionId : undefined,
    classId: classId && classId !== "ALL" ? classId : undefined,
    month: month !== "ALL" ? parseInt(month, 10) : undefined,
    year: year || undefined,
    paymentStatus: paymentStatus !== "ALL" ? (paymentStatus as PaymentStatus) : undefined,
    voucherType: voucherType !== "ALL" ? (voucherType as VoucherType) : undefined,
    search: debouncedSearch ? debouncedSearch.trim() : undefined,
    page,
    pageSize,
  });

  // Query for printable data when print modal is invoked
  const voucherPrintQuery = api.voucher.getVoucherPrintData.useQuery(
    {
      voucherIds: printTargetVoucherIds ?? [],
    },
    {
      enabled: !!printTargetVoucherIds && printTargetVoucherIds.length > 0,
    }
  );

  // Cancellation mutation
  const cancelMutation = api.voucher.cancelVoucher.useMutation({
    onSuccess: () => {
      toast.success("Voucher cancelled successfully.");
      void utils.voucher.getVouchers.invalidate();
      setCancelTargetVoucher(null);
      setCancelReason("");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to cancel voucher.");
    },
  });

  // Items from query
  const items = useMemo(() => vouchersQuery.data?.items ?? [], [vouchersQuery.data]);
  const total = vouchersQuery.data?.total ?? 0;
  const totalPages = vouchersQuery.data?.totalPages ?? 1;

  // Master Checkbox Logic
  const allCurrentPageSelected =
    items.length > 0 && items.every((item) => selectedVoucherIds.has(item.sfcId));
  const someCurrentPageSelected =
    items.some((item) => selectedVoucherIds.has(item.sfcId)) && !allCurrentPageSelected;

  const handleToggleSelectAll = (checked: boolean) => {
    const next = new Set(selectedVoucherIds);
    if (checked) {
      items.forEach((item) => next.add(item.sfcId));
    } else {
      items.forEach((item) => next.delete(item.sfcId));
    }
    setSelectedVoucherIds(next);
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedVoucherIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedVoucherIds(next);
  };

  const handleResetFilters = () => {
    setSessionId(effectiveInitialSession || (sessionsQuery.data?.[0]?.sessionId ?? ""));
    setClassId("ALL");
    setMonth("ALL");
    setYear(currentYear);
    setPaymentStatus("ALL");
    setVoucherType("ALL");
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  // Helper: Financial calculations per voucher
  const getVoucherMetrics = (v: typeof items[0]) => {
    const fee = v.fees ?? {};
    const baseFee =
      fee.type === "MonthlyFee"
        ? (fee.tuitionFee ?? 0)
        : (fee.tuitionFee ?? 0) +
          (fee.admissionFee ?? 0) +
          (fee.examFund ?? 0) +
          (fee.computerLabFund ?? 0) +
          (fee.studentIdCardFee ?? 0) +
          (fee.infoAndCallsFee ?? 0);

    const netPayable = Math.max(
      0,
      baseFee + (v.lateFee ?? 0) + (v.adjustmentAmount ?? 0) - (v.discount ?? 0)
    );
    const amountPaid = v.amountPaid ?? 0;
    const outstanding = Math.max(0, netPayable - amountPaid);

    const isOverdue =
      v.paymentStatus === "OVERDUE" ||
      (v.paymentStatus !== "PAID" &&
        v.paymentStatus !== "CANCELLED" &&
        v.paymentStatus !== "LOCKED_MERGED" &&
        v.dueDate &&
        new Date(v.dueDate).getTime() < new Date().setHours(0, 0, 0, 0));

    return { baseFee, netPayable, amountPaid, outstanding, isOverdue };
  };

  // Selected Vouchers Objects for Merge
  const selectedMergeVouchers: MergeVoucherItem[] = useMemo(() => {
    return items
      .filter((v) => selectedVoucherIds.has(v.sfcId))
      .map((v) => {
        const { netPayable } = getVoucherMetrics(v);
        return {
          sfcId: v.sfcId,
          voucherNumber: v.voucherNumber,
          studentClassId: v.studentClassId,
          studentName: v.StudentClass?.Students?.studentName,
          registrationNumber: v.StudentClass?.Students?.registrationNumber,
          className: `${v.StudentClass?.Grades?.grade ?? ""} - ${v.StudentClass?.Grades?.section ?? ""}`,
          month: v.month,
          year: v.year,
          installmentNo: v.installmentNo,
          netPayable,
          amountPaid: v.amountPaid,
          paymentStatus: v.paymentStatus,
          isSplitLocked: v.isSplitLocked,
          dueDate: v.dueDate,
        };
      });
  }, [items, selectedVoucherIds]);

  // Validation for Merge Selected:
  const canMergeSelected = useMemo(() => {
    if (selectedMergeVouchers.length < 2) return false;
    const studentIds = new Set(selectedMergeVouchers.map((v) => v.studentClassId));
    if (studentIds.size !== 1) return false;
    // Must be unpaid, unsplit, unmerged
    return selectedMergeVouchers.every(
      (v) =>
        v.amountPaid === 0 &&
        v.paymentStatus !== "PAID" &&
        !v.isSplitLocked &&
        v.paymentStatus !== "LOCKED_MERGED" &&
        v.paymentStatus !== "CANCELLED"
    );
  }, [selectedMergeVouchers]);

  // Handle Cancel Click
  const handleConfirmCancel = () => {
    if (!cancelTargetVoucher) return;
    if (cancelReason.trim().length < 3) {
      toast.error("Please enter a valid cancellation reason (min 3 chars).");
      return;
    }
    cancelMutation.mutate({
      voucherId: cancelTargetVoucher.id,
      reason: cancelReason.trim(),
    });
  };

  // Status Badge Helper
  const renderStatusBadge = (status: PaymentStatus, isOverdue: boolean) => {
    if (status === "PAID") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          PAID
        </Badge>
      );
    }
    if (status === "PARTIALLY_PAID") {
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
          PARTIAL
        </Badge>
      );
    }
    if (status === "LOCKED_MERGED") {
      return (
        <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          MERGED
        </Badge>
      );
    }
    if (status === "CANCELLED") {
      return (
        <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20">
          CANCELLED
        </Badge>
      );
    }
    if (isOverdue) {
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
          OVERDUE
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
        PENDING
      </Badge>
    );
  };

  // Voucher Type Badge Helper
  const renderTypeBadge = (type: VoucherType, subIndex?: number | null) => {
    switch (type) {
      case "SUB_INSTALLMENT":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-[10px]">
            Part {subIndex ?? "Sub"}
          </Badge>
        );
      case "FULL_YEAR_MERGED":
        return (
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-700 border-indigo-500/20 text-[10px]">
            Merged Master
          </Badge>
        );
      case "FEE_ADJUSTMENT":
        return (
          <Badge variant="outline" className="bg-teal-500/10 text-teal-700 border-teal-500/20 text-[10px]">
            Adjustment
          </Badge>
        );
      case "FINE_CHALLAN":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/20 text-[10px]">
            Fine
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            Regular
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Monthly Fee Vouchers &amp; Challans
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate, collect, split, merge, and bulk print fee challans across academic sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Vouchers Action */}
          <Button
            onClick={() => setIsGenerateOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Generate Vouchers
          </Button>

          {/* Merge Selected Action */}
          <Button
            variant="outline"
            onClick={() => setIsMergeOpen(true)}
            disabled={!canMergeSelected}
            className={cn(
              "gap-1.5",
              canMergeSelected && "border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400"
            )}
            title={
              selectedVoucherIds.size < 2
                ? "Select at least 2 unpaid vouchers from the same student to merge"
                : !canMergeSelected
                ? "Selected vouchers must belong to a single student and be 100% unpaid"
                : "Merge selected vouchers into consolidated challan"
            }
          >
            <GitMerge className="h-4 w-4" />
            Merge Selected ({selectedVoucherIds.size})
          </Button>

          {/* Bulk Print Selected Action */}
          <Button
            variant="outline"
            onClick={() => setPrintTargetVoucherIds(Array.from(selectedVoucherIds))}
            disabled={selectedVoucherIds.size === 0}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Bulk Print ({selectedVoucherIds.size})
          </Button>

          {/* Validity Schedule Manager Action */}
          <Button
            variant="outline"
            onClick={() => setIsValidityOpen(true)}
            className="gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Validity Schedule
          </Button>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void utils.voucher.getVouchers.invalidate()}
            disabled={vouchersQuery.isFetching}
            className="h-9 w-9"
          >
            <RefreshCw
              className={cn("h-4 w-4", vouchersQuery.isFetching && "animate-spin text-emerald-600")}
            />
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="border-slate-200 dark:border-border shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {/* Session Select */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Session
              </Label>
              <Select value={sessionId} onValueChange={(val) => { setSessionId(val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sessions</SelectItem>
                  {sessionsQuery.data?.map((s) => (
                    <SelectItem key={s.sessionId} value={s.sessionId}>
                      {s.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class / Grade Select */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Class / Grade
              </Label>
              <Select value={classId} onValueChange={(val) => { setClassId(val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classesQuery.data?.map((c) => (
                    <SelectItem key={c.classId} value={c.classId}>
                      {c.grade} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Billing Month Select */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Month
              </Label>
              <Select value={month} onValueChange={(val) => { setMonth(val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Input */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Year
              </Label>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={year || ""}
                onChange={(e) => {
                  setYear(parseInt(e.target.value, 10) || currentYear);
                  setPage(1);
                }}
                className="h-8 text-xs"
              />
            </div>

            {/* Payment Status Select */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Payment Status
              </Label>
              <Select value={paymentStatus} onValueChange={(val) => { setPaymentStatus(val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="LOCKED_MERGED">Locked / Merged</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voucher Type Select */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Voucher Type
              </Label>
              <Select value={voucherType} onValueChange={(val) => { setVoucherType(val); setPage(1); }}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="REGULAR_INSTALLMENT">Regular Installment</SelectItem>
                  <SelectItem value="SUB_INSTALLMENT">Sub-Installment</SelectItem>
                  <SelectItem value="FULL_YEAR_MERGED">Merged Full Year</SelectItem>
                  <SelectItem value="FEE_ADJUSTMENT">Fee Adjustment</SelectItem>
                  <SelectItem value="FINE_CHALLAN">Fine Challan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Voucher #, student, reg..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong>{items.length}</strong> of <strong>{total}</strong> vouchers
              </span>
              {selectedVoucherIds.size > 0 && (
                <Badge variant="secondary" className="text-[11px]">
                  {selectedVoucherIds.size} selected
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-7 text-xs text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table Card */}
      <Card className="border-slate-200 dark:border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-card">
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      allCurrentPageSelected
                        ? true
                        : someCurrentPageSelected
                        ? "indeterminate"
                        : false
                    }
                    onCheckedChange={(checked) => handleToggleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold">Voucher #</TableHead>
                <TableHead className="text-xs font-semibold">Student Name</TableHead>
                <TableHead className="text-xs font-semibold">Roll / Reg</TableHead>
                <TableHead className="text-xs font-semibold">Class / Section</TableHead>
                <TableHead className="text-xs font-semibold">Billing Period</TableHead>
                <TableHead className="text-xs font-semibold">Type</TableHead>
                <TableHead className="text-xs font-semibold">Due Date</TableHead>
                <TableHead className="text-xs font-semibold text-right">Net Payable</TableHead>
                <TableHead className="text-xs font-semibold text-right">Paid Amount</TableHead>
                <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchersQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-40 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Loading fee vouchers...</p>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-36 text-center text-muted-foreground text-xs">
                    No fee vouchers found matching the selected filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((voucher) => {
                  const isChecked = selectedVoucherIds.has(voucher.sfcId);
                  const { netPayable, amountPaid, outstanding, isOverdue } =
                    getVoucherMetrics(voucher);

                  const student = voucher.StudentClass?.Students;
                  const grade = voucher.StudentClass?.Grades;
                  const isSplitLocked = !!voucher.isSplitLocked;
                  const isMergedChild = voucher.paymentStatus === "LOCKED_MERGED";
                  const isPaid = voucher.paymentStatus === "PAID";
                  const isCancelled = voucher.paymentStatus === "CANCELLED";

                  return (
                    <TableRow
                      key={voucher.sfcId}
                      className={cn(
                        "hover:bg-slate-50/70 dark:hover:bg-card/60 transition-colors",
                        isChecked && "bg-emerald-500/5",
                        isCancelled && "opacity-50"
                      )}
                    >
                      <TableCell className="w-10">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleRow(voucher.sfcId)}
                        />
                      </TableCell>

                      {/* Voucher # */}
                      <TableCell className="text-xs font-mono font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isSplitLocked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                          {isMergedChild && <Lock className="h-3 w-3 text-slate-400 shrink-0" />}
                          <span>{voucher.voucherNumber}</span>
                        </div>
                      </TableCell>

                      {/* Student Name */}
                      <TableCell className="text-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {student?.studentName || "N/A"}
                        </p>
                        {student?.fatherName && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            S/D/O {student.fatherName}
                          </p>
                        )}
                      </TableCell>

                      {/* Roll / Reg */}
                      <TableCell className="text-xs whitespace-nowrap">
                        <span className="font-mono">{student?.registrationNumber || "—"}</span>
                        {student?.admissionNumber && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            (Adm: {student.admissionNumber})
                          </span>
                        )}
                      </TableCell>

                      {/* Class / Section */}
                      <TableCell className="text-xs whitespace-nowrap">
                        {grade ? `${grade.grade} - ${grade.section}` : "N/A"}
                      </TableCell>

                      {/* Billing Period */}
                      <TableCell className="text-xs whitespace-nowrap">
                        {MONTH_OPTIONS.find((m) => m.value === voucher.month.toString())?.label.split(" ")[0]}{" "}
                        {voucher.year}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          (Inst. {voucher.installmentNo})
                        </span>
                      </TableCell>

                      {/* Voucher Type */}
                      <TableCell className="text-xs whitespace-nowrap">
                        {renderTypeBadge(voucher.voucherType, voucher.subInstallmentIndex)}
                      </TableCell>

                      {/* Due Date */}
                      <TableCell className="text-xs whitespace-nowrap">
                        {voucher.dueDate ? (
                          <span
                            className={cn(
                              isOverdue && "text-red-600 dark:text-red-400 font-semibold"
                            )}
                          >
                            {format(new Date(voucher.dueDate), "dd MMM yyyy")}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>

                      {/* Net Payable */}
                      <TableCell className="text-xs font-bold text-right text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        Rs. {netPayable.toLocaleString()}
                      </TableCell>

                      {/* Paid Amount */}
                      <TableCell className="text-xs text-right whitespace-nowrap">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Rs. {amountPaid.toLocaleString()}
                        </span>
                        {outstanding > 0 && amountPaid > 0 && (
                          <p className="text-[10px] text-amber-600">
                            Bal: Rs. {outstanding.toLocaleString()}
                          </p>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-xs text-center whitespace-nowrap">
                        {renderStatusBadge(voucher.paymentStatus, isOverdue)}
                      </TableCell>

                      {/* Quick Actions Dropdown */}
                      <TableCell className="text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 text-xs">
                            {/* View / Print Challan */}
                            <DropdownMenuItem
                              onClick={() => setPrintTargetVoucherIds([voucher.sfcId])}
                              className="gap-2 cursor-pointer"
                            >
                              <Printer className="h-3.5 w-3.5 text-slate-500" />
                              View / Print Challan
                            </DropdownMenuItem>

                            {/* Record Payment */}
                            <DropdownMenuItem
                              disabled={isPaid || isSplitLocked || isMergedChild || isCancelled}
                              onClick={() =>
                                setRecordPaymentTarget({
                                  sfcId: voucher.sfcId,
                                  voucherNumber: voucher.voucherNumber,
                                  studentName: student?.studentName,
                                  registrationNumber: student?.registrationNumber,
                                  className: grade ? `${grade.grade} - ${grade.section}` : undefined,
                                  netPayable,
                                  amountPaid,
                                  paymentStatus: voucher.paymentStatus,
                                  voucherType: voucher.voucherType,
                                  isSplitLocked,
                                  dueDate: voucher.dueDate,
                                })
                              }
                              className="gap-2 cursor-pointer"
                            >
                              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                              Record Payment
                            </DropdownMenuItem>

                            {/* Split / Sub-Installments */}
                            <DropdownMenuItem
                              disabled={isMergedChild || isCancelled || (isPaid && !isSplitLocked)}
                              onClick={() =>
                                setSplitVoucherTarget({
                                  sfcId: voucher.sfcId,
                                  voucherNumber: voucher.voucherNumber,
                                  studentName: student?.studentName,
                                  registrationNumber: student?.registrationNumber,
                                  className: grade ? `${grade.grade} - ${grade.section}` : undefined,
                                  netPayable,
                                  amountPaid,
                                  paymentStatus: voucher.paymentStatus,
                                  isSplitLocked,
                                  dueDate: voucher.dueDate,
                                  subInstallments: voucher.subInstallments?.map((s) => ({
                                    sfcId: s.sfcId,
                                    voucherNumber: s.voucherNumber,
                                    subInstallmentIndex: s.subInstallmentIndex,
                                    amountPaid: s.amountPaid,
                                    paymentStatus: s.paymentStatus,
                                    dueDate: s.dueDate,
                                  })),
                                })
                              }
                              className="gap-2 cursor-pointer"
                            >
                              <Split className="h-3.5 w-3.5 text-purple-600" />
                              {isSplitLocked ? "Manage Sub-Installments" : "Split Installment"}
                            </DropdownMenuItem>

                            {/* Principal Exemption */}
                            <DropdownMenuItem
                              disabled={isPaid || isSplitLocked || isMergedChild || isCancelled}
                              onClick={() =>
                                setExemptionTarget({
                                  sfcId: voucher.sfcId,
                                  voucherNumber: voucher.voucherNumber,
                                  studentName: student?.studentName,
                                  registrationNumber: student?.registrationNumber,
                                  className: grade ? `${grade.grade} - ${grade.section}` : undefined,
                                  baseFee: voucher.fees?.tuitionFee ?? 0,
                                  concessionCategory: voucher.concessionCategory,
                                  concessionAmount: voucher.concessionAmount,
                                  exemptionAmount: voucher.exemptionAmount,
                                  exemptionReason: voucher.exemptionReason,
                                  exemptionApprovedBy: voucher.exemptionApprovedBy,
                                  discount: voucher.discount,
                                  lateFee: voucher.lateFee,
                                  netPayable,
                                  paymentStatus: voucher.paymentStatus,
                                  isSplitLocked,
                                })
                              }
                              className="gap-2 cursor-pointer"
                            >
                              <Award className="h-3.5 w-3.5 text-blue-600" />
                              Principal Exemption
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Cancel Voucher */}
                            <DropdownMenuItem
                              disabled={amountPaid > 0 || isPaid || isSplitLocked || isMergedChild || isCancelled}
                              onClick={() => {
                                setCancelTargetVoucher({
                                  id: voucher.sfcId,
                                  voucherNumber: voucher.voucherNumber,
                                });
                                setCancelReason("");
                              }}
                              className="gap-2 text-red-600 hover:text-red-700 cursor-pointer"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Cancel Voucher
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Toolbar Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t bg-slate-50/50 dark:bg-card/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(parseInt(val, 10));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || vouchersQuery.isLoading}
                className="h-7 w-7"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || vouchersQuery.isLoading}
                className="h-7 w-7"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 1. Generate Vouchers Dialog */}
      <GenerateVouchersDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        defaultSessionId={sessionId !== "ALL" ? sessionId : undefined}
        defaultClassId={classId !== "ALL" ? classId : undefined}
        defaultYear={year}
      />

      {/* 2. Split Voucher Dialog */}
      <SplitVoucherDialog
        open={!!splitVoucherTarget}
        onOpenChange={(open) => !open && setSplitVoucherTarget(null)}
        voucher={splitVoucherTarget}
      />

      {/* 3. Merge Vouchers Dialog */}
      <MergeVouchersDialog
        open={isMergeOpen}
        onOpenChange={setIsMergeOpen}
        vouchers={selectedMergeVouchers}
      />

      {/* 4. Record Payment Dialog */}
      <RecordPaymentDialog
        open={!!recordPaymentTarget}
        onOpenChange={(open) => !open && setRecordPaymentTarget(null)}
        voucher={recordPaymentTarget}
      />

      {/* 5. Challan Validity Manager Modal */}
      <ChallanValidityManager
        isDialog={true}
        open={isValidityOpen}
        onOpenChange={setIsValidityOpen}
        defaultSessionId={sessionId !== "ALL" ? sessionId : undefined}
        defaultGradeId={classId !== "ALL" ? classId : undefined}
        year={year}
      />

      {/* 6. Principal Exemption Dialog */}
      <PrincipalExemptionDialog
        open={!!exemptionTarget}
        onOpenChange={(open) => !open && setExemptionTarget(null)}
        voucher={exemptionTarget}
      />

      {/* 7. Cancellation Confirmation Dialog */}
      <Dialog
        open={!!cancelTargetVoucher}
        onOpenChange={(open) => !open && setCancelTargetVoucher(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Cancel Voucher #{cancelTargetVoucher?.voucherNumber}
            </DialogTitle>
            <DialogDescription>
              This will revoke this unpaid fee voucher. The action is logged and cannot be undone once cancelled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="cancel-reason" className="text-xs font-semibold">
              Cancellation Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Student transferred, duplicate voucher generated, erroneous fee assignment"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTargetVoucher(null)}
              disabled={cancelMutation.isPending}
            >
              Keep Voucher
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelMutation.isPending || cancelReason.trim().length < 3}
              onClick={handleConfirmCancel}
              className="gap-2"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 8. Single / Bulk Printable Challan Overlay */}
      {printTargetVoucherIds && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs print:static print:bg-white print:overflow-visible">
          {voucherPrintQuery.isLoading ? (
            <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          ) : voucherPrintQuery.data ? (
            (() => {
              const resData = voucherPrintQuery.data;
              // Normalize vouchers array:
              // If multiple voucherIds were passed, resData has shape { vouchers: PrintableVoucherData[], bankDetails }
              // If single voucherId was passed, resData is a single PrintableVoucherData
              const printableList: PrintableVoucherData[] =
                "vouchers" in resData && Array.isArray((resData as any).vouchers)
                  ? (resData as any).vouchers
                  : [resData as any];

              return (
                <VoucherPrintSheet
                  vouchers={printableList}
                  onClose={() => setPrintTargetVoucherIds(null)}
                  title={
                    printableList.length === 1
                      ? `Fee Challan — ${printableList[0]?.voucherNumber || ""}`
                      : `Batch Fee Challans Print Sheet (${printableList.length} Vouchers)`
                  }
                />
              );
            })()
          ) : (
            <div className="flex h-screen flex-col items-center justify-center p-6 text-white">
              <p className="mb-4">Failed to load fee challan data.</p>
              <Button
                variant="secondary"
                onClick={() => setPrintTargetVoucherIds(null)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default MonthlyVoucherHub;
